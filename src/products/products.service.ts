import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCartDTO, CreateProductDTO, CreateWishlistDTO, ProductFilteringDTO } from './dto/create-product.dto';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';
import axios from 'axios';
import * as cheerio from "cheerio"

@Injectable()
export class ProductsService {
    constructor (
        private prisma: PrismaService,
        private authService: AuthService,
        private mailService: MailService
    ) {}

    async create(data: CreateProductDTO) {
        const {name, category, description, price, stock, warranty, ram, storage, processor, display, width, height, pictures, colors} = data
        try {
            await this.prisma.products.create(
                { 
                    data: {
                        name: name || "",
                        category: category || 0,
                        price: price || 0,
                        description: description || "",
                        stock: stock || "",
                        warranty: warranty || "", 
                        ram: ram || 0,
                        storage: storage || 0,
                        processor: processor || "",
                        display: display || "",
                        width: width || 0,
                        height: height || 0,
                        pictures: {
                            create: pictures
                        },
                        colors: {
                            create: colors
                        }
                    } 
                } as any
            )
        } catch (err) {
            console.log(err)
            throw new InternalServerErrorException("Failed to create product")
        }
    }

    async findAllProducts() {
        return this.prisma.products.findMany({
            include: {
                categoryRef: true,
                pictures: true,
                colors: true
            }
        })
    }

    async findOneProduct(id: number) {
        return this.prisma.products.findFirst({
            include: {
                categoryRef: true,
                pictures: true,
                colors: true
            },
            where: {id}
        })
    }

    async deleteProduct(id: number) {
        const pictures = await this.prisma.pictures.findMany({
            where: {product: id}
        })
        const colors = await this.prisma.colors.findMany({
            where: { product: id}
        })
        for (let i = 0; i < pictures.length; i++) {
            await this.prisma.pictures.delete({
                where: {id: pictures[i].id}
            })
        }
        for (let i = 0; i < colors.length; i++) {
            await this.prisma.colors.delete({
                where: {id: colors[i].id}
            })
        }
        await this.prisma.products.delete({where: {id}}) 
    }

    async filterProducts(params: ProductFilteringDTO) {
        const {name, category, minPrice, maxPrice, sort} = params
        const where: any = {}
        let orderBy: any = {}

        if (name) {
            where.name = {
                contains: name,
            }
        }

        if (category) {
            const categoryArr = category.split(",")
            where.categoryRef = {
                name: {
                    in: categoryArr
                }
            }
        }

        if (sort) {
            const sortArr = sort.split(",")
            orderBy = {
                [sortArr[0]]: sortArr[1]
            }
        }

        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = Number(minPrice)
            if (maxPrice) where.price.lte = Number(maxPrice)
        }
        return this.prisma.products.findMany({
            where,
            orderBy,
            include: {
                pictures: true
            }
        })
    }

    async createCategory(data: Prisma.CategoryCreateInput) {
        try {
            await this.prisma.category.create({data: {
                name: data.name
            }})
        } catch (err) {
            console.log(err)
            throw new InternalServerErrorException("Failed to create category")
        }
    }

    async getCategories() {
        try {
            return this.prisma.category.findMany({
                include: {
                    products: {
                        include: {
                            pictures: true
                        }
                    }
                }
            })
        } catch (err ) {
            console.log(err)
        }
    }

    async handleCart(data: CreateCartDTO) {
        const {token, product, stock, color} = data
        const user = await this.authService.getEmailFromToken(token)
        const cart = await this.prisma.cart.findFirst({
            where: {product, user: user.sub, color}
        })

        try {
            if (cart?.id) {
                await this.prisma.cart.update({
                    where: {id: cart.id},
                    data: {stock}
                })
            }
            else {
                await this.prisma.cart.create({
                data: {user: user.sub, product, stock, color}
            })
            }
        } catch (err) {
            console.log(err)
            throw new InternalServerErrorException("Item failed to add on cart")
        }
    }

    async getUserCart(token: string) {
        const user = await this.authService.getEmailFromToken(token)
        
        try {
            const cart = await this.prisma.cart.findMany({
                include: {
                    userRef: true,
                    productRef: {
                        include: {
                            pictures: true,
                            colors: true,
                            categoryRef: true
                        }
                    }
                    
                },
                where: {user: user.sub}
            })
            return cart
        } catch (err) {
            console.log(err)
        }
    }

    async deleteItemFromCart(id: number) {
        try {
            await this.prisma.cart.delete({
                where: {id},
            })
        } catch (err) { 
            console.log(err)
            throw new InternalServerErrorException("Item failed to delete")
        }
    }

    async placeOrder(data: Prisma.OrderCreateInput) {
        const {firstName, lastName, email} = data
        try {
            await this.prisma.order.create({
                data
            })
            await this.mailService.sendEmail(email, `${firstName} ${lastName}`, "Order recieved", 
                "messageToCostumer")
            await this.mailService.sendEmail("deanmaja6@gmail.com", `${firstName} ${lastName}`, "new order placed", 
                "orderToOwner")
        } catch (err) {
            console.log(err)
            throw new InternalServerErrorException("Failed to place order")
        }
    }

    async getOrders() {
        try {
            return this.prisma.order.findMany({
                include: {
                    items: true
                }
            })
        } catch (err) {
            console.log(err)
        }
    }

    async handleWishlist(data: CreateWishlistDTO) {
        const {token, product} = data
        try {
            const user = await this.authService.getEmailFromToken(token)
            const wishlist = await this.prisma.wishlist.findFirst({
                where: {user: user.sub, product}
            })
            if (wishlist?.id) {
                await this.prisma.wishlist.delete({
                    where: {id: wishlist.id}
                })
                return "Product removed from your wishlist"
            }
            else {
                const wishlist = await this.prisma.wishlist.create({
                    data: {user: user.sub, product}
                })
                if (wishlist.id) return "Product added to your wishlist"
            }
        } catch (err) {
            console.log(err)
            throw new InternalServerErrorException("Product failed to add to your wishlist")
        }
    }

    async getCurrWishlist(token: string, product: number) {
        try {
            const user = await this.authService.getEmailFromToken(token)
            return this.prisma.wishlist.findFirst({
                where: {user: user.sub, product}
            })
        } catch (err) {
            console.log(err)
        }
    }

    async getReviews() {
        try {
            const response = await axios.get("https://www.trustpilot.com/review/samsung.com")
            const $ = cheerio.load(response.data);

            const reviews: any[] = [];
            $('.styles_reviewCard__meSdm').each((_, el) => {
                reviews.push({
                    name: $(el).find('.typography_heading-xs__osRhC').text().trim(),
                    comment: $(el).find('.typography_body-l__v5JLj').text().trim(),
                    // rating: $(el).find('[data-service-review-rating]').attr('data-service-review-rating'),
                    // date: $(el).find('time').attr('datetime'),
                }) 
            })

            return reviews
        } catch (err) {
            console.log(err)
        }
    }

    // async assignEditorPick(id: number) {
    //     await this.prisma.products.update({
    //         where: {id},
    //         data: {editorPick: }
    //     })
    // }
}

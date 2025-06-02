import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateCartDTO, CreateCategoryDTO, CreateOrderDTO, CreateProductDTO, CreateWishlistDTO, ProductFilteringDTO } from './dto/create-product.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor (private productService: ProductsService) {}
    @Post()
    async create(@Body() data: CreateProductDTO) {
        return this.productService.create(data)
    }

    @Get()
    async findProducts(@Query("id") id?: string) {
        if (id) {
            return this.productService.findOneProduct(+id);
        }
        return this.productService.findAllProducts();
    }

    @Delete(":id")
    async deleteProduct(@Param("id") id: string) {
        return this.productService.deleteProduct(+id)
    }

    @Get("/filters")
    async filterProducts(@Query() params: ProductFilteringDTO) {
        return this.productService.filterProducts(params)
    }

    @Post("category")
    async createCategory(@Body() data: CreateCategoryDTO) {
        return this.productService.createCategory(data)
    }

    @Get("category")
    async getCategories() {
        return this.productService.getCategories()
    }

    @Post("cart")
    async addToCart(@Body() data: CreateCartDTO) {
        return this.productService.handleCart(data)
    }

    @Get("cart/:token")
    async getUserCart(@Param("token") token: string) {
        return this.productService.getUserCart(token)
    }

    @Delete("cart/:id")
    async deleteItemFromCart(@Param("id") id: string) {
        console.log(id)
        return this.productService.deleteItemFromCart(+id)
    }

    @Post("order")
    async placeOrder(@Body() data: CreateOrderDTO) {
        return this.productService.placeOrder(data)
    }

    @Get("order")
    async getOrders() {
        return this.productService.getOrders()
    }

    @Post("wishlist")
    async handleWishlist(@Body() data: CreateWishlistDTO) {
        return this.productService.handleWishlist(data)
    }

    @Get("wishlist/:token/:id") 
    async getCurrWishlist(@Param("token") token: string, @Param("id") id: string) {
        return this.productService.getCurrWishlist(token, +id)
    }

    @Get('reviews')
    async getReviews() {
        return this.productService.getReviews()
    }
}

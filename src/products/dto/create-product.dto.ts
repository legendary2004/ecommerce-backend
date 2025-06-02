import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDTO {
    @ApiProperty()
    name: string;
    @ApiProperty()
    category: number;
    @ApiProperty()
    price: number;
    @ApiProperty()
    stock: number;
    @ApiProperty()
    warranty: number;
    @ApiProperty()
    @Optional()
    ram: number;
    @ApiProperty()
    @Optional()
    storage: number;
    @ApiProperty()
    @Optional()
    processor: string;
    @ApiProperty()
    @Optional()
    display: string;
    @ApiProperty()
    @Optional()
    width: number;
    @ApiProperty()
    @Optional()
    height: number;
    @ApiProperty()
    @Optional()
    description: string;
    @ApiProperty()
    pictures: CreatePictureDTO[]
    @ApiProperty()
    @Optional()
    colors: CreateColorDTO[]
    @Optional()
    categoryRef: any
}

export class CreateCategoryDTO {
    name: string;
}

export class CreateColorDTO {
    value: string;
    stockValue: number;
}

export class CreatePictureDTO {
    src: string;
}

export class CreateCartDTO {
    token: string;
    product: number;
    stock: number;
    color: string;
}

export class CreateOrderItemDTO {
    name: string;
    stock: number;
    color: string;
    price: number
}

export class CreateOrderDTO {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    country: string;
    city: string;
    zip: number;
    payment_id: string;
    total: number;
    items: {
        create: CreateOrderItemDTO
    }
}

export class CreateWishlistDTO {
    token: string;
    product: number
}

export class ProductFilteringDTO {
    @Optional()
    name: string;
    @Optional()
    category: string;
    @Optional()
    minPrice: string;
    @Optional()
    maxPrice: string;
    @Optional()
    sort: string;
}
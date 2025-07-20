import {
  IsArray,
  IsString,
  IsNumber,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  film: string;

  @IsString()
  session: string;

  @IsString()
  daytime: string;

  @IsNumber()
  row: number;

  @IsNumber()
  seat: number;

  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  tickets: CreateOrderItemDto[];

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  phone: string;
}

export class OrderResponseItemDto extends CreateOrderItemDto {
  @IsString()
  id: string;

  @IsString()
  orderId: string;
}

export class OrderResponseDto {
  @IsNumber()
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderResponseItemDto)
  items: OrderResponseItemDto[];

  @IsString()
  orderId: string;
}

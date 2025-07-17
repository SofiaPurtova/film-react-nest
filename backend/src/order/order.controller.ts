import { Controller, Post, Body } from '@nestjs/common';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';

@Controller('order')
export class OrderController {
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto): OrderResponseDto {
    return {
      total: createOrderDto.items.length,
      items: createOrderDto.items.map((item) => ({
        ...item,
        id: 'generated-id-' + Math.random().toString(36).substring(2),
      })),
    };
}
}

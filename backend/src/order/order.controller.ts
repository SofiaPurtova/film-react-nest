import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';

// Определяем интерфейс для входящего тела запроса
interface TicketOrder {
  film: string;
  session: string;
  row: number;
  seat: number;
  price: number; // Обязательное поле из CreateOrderItemDto
}

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() body: { tickets: TicketOrder[] }, // Используем TicketOrder вместо Ticket
  ): Promise<OrderResponseDto> {
    // Формируем DTO для сервиса
    const createOrderDto: CreateOrderDto = {
      items: body.tickets.map((ticket) => ({
        film: ticket.film,
        session: ticket.session,
        row: ticket.row,
        seat: ticket.seat,
        price: ticket.price, // Важно: price обязателен!
      }))
    };

    return this.orderService.createOrder(createOrderDto);
  }
}
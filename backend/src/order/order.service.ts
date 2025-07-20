import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from '../films/schemas/films.schema';
import { Order } from './schemas/order.schema';
import {
  CreateOrderDto,
  CreateOrderItemDto,
  OrderResponseDto,
  OrderResponseItemDto,
} from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<Film>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  async createOrder(order: CreateOrderDto): Promise<OrderResponseDto> {
    // 1. Сохраняем контактные данные и информацию о заказе
    const orderDocument = await this.orderModel.create({
      email: order.email,
      phone: order.phone,
      tickets: order.tickets,
      createdAt: new Date(),
    });

    // 2. Обрабатываем бронирование мест
    const results: OrderResponseItemDto[] = [];
    const ordersBySession = new Map<string, CreateOrderItemDto[]>();

    order.tickets.forEach((ticket) => {
      const key = `${ticket.film}_${ticket.session}`;
      if (!ordersBySession.has(key)) {
        ordersBySession.set(key, []);
      }
      ordersBySession.get(key).push(ticket);
    });

    for (const [key, tickets] of ordersBySession) {
      const [filmId, sessionId] = key.split('_');
      const sessionResult = await this.processSessionOrder(
        filmId,
        sessionId,
        tickets,
        orderDocument._id.toString(), // Передаем ID заказа
      );
      results.push(...sessionResult.items);
    }

    return {
      total: results.length,
      items: results,
      orderId: orderDocument._id.toString(), // Возвращаем ID заказа клиенту
    };
  }

  private async processSessionOrder(
    filmId: string,
    sessionId: string,
    items: CreateOrderItemDto[],
    orderId: string,
  ): Promise<OrderResponseDto> {
    // 1. Находим фильм и сеанс
    const film = await this.filmModel.findOne({ id: filmId }).exec();
    if (!film) {
      throw new BadRequestException(`Film with ID ${filmId} not found`);
    }

    const session = film.schedule.find((s) => s.id === sessionId);
    if (!session) {
      throw new BadRequestException(`Session with ID ${sessionId} not found`);
    }

    // 2. Проверяем корректность мест
    this.validateSeats(items, session);

    // 3. Проверяем занятость мест
    const conflicts = this.findSeatConflicts(items, session.taken);
    if (conflicts.length > 0) {
      throw new ConflictException(
        `Seats already taken: ${conflicts.join(', ')}`,
      );
    }

    // 4. Резервируем места
    const newTakenSeats = items.map((item) => ({
      seat: `${item.row}:${item.seat}`,
      orderId, // Связываем место с заказом
    }));

    // 5. Обновляем документ в MongoDB
    await this.filmModel.updateOne(
      { _id: filmId, 'schedule.id': sessionId },
      { $push: { 'schedule.$.taken': { $each: newTakenSeats } } },
    );

    // 6. Формируем ответ
    return {
      total: items.length,
      items: items.map((item) => ({
        ...item,
        id: this.generateOrderId(),
        orderId, // Добавляем ID заказа в ответ
      })),
      orderId,
    };
  }

  // ... остальные методы (validateSeats, findSeatConflicts, generateOrderId) без изменений

  private validateSeats(
    items: CreateOrderItemDto[],
    session: { rows: number; seats: number },
  ): void {
    // Проверка на дубликаты в запросе
    const uniqueSeats = new Set(items.map((i) => `${i.row}:${i.seat}`));
    if (uniqueSeats.size !== items.length) {
      throw new BadRequestException('Duplicate seats in request');
    }

    // Проверка выхода за границы зала
    const invalidSeats = items.filter(
      (item) =>
        item.row > session.rows ||
        item.seat > session.seats ||
        item.row < 1 ||
        item.seat < 1,
    );

    if (invalidSeats.length > 0) {
      throw new BadRequestException(
        `Invalid seats: ${invalidSeats.map((s) => `${s.row}:${s.seat}`).join(', ')}`,
      );
    }
  }

  private findSeatConflicts(
    items: CreateOrderItemDto[],
    takenSeats: string[],
  ): string[] {
    const takenSet = new Set(takenSeats);
    return items
      .map((item) => `${item.row}:${item.seat}`)
      .filter((seat) => takenSet.has(seat));
  }

  private generateOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }
}

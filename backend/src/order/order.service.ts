import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
  LoggerService,
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
    @Inject('LoggerService') private readonly logger: LoggerService,
  ) {}

  async createOrder(order: CreateOrderDto): Promise<OrderResponseDto> {
    this.logger.log('Creating new order', 'OrderService', {
      email: order.email,
      phone: order.phone,
      ticketCount: order.tickets.length,
    });

    // 1. Сохраняем контактные данные и информацию о заказе
    const orderDocument = await this.orderModel.create({
      email: order.email,
      phone: order.phone,
      tickets: order.tickets,
      createdAt: new Date(),
    });

    this.logger.log(`Order document created with ID: ${orderDocument._id}`, 'OrderService');


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

    this.logger.log(`Processing ${ordersBySession.size} sessions`, 'OrderService');

    for (const [key, tickets] of ordersBySession) {
      const [filmId, sessionId] = key.split('_');

      this.logger.log(`Processing session: ${key} with ${tickets.length} tickets`, 'OrderService', {
        filmId,
        sessionId,
        ticketCount: tickets.length,
      });

      const sessionResult = await this.processSessionOrder(
        filmId,
        sessionId,
        tickets,
        orderDocument._id.toString(), // Передаем ID заказа
      );
      results.push(...sessionResult.items);
    }

    this.logger.log(`Order completed successfully. Total tickets: ${results.length}`, 'OrderService', {
      orderId: orderDocument._id.toString(),
    });

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
    this.logger.log(`Processing session order for film: ${filmId}, session: ${sessionId}`, 'OrderService', {
      itemCount: items.length,
      orderId,
    });

    // 1. Находим фильм и сеанс
    const film = await this.filmModel.findOne({ id: filmId }).exec();
    if (!film) {
      this.logger.error(`Film not found: ${filmId}`, 'OrderService');
      throw new BadRequestException(`Film with ID ${filmId} not found`);
    }

    const session = film.schedule.find((s) => s.id === sessionId);
    if (!session) {
      this.logger.error(`Session not found: ${sessionId}`, 'OrderService', { filmId });
      throw new BadRequestException(`Session with ID ${sessionId} not found`);
    }

    // 2. Проверяем корректность мест
    this.validateSeats(items, session);

    // 3. Проверяем занятость мест
    const conflicts = this.findSeatConflicts(items, session.taken);
    if (conflicts.length > 0) {
      this.logger.warn(`Seat conflicts detected: ${conflicts.join(', ')}`, 'OrderService', {
        filmId,
        sessionId,
        conflicts,
      });
      throw new ConflictException(
        `Seats already taken: ${conflicts.join(', ')}`,
      );
    }

    // 4. Резервируем места
    const newTakenSeats = items.map((item) => ({
      seat: `${item.row}:${item.seat}`,
      orderId, // Связываем место с заказом
    }));

    this.logger.log(`Reserving ${newTakenSeats.length} seats`, 'OrderService', {
      seats: newTakenSeats.map(s => s.seat),
    });

    // 5. Обновляем документ в MongoDB
    await this.filmModel.updateOne(
      { _id: filmId, 'schedule.id': sessionId },
      { $push: { 'schedule.$.taken': { $each: newTakenSeats } } },
    );

    this.logger.log(`Seats reserved successfully for session: ${sessionId}`, 'OrderService');

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

    this.logger.debug('Validating seats', 'OrderService', {
      itemCount: items.length,
      sessionRows: session.rows,
      sessionSeats: session.seats,
    });

    // Проверка на дубликаты в запросе
    const uniqueSeats = new Set(items.map((i) => `${i.row}:${i.seat}`));
    if (uniqueSeats.size !== items.length) {
      this.logger.error('Duplicate seats detected in request', 'OrderService');
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
      this.logger.error('Invalid seats detected', 'OrderService', {
        invalidSeats: invalidSeats.map((s) => `${s.row}:${s.seat}`),
      });
      throw new BadRequestException(
        `Invalid seats: ${invalidSeats.map((s) => `${s.row}:${s.seat}`).join(', ')}`,
      );
    }
    this.logger.debug('Seat validation passed', 'OrderService');
  }

  private findSeatConflicts(
    items: CreateOrderItemDto[],
    takenSeats: string[],
  ): string[] {
    this.logger.debug('Checking for seat conflicts', 'OrderService', {
      requestedSeats: items.map(item => `${item.row}:${item.seat}`),
      takenSeatsCount: takenSeats.length,
    });

    const takenSet = new Set(takenSeats);
    const conflicts = items
      .map((item) => `${item.row}:${item.seat}`)
      .filter((seat) => takenSet.has(seat));

    if (conflicts.length > 0) {
      this.logger.debug('Seat conflicts found', 'OrderService', { conflicts });
    }

    return conflicts;
  }

  private generateOrderId(): string {
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.logger.debug(`Generated order ID: ${orderId}`, 'OrderService');
    return orderId;
  }
}

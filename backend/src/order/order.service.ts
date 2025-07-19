import {
  Injectable,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from '../films/schemas/films.schema';
import {
  CreateOrderDto,
  CreateOrderItemDto,
  OrderResponseDto,
  OrderResponseItemDto
} from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<Film>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    // Группируем заказы по filmId и sessionId для пакетной обработки
    const ordersBySession = new Map<string, CreateOrderItemDto[]>();

    createOrderDto.items.forEach((item) => {
      const key = `${item.film}_${item.session}`;
      if (!ordersBySession.has(key)) {
        ordersBySession.set(key, []);
      }
      ordersBySession.get(key).push(item);
    });

    const results: OrderResponseItemDto[] = [];

    // Обрабатываем каждую группу заказов отдельно
    for (const [key, items] of ordersBySession) {
      const [filmId, sessionId] = key.split('_');
      const sessionResult = await this.processSessionOrder(
        filmId,
        sessionId,
        items);
      results.push(...sessionResult.items);
    }

    return {
      total: results.length,
      items: results,
    };
  }

  private async processSessionOrder(
    filmId: string,
    sessionId: string,
    items: CreateOrderItemDto[],
  ): Promise<OrderResponseDto> {
    // 1. Находим фильм и сеанс
    const film = await this.filmModel.findOne({ id: filmId }).exec();
    if (!film) {
      throw new BadRequestException(`Film with ID ${filmId} not found`);
    }

    const session = film.schedules.find((s) => s.id === sessionId);
    if (!session) {
      throw new BadRequestException(`Session with ID ${sessionId} not found`);
    }

    // 2. Проверяем корректность мест
    this.validateSeats(items, session);

    // 3. Проверяем занятость мест
    const conflicts = this.findSeatConflicts(items, session.taken);
    if (conflicts.length > 0) {
      throw new ConflictException(
        `Seats already taken: ${conflicts.join(', ')}`
      );
    }

    // 4. Резервируем места
    const newTakenSeats = items.map((item) => `${item.row}:${item.seat}`);
    const updatedTaken = [...session.taken, ...newTakenSeats];

    // 5. Обновляем документ в MongoDB
    await this.filmModel.updateOne(
      { id: filmId, 'schedules.id': sessionId },
      { $set: { 'schedules.$.taken': updatedTaken } }
    );

    // 6. Формируем ответ
    return {
      total: items.length,
      items: items.map((item) => ({
        ...item,
        id: this.generateOrderId(),
      })),
    };
  }

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
        item.seat < 1
    );

    if (invalidSeats.length > 0) {
      throw new BadRequestException(
        `Invalid seats: ${invalidSeats.map((s) => `${s.row}:${s.seat}`).join(', ')}`
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
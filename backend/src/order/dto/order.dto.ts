//TODO реализовать DTO для /orders
export class CreateOrderItemDto {
  film: string;     // filmId
  session: string;  // sessionId
  daytime: Date;    // или string
  row: number;
  seat: number;
  price: number;
}

export class CreateOrderDto {
  items: CreateOrderItemDto[]; // Массив заказов
}

export class OrderResponseItemDto extends CreateOrderItemDto {
  id: string;
}

export class OrderResponseDto {
  total: number;
  items: OrderResponseItemDto[];
}

export class ErrorResponseDto {
  error: string;
}
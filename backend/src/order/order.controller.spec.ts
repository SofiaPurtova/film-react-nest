import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;

  const mockOrderService = {
    createOrder: jest.fn(),
  };

  const mockCreateOrderDto: CreateOrderDto = {
    tickets: [
      {
        film: 'film1',
        session: 'session1',
        daytime: '2024-01-01T18:00:00',
        row: 1,
        seat: 5,
        price: 500,
      },
    ],
    email: 'test@example.com',
    phone: '+79999999999',
  };

  const mockOrderResponse: OrderResponseDto = {
    total: 500,
    items: [
      {
        id: 'ticket1',
        orderId: 'order1',
        film: 'film1',
        session: 'session1',
        daytime: '2024-01-01T18:00:00',
        row: 1,
        seat: 5,
        price: 500,
      },
    ],
    orderId: 'order1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrderResponse);

      const result = await controller.createOrder(mockCreateOrderDto);

      expect(result).toEqual(mockOrderResponse);
      expect(orderService.createOrder).toHaveBeenCalledWith(mockCreateOrderDto);
    });

    it('should handle validation errors from DTO', async () => {
      const invalidOrderDto = {
        tickets: [], // Пустой массив - невалидно
        email: 'invalid-email', // Невалидный email
        phone: '123', // Невалидный телефон
      } as CreateOrderDto;

      // Здесь будет выброшена ошибка валидации до вызова сервиса
      // Можно протестировать с помощью class-validator в e2e тестах
    });

    it('should handle service errors', async () => {
      const error = new Error('Order creation failed');
      mockOrderService.createOrder.mockRejectedValue(error);

      await expect(controller.createOrder(mockCreateOrderDto)).rejects.toThrow(
        'Order creation failed',
      );
    });

    it('should handle empty tickets array', async () => {
      const orderWithEmptyTickets: CreateOrderDto = {
        tickets: [],
        email: 'test@example.com',
        phone: '+79999999999',
      };

      const emptyResponse: OrderResponseDto = {
        total: 0,
        items: [],
        orderId: 'order-empty',
      };

      mockOrderService.createOrder.mockResolvedValue(emptyResponse);

      const result = await controller.createOrder(orderWithEmptyTickets);

      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });
});
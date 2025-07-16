import { Controller, Post } from '@nestjs/common';

@Controller('order')
export class OrderController {
    @Post()
    createOrder() {
        return { status: 'Order created (stub)' }; // Заглушка
    }
}

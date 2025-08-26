import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { createLogger } from './logger/logger.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  //app.setGlobalPrefix('api/afisha');

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  });

  const logger = createLogger();
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();

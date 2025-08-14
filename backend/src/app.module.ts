import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import * as path from 'node:path';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configProvider } from './app.config.provider';
import { join } from 'path';
import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';
import { DatabaseModule } from './database/database.module';
import { FilmsRepositoryProvider } from './repository/repository.factory';
import { FilmsRepository } from './repository/film.repository';
import { Film, FilmSchema } from './films/schemas/films.schema';

@Module({
  imports: [
    /*MongooseModule.forRoot(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/afisha',
    ), // Подключение к БД "afisha"*/
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    // Условный импорт MongooseModule только для MongoDB
    ...(process.env.DATABASE_DRIVER === 'mongodb' 
      ? [
          MongooseModule.forRoot(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/afisha'
          )
        ]
      : []),
    // Условный импорт Mongoose моделей только для MongoDB
    ...(process.env.DATABASE_DRIVER === 'mongodb'
      ? [MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }])]
      : []),
    DatabaseModule,
    // @todo: Добавьте раздачу статических файлов из public
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
      serveStaticOptions: {
        index: false,
        setHeaders: (res) => {
          res.set('Content-Type', 'image/jpeg'); // Устанавливаем правильный MIME-тип
        },
      },
    }),
    FilmsModule,
    OrderModule,
  ],
  controllers: [],
  providers: [/*configProvider,*/ FilmsRepositoryProvider],
  exports: [FilmsRepository],
})
export class AppModule {}

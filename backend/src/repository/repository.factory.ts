import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilmsPostgreSQLRepository } from './filmPostgreSQL.repository';
import { FilmsMongoDBRepository } from './filmMongoDB.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FilmEntity } from 'src/entity/film.entity'; 
import { getModelToken, InjectModel } from '@nestjs/mongoose';
import { Film } from '../films/schemas/films.schema';
import { FilmsRepository } from './film.repository';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';

export const FilmsRepositoryProvider: Provider = {
  provide: FilmsRepository,
  useFactory: (
    configService: ConfigService,
    // Для PostgreSQL
    //@InjectRepository(FilmEntity)
    filmRepository: Repository<FilmEntity>,
    // Для MongoDB
    //@InjectModel(Film.name)
    filmModel: Model<Film>,
  ) => {
    const driver = configService.get('DATABASE_DRIVER');
    switch (driver) {
      case 'mongodb':
        return new FilmsMongoDBRepository(filmModel);
      case 'postgres':
        return new FilmsPostgreSQLRepository(filmRepository);
      default:
        throw new Error(`Unsupported database driver: ${driver}`);
    }
  },
  inject: [
    ConfigService,
    // Для PostgreSQL
    getRepositoryToken(FilmEntity),
    // Для MongoDB
    getModelToken(Film.name),
  ],
};
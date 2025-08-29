import { Injectable, LoggerService, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from './schemas/films.schema';
import { FilmsResponseDto, FilmScheduleResponseDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(
    @InjectModel(Film.name) private filmModel: Model<Film>,
    @Inject('LoggerService') private readonly logger: LoggerService,
  ) {}

  async getFilmById(id: string): Promise<Film> {
    this.logger.log(`Getting film by ID: ${id}`, 'FilmsService');

    const film = await this.filmModel.findOne({ id }).exec();

    if (!film) {
      this.logger.warn(`Film not found with ID: ${id}`, 'FilmsService');
      throw new Error('Film not found');
    }
    
    this.logger.log(`Successfully found film: ${film.title}`, 'FilmsService');
    return film;
  }

  async getAllFilms(): Promise<FilmsResponseDto> {
    this.logger.log('Getting all films', 'FilmsService');

    const films = await this.filmModel.find().exec();

    this.logger.log(`Found ${films.length} films`, 'FilmsService');

    return {
      total: films.length,
      items: films.map((film) => ({
        id: film.id,
        title: film.title,
        director: film.director,
        rating: film.rating,
        tags: film.tags,
        about: film.about,
        description: film.description,
        image: film.image,
        cover: film.cover,
      })),
    };
  }

  async getFilmSchedule(id: string): Promise<FilmScheduleResponseDto> {
    this.logger.log(`Getting schedule for film ID: ${id}`, 'FilmsService');
    
    const film = await this.filmModel.findOne({ id }).exec();
    if (!film) {
      this.logger.error(`Film not found for schedule: ${id}`, 'FilmsService');
      throw new Error('Film not found');
    }

    this.logger.log(`Found ${film.schedule.length} sessions for film: ${film.title}`, 'FilmsService');
    
    return {
      total: film.schedule.length,
      items: film.schedule.map((session) => ({
        id: session.id,
        daytime: session.daytime,
        hall: session.hall,
        rows: session.rows,
        seats: session.seats,
        price: session.price,
        taken: session.taken,
      })),
    };
  }
}

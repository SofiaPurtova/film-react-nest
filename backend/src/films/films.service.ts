import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from './schemas/films.schema';
import { FilmsResponseDto, FilmScheduleResponseDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(@InjectModel(Film.name) private filmModel: Model<Film>) {}

  async getAllFilms(): Promise<FilmsResponseDto> {
    const films = await this.filmModel.find().exec();
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
    const film = await this.filmModel.findOne({ id }).exec();
    if (!film) {
      throw new Error('Film not found');
    }
    return {
      total: film.schedules.length,
      items: film.schedules.map((session) => ({
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
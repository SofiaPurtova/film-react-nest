import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from '../films/schemas/films.schema';
import {
  FilmsResponseDto,
  FilmScheduleResponseDto
} from '../films/dto/films.dto';

@Injectable()
export class FilmsMongoDBRepository {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<Film>
) {}

  async getFilmById(id: string): Promise<Film> {
    return this.filmModel.findOne({ id }).exec();
  }

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
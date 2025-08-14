import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilmEntity } from '../entity/film.entity';
import { ScheduleEntity } from '../entity/schedule.entity';
import {
  FilmsResponseDto,
  FilmScheduleResponseDto
} from '../films/dto/films.dto';
import { FilmsRepository } from './film.repository';

@Injectable()
export class FilmsPostgreSQLRepository implements FilmsRepository {
  constructor(
    @InjectRepository(FilmEntity)
    private readonly filmRepository: Repository<FilmEntity>
  ) {}

  async getFilmById(id: string): Promise<FilmEntity> {
    return this.filmRepository.findOne({
      where: { id },
      relations: ['schedules'],
    });
  }

  async getAllFilms(): Promise<FilmsResponseDto> {
    const films = await this.filmRepository.find({
      relations: ['schedules'],
    });

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
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedules'],
    });

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
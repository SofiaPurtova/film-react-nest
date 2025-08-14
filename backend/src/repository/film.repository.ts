// films.repository.ts
import {
  FilmsResponseDto,
  FilmScheduleResponseDto
} from '../films/dto/films.dto';
import { Film } from 'src/films/schemas/films.schema';
import { FilmEntity } from 'src/entity/film.entity';

export interface FilmsRepositoryInterface {
  /**
   * Получить фильм по ID
   * @param id идентификатор фильма
   */
  getFilmById(id: string): Promise<Film | FilmEntity>;

  /**
   * Получить все фильмы
   */
  getAllFilms(): Promise<FilmsResponseDto>;

  /**
   * Получить расписание для фильма
   * @param id идентификатор фильма
   */
  getFilmSchedule(id: string): Promise<FilmScheduleResponseDto>;
}

export abstract class FilmsRepository {
  /**
   * Получить фильм по ID
   * @param id идентификатор фильма
   */
  abstract getFilmById(id: string): Promise<Film | FilmEntity>;

  /**
   * Получить все фильмы
   */
  abstract getAllFilms(): Promise<FilmsResponseDto>;

  /**
   * Получить расписание для фильма
   * @param id идентификатор фильма
   */
  abstract getFilmSchedule(id: string): Promise<FilmScheduleResponseDto>;

}
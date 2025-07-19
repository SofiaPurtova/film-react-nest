import { Controller, Get, Param } from '@nestjs/common';
import { FilmScheduleResponseDto, FilmsResponseDto } from './dto/films.dto';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}
  @Get()
  async getAllFilms(): Promise<FilmsResponseDto> {
    return this.filmsService.getAllFilms();
  }

  @Get(':id/schedule')
  async getFilmSchedule(
    @Param('id') id: string
  ): Promise<FilmScheduleResponseDto> {
    return this.filmsService.getFilmSchedule(id);
  }
}

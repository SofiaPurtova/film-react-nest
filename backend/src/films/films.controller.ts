import { Controller, Get, Param } from '@nestjs/common';
import { FilmScheduleResponseDto, FilmsResponseDto } from './dto/films.dto';

@Controller('films')
export class FilmsController {
    @Get()
    getAllFilms(): FilmsResponseDto {
        // Заглушка для GET /api/afisha/films/, возвращающая DTO-структуру
    return {
      total: 0,
      items: [
        {
          id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          rating: 0,
          director: '',
          tags: [],
          title: 'Заглушка',
          about: '',
          description: '',
          image: '',
          cover: ''
        }
      ]
    };
    }

    @Get(':id/schedule')
    getFilmSchedule(@Param('id') id: string): FilmScheduleResponseDto {
        // Заглушка для GET /api/afisha/films/:id/schedule
        return {
            total: 0,
            items: [
                {
                    id: 'session-123',
                    daytime: new Date(),
                    hall: '1',
                    rows: 10,
                    seats: 20,
                    price: 350,
                    taken: []
                }
            ]
            };
        }
}

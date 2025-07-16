import { Controller, Get, Param } from '@nestjs/common';

@Controller('films')
export class FilmsController {
    @Get()
    getAllFilms() {
        // Заглушка для GET /api/afisha/films/
        return [];
    }

    @Get(':id/schedule')
    getFilmSchedule(@Param('id') id: string) {
        // Заглушка для GET /api/afisha/films/:id/schedule
        return { id, schedule: [] };
    }
}

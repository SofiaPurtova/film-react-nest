import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { Film } from './schemas/films.schema';
import { FilmsResponseDto, FilmScheduleResponseDto } from './dto/films.dto';

describe('FilmsController', () => {
  let controller: FilmsController;
  let filmsService: FilmsService;

  const mockFilmsService = {
    getAllFilms: jest.fn(),
    getFilmById: jest.fn(),
    getFilmSchedule: jest.fn(),
  };

  const mockFilm: Film = {
    id: '1',
    rating: 8.5,
    director: 'Режиссер',
    tags: ['драма', 'комедия'],
    title: 'Название фильма',
    about: 'Краткое описание',
    description: 'Полное описание',
    image: 'image.jpg',
    cover: 'cover.jpg',
  } as Film;

  const mockFilmsResponse: FilmsResponseDto = {
    total: 1,
    items: [mockFilm],
  };

  const mockScheduleResponse: FilmScheduleResponseDto = {
    total: 2,
    items: [
      {
        id: 'session1',
        daytime: new Date('2024-01-01T18:00:00'),
        hall: 'Зал 1',
        rows: 10,
        seats: 150,
        price: 500,
        taken: ['1:1', '1:2'],
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    filmsService = module.get<FilmsService>(FilmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFilms', () => {
    it('should return all films', async () => {
      mockFilmsService.getAllFilms.mockResolvedValue(mockFilmsResponse);

      const result = await controller.getAllFilms();

      expect(result).toEqual(mockFilmsResponse);
      expect(filmsService.getAllFilms).toHaveBeenCalled();
    });

    it('should handle errors from service', async () => {
      const error = new Error('Service error');
      mockFilmsService.getAllFilms.mockRejectedValue(error);

      await expect(controller.getAllFilms()).rejects.toThrow('Service error');
    });
  });

  describe('getFilmById', () => {
    it('should return film by id', async () => {
      mockFilmsService.getFilmById.mockResolvedValue(mockFilm);

      const result = await controller.getFilmById('1');

      expect(result).toEqual(mockFilm);
      expect(filmsService.getFilmById).toHaveBeenCalledWith('1');
    });

    it('should handle film not found', async () => {
      mockFilmsService.getFilmById.mockResolvedValue(null);

      const result = await controller.getFilmById('999');

      expect(result).toBeNull();
    });
  });

  describe('getFilmSchedule', () => {
    it('should return film schedule', async () => {
      mockFilmsService.getFilmSchedule.mockResolvedValue(mockScheduleResponse);

      const result = await controller.getFilmSchedule('1');

      expect(result).toEqual(mockScheduleResponse);
      expect(filmsService.getFilmSchedule).toHaveBeenCalledWith('1');
    });

    it('should handle empty schedule', async () => {
      const emptySchedule: FilmScheduleResponseDto = {
        total: 0,
        items: [],
      };
      mockFilmsService.getFilmSchedule.mockResolvedValue(emptySchedule);

      const result = await controller.getFilmSchedule('2');

      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });
});
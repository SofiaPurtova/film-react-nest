//TODO описать DTO для запросов к /films
export class FilmDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  title: string;
  about: string;
  description: string;
  image: string;
  cover: string;
}

export class FilmsResponseDto {
  total: number;
  items: FilmDto[];
}

export class SessionDto {
  id: string;
  daytime: Date;  // или string, если не будет преобразования
  hall: string;
  rows: number;
  seats: number;
  price: number;
  taken: string[]; // формат "ряд:место"
}

export class FilmScheduleResponseDto {
  total: number;
  items: SessionDto[];
}
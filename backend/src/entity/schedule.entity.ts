import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FilmEntity } from './film.entity';

@Entity()
export class ScheduleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  daytime: Date;

  @Column()
  hall: string;

  @Column()
  rows: number;

  @Column()
  seats: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column('text', { array: true, default: [] })
  taken: string[];

  @ManyToOne(() => FilmEntity, (film) => film.schedules)
  film: FilmEntity;
}
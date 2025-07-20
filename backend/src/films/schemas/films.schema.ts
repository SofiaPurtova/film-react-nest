import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Film extends Document {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  director: string;

  @Prop()
  rating: number;

  @Prop([String])
  tags: string[];

  @Prop()
  about: string;

  @Prop()
  description: string;

  @Prop()
  image: string; // Путь к афише (например, '/content/afisha/image.jpg')

  @Prop()
  cover: string;

  @Prop({
    type: [
      {
        id: String,
        daytime: Date,
        hall: String,
        rows: Number,
        seats: Number,
        price: Number,
        taken: [String], // Формат "ряд:место" (например, "A:1")
      },
    ],
  })
  schedule: {
    id: string;
    daytime: Date;
    hall: string;
    rows: number;
    seats: number;
    price: number;
    taken: string[];
  }[];
}

export const FilmSchema = SchemaFactory.createForClass(Film);

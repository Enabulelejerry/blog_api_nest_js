import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be an empty string!' })
  title: string;
  @IsOptional()
  description: string;
  @IsOptional()
  body: string;
}

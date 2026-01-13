import { UserEntity } from '@/user/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/createArticle.dto';
import { User } from '@/user/decorator/user.decorator';
import { ArticleService } from './article.service';
import { UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthGuard } from '@/user/guards/auth.guard';
import { IArticleResponse } from './types/articlesResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  async createdArticle(
    @User() user: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<IArticleResponse> {
    const newArticle = await this.articleService.createArticle(
      user,
      createArticleDto,
    );
    return this.articleService.generateArticleResponse(newArticle);
  }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string): Promise<IArticleResponse> {
    const article = await this.articleService.getSingleArticle(slug);
    return this.articleService.generateArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
  ) {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }
}

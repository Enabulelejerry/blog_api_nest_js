import { UserEntity } from '@/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleEntity } from './article.entity';
import slugify from 'slugify';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { IArticleResponse } from './types/articlesResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRespository: Repository<ArticleEntity>,
  ) {}

  async createArticle(
    user: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    console.log(user);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.generateSlug(article.title);
    article.author = user;
    return await this.articleRespository.save(article);
  }

  async getSingleArticle(slug: string): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    return article;
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== currentUserId) {
      throw new HttpException(
        'You are not authorized for this action',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.articleRespository.delete({ slug });
  }

  generateSlug(title: string): string {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    return `${slugify(title, { lower: true })}-${id}`;
  }
  generateArticleResponse(article: ArticleEntity): IArticleResponse {
    return {
      article,
    };
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRespository.findOne({
      where: {
        slug,
      },
    });

    if (!article) {
      throw new HttpException('Article is not found', HttpStatus.NOT_FOUND);
    }
    return article;
  }
}

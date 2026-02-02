import { UserEntity } from '@/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleEntity } from './article.entity';
import slugify from 'slugify';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { IArticleResponse } from './types/articleResponse.interface';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { IArticlesResponse } from './types/articlesResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRespository: Repository<ArticleEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // async findAll(query: any) {
  //   const queryBuilder = this.articleRespository
  //     .createQueryBuilder('articles')
  //     .leftJoinAndSelect('articles.author', 'author');

  //   queryBuilder.orderBy('articles.createdAt', 'DESC');
  //   const articles = await queryBuilder.getMany();
  //   const articlesCount = await queryBuilder.getCount();
  //   return { articles, articlesCount };
  // }

  async findAll(query: any): Promise<IArticlesResponse> {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const qb = this.articleRespository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .orderBy('articles.createdAt', 'DESC');

    // ✅ Search (example: title/body)
    if (query.search) {
      qb.andWhere(
        '(articles.title ILIKE :search OR articles.body ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // ✅ Filter by author (example: authorId)
    if (query.authorId) {
      qb.andWhere('author.id = :authorId', { authorId: query.authorId });
    }

    // ✅ Filter by tag (example: tag)
    if (query.tag) {
      qb.andWhere('articles.tagList = :tag', { tag: query.tag });
    }

    qb.skip(skip).take(limit);

    const [articles, articlesCount] = await qb.getManyAndCount();

    return { articles, articlesCount, page, limit };
  }

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

  async addToFavoriteArticle(
    currentUserId: number,
    slug: string,
  ): Promise<IArticleResponse> {
    const user = await this.userRepository.findOne({
      where: {
        id: currentUserId,
      },
      relations: ['favorites'],
    });

    if (!user) {
      throw new HttpException(
        `User with ID ${currentUserId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const currentArticles = await this.findBySlug(slug);
    const isNotFavorite = !user?.favorites.find(
      (article) => article.slug === currentArticles.slug,
    );

    if (isNotFavorite) {
      currentArticles.favoritesCount++;
      user?.favorites.push(currentArticles);
      await this.articleRespository.save(currentArticles);
      await this.userRepository.save(user);
    }

    return this.generateArticleResponse(currentArticles);
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
  async updateArticle(
    slug: string,
    currentUserId: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    if (article.author.id !== currentUserId) {
      throw new HttpException(
        'You are not authorized for this action',
        HttpStatus.FORBIDDEN,
      );
    }

    if (updateArticleDto.title) {
      article.slug = this.generateSlug(updateArticleDto.title);
    }
    Object.assign(article, updateArticleDto);
    return await this.articleRespository.save(article);
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

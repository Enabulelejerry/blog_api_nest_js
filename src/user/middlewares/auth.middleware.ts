import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { UserService } from '../user.service';
import { AuthRequest } from '@/types/expressRequest.interface';
import { verify, JwtPayload } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../user.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      req.user = new UserEntity();
      return next();
    }

    // Split and remove empty parts (handles "Token  <jwt>" with double space)
    const parts = authHeader.split(' ').filter(Boolean);

    if (parts.length !== 2) {
      req.user = new UserEntity();
      return next();
    }

    const [scheme, token] = parts;

    // Accept both "Bearer" and "Token"
    if (!/^Bearer$/i.test(scheme) && !/^Token$/i.test(scheme)) {
      req.user = new UserEntity();
      return next();
    }

    if (!token) {
      req.user = new UserEntity();
      return next();
    }

    try {
      const secret = this.config.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const decoded = verify(token, secret) as JwtPayload & { id?: number };

      //If your token contains `id`, you can attach the user here
      if (decoded.id) {
        req.user = await this.userService.findById(decoded.id);
      } else {
        req.user = new UserEntity();
      }
    } catch (error) {
      console.error(
        'JWT verify failed:',
        error instanceof Error ? error.message : error,
      );
      req.user = new UserEntity();
    }

    return next();
  }
}

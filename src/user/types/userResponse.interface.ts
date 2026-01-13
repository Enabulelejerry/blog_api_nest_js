import { IUSER } from './user.type';

export interface IUserResponse {
  user: IUSER & { token: string };
}

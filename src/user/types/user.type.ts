import { UserEntity } from '../user.entity';

export type IUSER = Omit<UserEntity, 'hashPassword'>;

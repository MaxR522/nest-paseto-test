import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as argon2 from 'argon2';
import { InternalServerErrorException } from '@nestjs/common';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', width: 255, unique: true })
  username: string;

  @Index()
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', width: 255, select: false })
  password: string;

  @Column({ type: 'date', nullable: true })
  dob: Date | undefined;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'user'],
    default: 'user',
  })
  role: UserRoleType;

  @BeforeInsert()
  @BeforeUpdate()
  async hashpassword() {
    if (!this.password) {
      return;
    }

    try {
      const hash = await argon2.hash(this.password);
      this.password = hash;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Error hashing password');
    }
  }
}

export type UserRoleType = 'admin' | 'user';

import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseEntity } from './base/base.entity';

@Entity('block_sync')
@Unique(['id'])
export class BlockSync extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  lastBlock: number;
}

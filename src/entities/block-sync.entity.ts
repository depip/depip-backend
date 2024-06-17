import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseEntity } from './base/base.entity';

@Entity('block_sync')
@Unique(['contract'])
export class BlockSync extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contract' })
  contract: string;

  @Column({ name: 'last_block' })
  last_block: number;
}

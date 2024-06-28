import { Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('disputecancelled')
@Unique(['id'])
export class DisputeCancelled extends BaseEntityIncrementId {
  @Column()
  disputeId: number;

  @Column()
  data: string;

  @Column()
  signature: string;
}

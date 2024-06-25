import { Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('disputeraise')
@Unique(['id'])
export class DisputeRaise extends BaseEntityIncrementId {
  @Column()
  disputeId: number;

  @Column()
  targetIpId: string;

  @Column()
  disputeInitiator: string;

  @Column()
  arbitrationPolicy: string;
  
  @Column()
  linkToDisputeEvidence: string;

  @Column()
  targetTag: string;

  @Column()
  data: string;

  @Column()
  signature: string;
}

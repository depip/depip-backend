import { Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('ipasset')
@Unique(['id'])
export class IPAassets extends BaseEntityIncrementId {
  @Column({ name: 'contract_address' })
  contract_address: string;

  @Column({ name: 'token_id' })
  token_id: string;

  @Column({ name: 'ip_id' })
  ip_id: string;

  @Column()
  chain_id: string;

  @Column()
  name: string;

  @Column()
  uri: string;

  @Column()
  registration_date: number;
}

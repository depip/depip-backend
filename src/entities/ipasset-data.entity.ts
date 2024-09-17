import { Column, Entity, Index, JoinColumn, OneToOne, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { IPAssets } from './ipasset.entity';

@Entity('ipasset_data')
@Unique(['id'])
export class IPAssetData extends BaseEntityIncrementId {
  @Column({ name: 'contract_address' })
  @Index()
  contract_address: string;

  @Column({ name: 'token_id' })
  @Index()
  token_id: string;

  @Column({ name: 'owner' })
  @Index()
  owner: string;

  @Column()
  chain_id: string;

  @Column({ type: 'jsonb' })
  metadata_onchain: any;

  @Column({ type: 'jsonb' })
  metadata_offchain: any;

  @Column()
  @Index()
  ipasset_id: number;

  @Column()
  @Index()
  ip_id: string;

  @OneToOne(() => IPAssets, (ipasset) => ipasset.ipAssetData)
  @JoinColumn({ name: 'ipasset_id' })
  ipAsset: IPAssets;
}

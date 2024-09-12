import { Column, Entity, Index, JoinColumn, OneToOne, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { IPAssetData } from './ipasset-data.entity';

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

  @Column({ length: 2000 })
  uri: string;

  @Column()
  registration_date: number;

  @OneToOne(() => IPAssetData, (ipassetData) => ipassetData.ipAsset)
  ipAssetData: IPAssetData;
}

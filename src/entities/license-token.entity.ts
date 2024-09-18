import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { IPAssets } from './ipasset.entity';

@Entity('licensetoken')
@Unique(['id'])
export class LicenseToken extends BaseEntityIncrementId {
  @Column()
  minter: string;

  @Column()
  receiver: string;

  @Column({ name: 'token_id' })
  token_id: string;

  @Column()
  signature: string;

  @Column()
  @Index()
  licensor_ip_id: string;

  @ManyToOne(() => IPAssets, { createForeignKeyConstraints: false })
  @JoinColumn([{ name: 'licensor_ip_id', referencedColumnName: 'ip_id' }])
  ipasset: IPAssets;
}

import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { IPAssetData } from './ipasset-data.entity';
import { LicenseToken } from './license-token.entity';
import { LicenseAttach } from './license-attach.entity';

export enum IpAssetStatus {
  REGISTERED = 'REGISTERED',
  LICENSE_ATTACHED = 'LICENSE_ATTACHED',
  LICENSE_TOKEN_MINTED = 'LICENSE_TOKEN_MINTED',
}

@Entity('ipasset')
@Unique(['id'])
export class IPAssets extends BaseEntityIncrementId {
  @Column({ name: 'contract_address' })
  contract_address: string;

  @Column({ name: 'token_id' })
  token_id: string;

  @Column({ name: 'ip_id' })
  @Index()
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

  @Column({ nullable: true })
  number_license_attached: number;

  @OneToMany(() => LicenseToken, (licenseToken) => licenseToken.ipasset)
  licenseTokens: LicenseToken[];

  @Column({ type: 'enum', enum: IpAssetStatus, default: IpAssetStatus.REGISTERED })
  @Index()
  status: string;

  @OneToMany(() => LicenseAttach, (licenseAttach) => licenseAttach.ip_asset)
  license_attaches: LicenseAttach[];
}

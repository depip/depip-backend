import { Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

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
}

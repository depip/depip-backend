import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('license_attach')
export class LicenseAttach extends BaseEntityIncrementId {
  @Column()
  caller: string;

  @Column()
  ip_id: string;

  @Column()
  license_template: string;

  @Column()
  license_term_id: number;
}

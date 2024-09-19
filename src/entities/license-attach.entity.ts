import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { IPAssets } from './ipasset.entity';
import { LicenseTerm } from './license-term.entity';

@Entity('license_attach')
export class LicenseAttach extends BaseEntityIncrementId {
  @Column()
  caller: string;

  @Column()
  @Index()
  ip_id: string;

  @Column()
  license_template: string;

  @Column()
  license_term_id: number;

  @ManyToOne(() => IPAssets, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn([{ name: 'ip_id', referencedColumnName: 'ip_id' }])
  ip_asset: IPAssets;

  @OneToOne(() => LicenseTerm, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn([{ name: 'license_term_id', referencedColumnName: 'license_term_id' }])
  license_term: LicenseTerm;
}

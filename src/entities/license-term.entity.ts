import { Column, Entity, Index, JoinColumn, OneToOne, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { LicenseAttach } from './license-attach.entity';

@Entity('license_term')
export class LicenseTerm extends BaseEntityIncrementId {
  @Column()
  @Index()
  license_term_id: number;

  @Column()
  @Index()
  license_template: string;

  @Column({ type: 'jsonb' })
  license_term_detail: any;

  @Column({ nullable: true })
  name: string;

  @OneToOne(() => LicenseAttach, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn([{ name: 'license_term_id', referencedColumnName: 'license_term_id' }])
  license_attach: LicenseAttach;
}

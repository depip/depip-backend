import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

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
}

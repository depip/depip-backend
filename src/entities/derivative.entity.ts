import { Column, Entity, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('derivative')
@Unique(['id'])
export class Derivative extends BaseEntityIncrementId {
  @Column()
  caller: string;

  @Column()
  childIpId: string;

  @Column()
  licenseTokenIds: string;

  @Column()
  parentIpIds: string;
  
  @Column()
  licenseTermsIds: string;

  @Column()
  licenseTemplate: string;

  @Column()
  signature: string;
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPAassets } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class IPAassetsRepository extends BaseRepository<IPAassets> {
  private readonly _logger = new Logger(IPAassetsRepository.name);
  constructor(
    @InjectRepository(IPAassets)
    private readonly repos: Repository<IPAassets>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor IPAassets Repository ==============',
    );
  }
  async countCw20TokensHavingCoinId() {
    const sqlSelect = `tm.contract_address, tm.coin_id`;

    const queryBuilder = this.repos
      .createQueryBuilder('tm')
      .select(sqlSelect)
      .where("tm.coin_id <> '' ");

    return await queryBuilder.getCount();
  }
}

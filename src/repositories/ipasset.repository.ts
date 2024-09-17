import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPAssets } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class IPAssetsRepository extends BaseRepository<IPAssets> {
  private readonly _logger = new Logger(IPAssetsRepository.name);
  constructor(
    @InjectRepository(IPAssets)
    private readonly repos: Repository<IPAssets>
  ) {
    super(repos);
    this._logger.log('============== Constructor IPAssets Repository ==============');
  }
}

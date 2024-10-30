import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPAssetData } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class IPAssetDataRepository extends BaseRepository<IPAssetData> {
  private readonly _logger = new Logger(IPAssetDataRepository.name);
  constructor(
    @InjectRepository(IPAssetData)
    private readonly repos: Repository<IPAssetData>
  ) {
    super(repos);
    this._logger.log('============== Constructor IPAsset_Data Repository ==============');
  }
}

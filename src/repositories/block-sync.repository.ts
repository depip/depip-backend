import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockSync } from '../entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class BlockSyncRepository extends BaseRepository<BlockSync> {
  private readonly _logger = new Logger(BlockSyncRepository.name);
  constructor(
    @InjectRepository(BlockSync)
    private readonly repos: Repository<BlockSync>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Block Sync Repository ==============',
    );
  }
}

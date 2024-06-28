import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { DisputeRaise } from 'src/entities/dispute-raise.entity';

@Injectable()
export class DisputeRaiseRepository extends BaseRepository<DisputeRaise> {
  private readonly _logger = new Logger(DisputeRaiseRepository.name);
  constructor(
    @InjectRepository(DisputeRaise)
    private readonly repos: Repository<DisputeRaise>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Dispute Raise Repository ==============',
    );
  }
}

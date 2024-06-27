import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { DisputeCancelled } from 'src/entities/dispute-cancelled.entity';

@Injectable()
export class DisputeCancelledRepository extends BaseRepository<DisputeCancelled> {
  private readonly _logger = new Logger(DisputeCancelledRepository.name);
  constructor(
    @InjectRepository(DisputeCancelled)
    private readonly repos: Repository<DisputeCancelled>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Dispute Cancelled Repository ==============',
    );
  }
}

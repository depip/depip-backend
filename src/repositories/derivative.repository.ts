import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Derivative } from 'src/entities/derivative.entity';

@Injectable()
export class DerivativeRepository extends BaseRepository<Derivative> {
  private readonly _logger = new Logger(DerivativeRepository.name);
  constructor(
    @InjectRepository(Derivative)
    private readonly repos: Repository<Derivative>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor Derivative Repository ==============',
    );
  }
}

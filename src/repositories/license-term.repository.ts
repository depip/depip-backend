import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { LicenseTerm } from 'src/entities';

@Injectable()
export class LicenseTermRepository extends BaseRepository<LicenseTerm> {
  private readonly _logger = new Logger(LicenseTermRepository.name);
  constructor(
    @InjectRepository(LicenseTerm)
    private readonly repos: Repository<LicenseTerm>
  ) {
    super(repos);
    this._logger.log('============== Constructor License Term Repository ==============');
  }
}

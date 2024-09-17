import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { LicenseAttach } from 'src/entities';

@Injectable()
export class LicenseAttachRepository extends BaseRepository<LicenseAttach> {
  private readonly _logger = new Logger(LicenseAttachRepository.name);
  constructor(
    @InjectRepository(LicenseAttach)
    private readonly repos: Repository<LicenseAttach>
  ) {
    super(repos);
    this._logger.log('============== Constructor License Attach Repository ==============');
  }
}

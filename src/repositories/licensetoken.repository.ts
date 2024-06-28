import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { LicenseToken } from 'src/entities/license-token.entity';

@Injectable()
export class LicenseTokenRepository extends BaseRepository<LicenseToken> {
  private readonly _logger = new Logger(LicenseTokenRepository.name);
  constructor(
    @InjectRepository(LicenseToken)
    private readonly repos: Repository<LicenseToken>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor License Token Repository ==============',
    );
  }
}

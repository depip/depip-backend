import { Module } from '@nestjs/common';
import {LicenceseService } from './licencese.service';

@Module({
  providers: [LicenceseService],
  exports: [LicenceseService],
})
export class LicenceseModule {}

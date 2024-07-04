import { Module } from '@nestjs/common';
import {DerivativeService } from './derivative.service';

@Module({
  providers: [DerivativeService],
  exports: [DerivativeService],
})
export class DerivativeModule {}

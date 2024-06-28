import { Module } from '@nestjs/common';
import { IpassetService } from './ipasset.service';

@Module({
  providers: [IpassetService],
  exports: [IpassetService],
})
export class IpassetModule {}

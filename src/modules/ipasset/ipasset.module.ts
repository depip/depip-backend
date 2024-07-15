import { Module } from '@nestjs/common';
import { IpassetService } from './ipasset.service';
import { BullModule } from '@nestjs/bull';
import { IpassetController } from './ipasset.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'Ipasset',
    }),
  ],
  providers: [IpassetService],
  controllers: [IpassetController],
})
export class IpassetModule {}

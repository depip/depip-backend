import { Module } from '@nestjs/common';
import { RequestHandlerService } from './requestHandler.service';
import { BullModule } from '@nestjs/bull';
import { RequestHandlerController } from './requestHandler.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'RequestHandler',
    }),
  ],
  providers: [RequestHandlerService],
  controllers: [RequestHandlerController],
})
export class RequestHandlerModule {}

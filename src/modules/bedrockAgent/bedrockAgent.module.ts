import { Module } from '@nestjs/common';
import { BedrockAgentService } from './bedrockAgent.service';
import { BedrockAgentController } from './bedrockAgent.controller';
import { IpassetService } from '../ipasset/ipasset.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'BedrockAgent',
    }),
  ],
  providers: [BedrockAgentService, IpassetService],
  controllers: [BedrockAgentController],
})
export class BedrockAgentModule { }

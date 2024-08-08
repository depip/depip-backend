import { Module } from '@nestjs/common';
import { BedrockAgentService } from './bedrockAgent.service';
import { BedrockAgentController } from './bedrockAgent.controller';
import { IpassetService } from '../ipasset/ipasset.service';
import { BullModule } from '@nestjs/bull';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'BedrockAgent',
    }),
  ],
  providers: [BedrockAgentService, IpassetService, SmartAccountService],
  controllers: [BedrockAgentController],
})
export class BedrockAgentModule { }

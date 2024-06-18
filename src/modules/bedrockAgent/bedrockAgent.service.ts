import { Queue } from 'bull';
import { SiweMessage } from 'siwe';

import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';



@Injectable()
export class BedrockAgentService {
  private readonly logger = new Logger(BedrockAgentService.name);
  constructor(
    // private checkConditionService: CheckConditionService,
    // private redisClientService: RedisService,

  ) {}

  async sendAskingText(text: string) {
    try {

      return "Test";
    } catch (errors) {
      return {
        errors,
      };
    }
  }
}

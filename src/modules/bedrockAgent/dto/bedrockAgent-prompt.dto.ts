import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BedrockAgentPrompt {
  @Expose()
  @ApiProperty()
  prompt: string;
  sessionId: string;
}

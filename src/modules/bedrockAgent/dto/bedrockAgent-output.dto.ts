import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BedrockAgentOutput {
  @Expose()
  @ApiProperty()
  sessionId: string;
  completion: string;
}

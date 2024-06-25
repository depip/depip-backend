import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { BedrockAgentService } from './bedrockAgent.service';
import { BedrockAgentPrompt } from './dto/bedrockAgent-prompt.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('bedrock')
@ApiTags('bedrockAgent')
export class BedrockAgentController {
  constructor(private readonly bedrockAgentSvc: BedrockAgentService) { }

  @Post("bedrock-agent")
  // @UseInterceptors(CacheInterceptor)
  bedrockAgent(@Body() data: BedrockAgentPrompt) {
    return this.bedrockAgentSvc.sendAskingText(data.prompt, data.sessionId);
  }
}

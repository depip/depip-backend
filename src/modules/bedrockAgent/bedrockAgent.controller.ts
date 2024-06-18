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

@Controller('user')
@ApiTags('user')
export class BedrockAgentController {
  constructor(private readonly bedrockAgentSvc: BedrockAgentService) { }

  @Get('available-quests')
  getAvailableQuests() {
    return this.bedrockAgentSvc.sendAskingText("1");
  }
}

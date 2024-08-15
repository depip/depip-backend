import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class spgInput {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  recipient: string;

  @Expose()
  @ApiProperty()
  session: any;    

  @Expose()
  @ApiProperty()
  userWallet: string;
  
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}

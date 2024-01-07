import { ApiProperty } from '@nestjs/swagger';

export class signInDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

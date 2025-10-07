import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInvitationDto {
  @ApiProperty({ description: 'Invitation token' })
  @IsUUID()
  token: string;
}

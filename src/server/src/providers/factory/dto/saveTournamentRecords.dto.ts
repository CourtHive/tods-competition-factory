import { ApiProperty } from '@nestjs/swagger';

export class SaveTournamentRecordsDto {
  @ApiProperty()
  tournamentRecords: { [key: string]: any };
}

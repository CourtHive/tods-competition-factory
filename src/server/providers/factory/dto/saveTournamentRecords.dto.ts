import { TournamentRecords } from '@Types/factoryTypes';
import { Tournament } from '@Types/tournamentTypes';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SaveTournamentRecordsDto {
  @ApiPropertyOptional()
  tournamentRecords?: TournamentRecords;

  @ApiPropertyOptional()
  tournamentRecord?: Tournament;
}

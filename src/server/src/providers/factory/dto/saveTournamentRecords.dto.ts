import { TournamentRecords } from '../../../../../types/factoryTypes';
import { Tournament } from '../../../../../types/tournamentTypes';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SaveTournamentRecordsDto {
  @ApiPropertyOptional()
  tournamentRecords?: TournamentRecords;

  @ApiPropertyOptional()
  tournamentRecord?: Tournament;
}

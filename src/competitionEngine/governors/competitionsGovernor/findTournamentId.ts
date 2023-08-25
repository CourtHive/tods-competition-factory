import { TournamentRecordsArgs } from '../../../types/factoryTypes';
import { getEventIdsAndDrawIds } from '../../getters/getEventIdsAndDrawIds';

type FindTournamentIdArgs = TournamentRecordsArgs & {
  eventId?: string;
  drawId?: string;
};
export function findTournamentId({
  tournamentRecords,
  eventId,
  drawId,
}: FindTournamentIdArgs): string | undefined {
  const { tournamentIdMap } = getEventIdsAndDrawIds({ tournamentRecords });
  const tournamentIds: string[] = tournamentIdMap
    ? Object.keys(tournamentIdMap)
    : [];
  return tournamentIds.find(
    (tournamentId) =>
      (eventId && tournamentIdMap?.[tournamentId].includes(eventId)) ||
      (drawId && tournamentIdMap?.[tournamentId].includes(drawId))
  );
}

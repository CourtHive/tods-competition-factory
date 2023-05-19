import { getEventIdsAndDrawIds } from '../../getters/getEventIdsAndDrawIds';

export function findTournamentId({ drawId, eventId, tournamentRecords }) {
  const { tournamentIdMap } = getEventIdsAndDrawIds({ tournamentRecords });
  return Object.keys(tournamentIdMap).find(
    (tournamentId) =>
      tournamentIdMap[tournamentId].includes(eventId) ||
      tournamentIdMap[tournamentId].includes(drawId)
  );
}

import { MISSING_TOURNAMENT_RECORDS } from '../../constants/errorConditionConstants';

export function getEventIdsAndDrawIds({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);

  return tournamentIds.reduce(
    (aggregator, tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      const events = tournamentRecord.events || [];
      aggregator.eventIds.push(...events.map(({ eventId }) => eventId));
      const drawIds = events
        .map((event) =>
          (event.drawDefinitions || []).map(({ drawId }) => drawId)
        )
        .flat();
      aggregator.drawIds.push(...drawIds);
      return aggregator;
    },
    { eventIds: [], drawIds: [] }
  );
}

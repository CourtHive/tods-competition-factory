import { TournamentRecordsArgs } from '../../types/factoryTypes';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '../../constants/errorConditionConstants';

type Aggregator = {
  tournamentIdMap: { [key: string]: string[] };
  eventIds: string[];
  drawIds: string[];
};

type AggregatorResut = {
  tournamentIdMap?: { [key: string]: string[] };
  eventIds?: string[];
  drawIds?: string[];
  error?: ErrorType;
};

// Returns arrays of all drawIds and eventIds across tournamentRecords
// Returns an combined array of drawIds and eventIds for each tournamentId
export function getEventIdsAndDrawIds({
  tournamentRecords,
}: TournamentRecordsArgs): AggregatorResut {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);

  return tournamentIds.reduce(
    (aggregator: Aggregator, tournamentId) => {
      aggregator.tournamentIdMap[tournamentId] = [];

      const tournamentRecord = tournamentRecords[tournamentId];
      const events = tournamentRecord.events || [];
      const eventIds = events.map(({ eventId }) => eventId);
      const drawIds = events
        .map((event) =>
          (event.drawDefinitions || []).map(({ drawId }) => drawId)
        )
        .flat();

      aggregator.tournamentIdMap[tournamentId].push(...eventIds, ...drawIds);
      aggregator.eventIds.push(...eventIds);
      aggregator.drawIds.push(...drawIds);

      return aggregator;
    },
    { eventIds: [], drawIds: [], tournamentIdMap: {} }
  );
}

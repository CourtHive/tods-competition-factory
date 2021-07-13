import { getAllStructureMatchUps } from '../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../../drawEngine/accessors/matchUpAccessor/getRoundMatchUps';
import { getDrawStructures } from '../../drawEngine/getters/findStructure';
import { isValidDateString } from '../../utilities/dateTime';

export function isValidSchedulingProfile({
  tournamentRecords,
  schedulingProfile,
}) {
  if (!Array.isArray(schedulingProfile)) return false;

  const { venueIds, tournamentsMap } = getAllRelevantSchedulingIds({
    tournamentRecords,
  });

  const isValid = schedulingProfile.every((dateSchedule) => {
    const { scheduleDate, venues } = dateSchedule;
    if (!isValidDateString(scheduleDate)) {
      return false;
    }
    const validVenues = venues.every((venueProfile) => {
      const { venueId, rounds } = venueProfile;
      if (typeof venueId !== 'string') {
        return false;
      }
      if (!Array.isArray(rounds)) {
        return false;
      }
      if (!venueIds.includes(venueId)) {
        return false;
      }
      const validRounds = rounds.every((round) => {
        if (!round) return false;
        const { tournamentId, eventId, drawId, structureId, roundNumber } =
          round;

        const rounds =
          tournamentsMap[tournamentId] &&
          tournamentsMap[tournamentId][eventId] &&
          tournamentsMap[tournamentId][eventId][drawId] &&
          tournamentsMap[tournamentId][eventId][drawId][structureId];
        const validRound = rounds?.includes(roundNumber);
        return validRound;
      });
      if (!validRounds) return false;

      return true;
    });
    return validVenues;
  });
  return isValid;
}

export function tournamentRelevantSchedulingIds({
  tournamentRecord = {},
  tournamentMap = {},
} = {}) {
  const drawIds = [];
  const eventIds = [];
  const structureIds = [];
  const tournamentIds = [];
  const venueIds = (tournamentRecord?.venues || []).map(
    ({ venueId }) => venueId
  );
  const tournamentId = tournamentRecord?.tournamentId;
  if (tournamentId) {
    tournamentIds.push(tournamentId);
    tournamentMap[tournamentId] = {};
    const events = tournamentRecord?.events || [];
    events.forEach((event) => {
      const eventId = event.eventId;
      eventIds.push(eventId);
      tournamentMap[tournamentId][eventId] = {};
      (event.drawDefinitions || []).forEach((drawDefinition) => {
        const drawId = drawDefinition.drawId;
        drawIds.push(drawId);
        tournamentMap[tournamentId][eventId][drawId] = {};
        const { structures } = getDrawStructures({ drawDefinition });
        (structures || []).forEach((structure) => {
          const structureId = structure.structureId;
          structureIds.push(structureId);
          const { matchUps } = getAllStructureMatchUps({ structure });
          const { roundMatchUps } = getRoundMatchUps({ matchUps });
          const rounds =
            roundMatchUps &&
            Object.keys(roundMatchUps).map((roundNumber) =>
              parseInt(roundNumber)
            );
          tournamentMap[tournamentId][eventId][drawId][structureId] = rounds;
        });
      });
    });
  }

  return {
    tournamentIds,
    venueIds,
    eventIds,
    drawIds,
    structureIds,
    tournamentMap,
  };
}

export function getAllRelevantSchedulingIds({ tournamentRecords = {} } = {}) {
  const records = (tournamentRecords && Object.values(tournamentRecords)) || [];
  const tournamentsMap = {};
  const { venueIds, eventIds, drawIds, structureIds, tournamentIds } =
    records.reduce(
      (aggregator, tournamentRecord) => {
        const {
          venueIds,
          eventIds,
          drawIds,
          structureIds,
          tournamentIds,
          tournamentMap,
        } = tournamentRelevantSchedulingIds({
          tournamentRecord,
        });
        venueIds.forEach((venueId) => {
          if (!aggregator.venueIds.includes(venueId))
            aggregator.venueIds.push(venueId);
        });
        aggregator.tournamentIds.push(...tournamentIds);
        aggregator.structureIds.push(...structureIds);
        aggregator.eventIds.push(...eventIds);
        aggregator.drawIds.push(...drawIds);
        Object.assign(tournamentsMap, tournamentMap);
        return aggregator;
      },
      {
        venueIds: [],
        eventIds: [],
        drawIds: [],
        structureIds: [],
        tournamentIds: [],
      }
    );

  return {
    venueIds,
    eventIds,
    drawIds,
    structureIds,
    tournamentIds,
    tournamentsMap,
  };
}

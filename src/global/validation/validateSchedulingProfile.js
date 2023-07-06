import { getAllStructureMatchUps } from '../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../../drawEngine/accessors/matchUpAccessor/getRoundMatchUps';
import { getDrawStructures } from '../../drawEngine/getters/findStructure';
import { isConvertableInteger, isPowerOf2 } from '../../utilities/math';
import { isValidDateString } from '../../utilities/dateTime';

import {
  INVALID_VALUES,
  VENUE_NOT_FOUND,
} from '../../constants/errorConditionConstants';

export function validateSchedulingProfile({
  tournamentRecords,
  schedulingProfile,
}) {
  if (!schedulingProfile) return { valid: true };

  if (!Array.isArray(schedulingProfile))
    return { valid: false, error: INVALID_VALUES };

  const { venueIds, tournamentsMap } = getAllRelevantSchedulingIds({
    tournamentRecords,
  });

  let error, info;
  const isValid = schedulingProfile.every((dateSchedule) => {
    const { scheduleDate, venues } = dateSchedule;
    if (!isValidDateString(scheduleDate)) {
      return false;
    }
    return venues.every((venueProfile) => {
      const { venueId, rounds } = venueProfile;
      if (typeof venueId !== 'string') {
        info = 'venueId should be a string';
        return false;
      }
      if (!Array.isArray(rounds)) {
        info = 'rounds should be an array';
        return false;
      }
      if (!venueIds.includes(venueId)) {
        error = VENUE_NOT_FOUND;
        return false;
      }
      const validRounds = rounds.every((round) => {
        if (!round) {
          info = 'empty round';
          return false;
        }
        const {
          roundSegment,
          tournamentId,
          structureId,
          roundNumber,
          eventId,
          drawId,
        } = round;

        const rounds =
          tournamentsMap?.[tournamentId]?.[eventId]?.[drawId]?.[structureId];

        const validRound = rounds?.includes(roundNumber);
        if (!validRound) info = 'Invalid rounds';

        const { segmentNumber, segmentsCount } = roundSegment || {};
        const validSegment =
          !roundSegment ||
          (isConvertableInteger(segmentNumber) &&
            isPowerOf2(segmentsCount) &&
            segmentNumber <= segmentsCount);

        if (!validSegment) info = 'Invalid segment';
        return validRound && validSegment;
      });

      return !validRounds ? false : true;
    });
  });

  if (!isValid && !error) {
    error = INVALID_VALUES;
  }

  return { valid: !!isValid, error, info };
}

export function tournamentRelevantSchedulingIds({
  tournamentRecord = {},
  tournamentMap = {},
  requireCourts,
} = {}) {
  const drawIds = [];
  const eventIds = [];
  const structureIds = [];
  const tournamentIds = [];
  const venueIds = (tournamentRecord?.venues || []).map(
    ({ venueId, courts }) => (!requireCourts || courts?.length) && venueId
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
          const { matchUps } = getAllStructureMatchUps({ structure });
          const { roundMatchUps } = getRoundMatchUps({ matchUps });
          const rounds =
            roundMatchUps &&
            Object.keys(roundMatchUps).map((roundNumber) =>
              parseInt(roundNumber)
            );

          tournamentMap[tournamentId][eventId][drawId][structureId] = rounds;

          structureIds.push(structureId);
          if (structure.structures?.length) {
            structure.structures.forEach((itemStructure) => {
              structureIds.push(itemStructure.structureId);
              tournamentMap[tournamentId][eventId][drawId][
                itemStructure.structureId
              ] = rounds;
            });
          }
        });
      });
    });
  }

  return {
    tournamentMap,
    tournamentIds,
    structureIds,
    venueIds,
    eventIds,
    drawIds,
  };
}

export function getAllRelevantSchedulingIds({ tournamentRecords = {} } = {}) {
  const records = (tournamentRecords && Object.values(tournamentRecords)) || [];
  const tournamentsMap = {};
  const { venueIds, eventIds, drawIds, structureIds, tournamentIds } =
    records.reduce(
      (aggregator, tournamentRecord) => {
        const {
          tournamentIds,
          tournamentMap,
          structureIds,
          venueIds,
          eventIds,
          drawIds,
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
        tournamentIds: [],
        structureIds: [],
        venueIds: [],
        eventIds: [],
        drawIds: [],
      }
    );

  return {
    tournamentsMap,
    tournamentIds,
    structureIds,
    venueIds,
    eventIds,
    drawIds,
  };
}

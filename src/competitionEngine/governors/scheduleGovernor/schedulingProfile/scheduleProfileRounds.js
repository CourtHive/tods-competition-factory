import { getContainedStructures } from '../../../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { addTournamentTimeItem } from '../../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import { filterMatchUps } from '../../../../drawEngine/getters/getMatchUps/filterMatchUps';
import { findMatchUpFormatTiming } from '../matchUpFormatTiming/findMatchUpFormatTiming';
import { getMatchUpFormat } from '../../../../tournamentEngine/getters/getMatchUpFormat';
import { extractDate, isValidDateString } from '../../../../utilities/dateTime';
import { processNextMatchUps } from '../scheduleMatchUps/processNextMatchUps';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { scheduleMatchUps } from '../scheduleMatchUps/scheduleMatchUps';
import { addNotice, getTopics } from '../../../../global/globalState';
import { isConvertableInteger } from '../../../../utilities/math';
import { getMatchUpDailyLimits } from '../getMatchUpDailyLimits';
import { getSchedulingProfile } from './schedulingProfile';
import { isPowerOf2 } from '../../../../utilities';

import { SUCCESS } from '../../../../constants/resultConstants';
import { AUDIT } from '../../../../constants/topicConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
  NO_VALID_DATES,
} from '../../../../constants/errorConditionConstants';

export function scheduleProfileRounds({
  tournamentRecords,
  scheduleDates = [],
  periodLength,

  checkPotentialConflicts = true,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(scheduleDates)) return { error: INVALID_VALUES };

  const schedulingProfile =
    getSchedulingProfile({ tournamentRecords })?.schedulingProfile || [];

  const { matchUpDailyLimits } = getMatchUpDailyLimits({ tournamentRecords });

  const containedStructureIds = Object.assign(
    {},
    ...Object.values(tournamentRecords).map(getContainedStructures)
  );

  const { matchUps } = allCompetitionMatchUps({
    tournamentRecords,
    nextMatchUps: true,
  });

  const validScheduleDates = scheduleDates
    .map((date) => {
      if (!isValidDateString(date)) return;
      return extractDate(date);
    })
    .filter(Boolean);

  const profileDates = schedulingProfile
    .map((dateSchedulingProfile) => dateSchedulingProfile.scheduleDate)
    .map(
      (scheduleDate) =>
        isValidDateString(scheduleDate) && extractDate(scheduleDate)
    )
    .filter(
      (scheduleDate) =>
        scheduleDate &&
        (!scheduleDates.length || validScheduleDates.includes(scheduleDate))
    );

  if (!profileDates.length) {
    return { error: NO_VALID_DATES };
  }

  const dateSchedulingProfiles = schedulingProfile
    .filter((dateschedulingProfile) => {
      const date = extractDate(dateschedulingProfile?.scheduleDate);
      return profileDates.includes(date);
    })
    .sort((a, b) => {
      new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
    });

  const noTimeMatchUpIds = [];
  const overLimitMatchUpIds = [];
  const scheduledMatchUpIds = [];
  const requestConflicts = [];
  const matchUpNotBeforeTimes = {};
  const matchUpPotentialParticipantIds = {};

  const remainingScheduleTimes = {};
  const skippedScheduleTimes = {};

  matchUps.forEach((matchUp) => {
    if (matchUp.schedule?.timeAfterRecovery) {
      processNextMatchUps({
        matchUp,
        matchUpNotBeforeTimes,
        matchUpPotentialParticipantIds,
      });
    }
  });

  for (const dateSchedulingProfile of dateSchedulingProfiles) {
    const date = extractDate(dateSchedulingProfile?.scheduleDate);
    const venues = dateSchedulingProfile?.venues || [];

    for (const venue of venues) {
      const { rounds = [], venueId } = venue;

      const hashes = [];
      const sortedRounds = rounds.sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );

      const recoveryMinutesMap = {};
      const scheduledRoundsDetails = sortedRounds.map((round) => {
        const roundPeriodLength =
          round.periodLength ||
          dateSchedulingProfile?.periodLength ||
          periodLength;
        const structureIds = containedStructureIds[round.structureId] || [
          round.structureId,
        ];
        const roundMatchUpFilters = {
          tournamentIds: [round.tournamentId],
          roundNumbers: [round.roundNumber],
          matchUpIds: round.matchUpIds,
          eventIds: [round.eventId],
          drawIds: [round.drawId],
          structureIds,
        };
        let roundMatchUps = filterMatchUps({
          matchUps,
          processContext: true,
          ...roundMatchUpFilters,
        });

        // filter by roundSegment
        const { segmentNumber, segmentsCount } = round.roundSegment || {};
        if (
          isConvertableInteger(segmentNumber) &&
          isPowerOf2(roundMatchUps?.length) &&
          isPowerOf2(segmentsCount) &&
          segmentNumber > 0 &&
          segmentNumber <= segmentsCount &&
          segmentsCount < roundMatchUps?.length &&
          !round.matchUpIds?.length
        ) {
          const segmentSize = roundMatchUps.length / segmentsCount;
          const firstSegmentIndex = segmentSize * (segmentNumber - 1);
          roundMatchUps = roundMatchUps.slice(
            firstSegmentIndex,
            firstSegmentIndex + segmentSize
          );
        }

        const tournamentRecord = tournamentRecords[round.tournamentId];
        const { drawDefinition, event } = findEvent({
          tournamentRecord,
          drawId: round.drawId,
        });
        const { matchUpFormat } = getMatchUpFormat({
          tournamentRecord,
          structureId: round.structureId,
          drawDefinition,
          event,
        });

        const { eventType, category } = event || {};
        const { categoryName, ageCategoryCode } = category || {};
        const { averageMinutes, recoveryMinutes } = findMatchUpFormatTiming({
          tournamentRecords,
          categoryName: categoryName || ageCategoryCode,
          tournamentId: round.tournamentId,
          eventId: round.eventId,
          matchUpFormat,
          eventType,
        });

        const matchUpIds = roundMatchUps.map(({ matchUpId }) => matchUpId);
        matchUpIds.forEach(
          (matchUpId) => (recoveryMinutesMap[matchUpId] = recoveryMinutes)
        );

        const hash = `${averageMinutes}|${roundPeriodLength}`;
        if (!hashes.includes(hash)) hashes.push(hash);

        return {
          hash,
          matchUpIds,
          averageMinutes,
          recoveryMinutes,
          roundPeriodLength,
        };
      });

      const hashedRounds = hashes.map((hash) => {
        let groupedMatchUpIds = [];
        let averageMinutes;
        let recoveryMinutes;
        let roundPeriodLength;
        scheduledRoundsDetails
          .filter((details) => details.hash === hash)
          .forEach((round) => {
            averageMinutes = round.averageMinutes;
            recoveryMinutes = round.recoveryMinutes;
            roundPeriodLength = round.roundPeriodLength;
            groupedMatchUpIds = groupedMatchUpIds.concat(round.matchUpIds);
          });

        return {
          averageMinutes,
          recoveryMinutes,
          roundPeriodLength,
          matchUpIds: groupedMatchUpIds,
        };
      });

      let previousRemainingScheduleTimes = []; // keep track of sheduleTimes not used on previous iteration
      for (const roundDetail of hashedRounds) {
        const {
          matchUpIds,
          averageMinutes,
          recoveryMinutes,
          roundPeriodLength,
        } = roundDetail;
        periodLength = roundPeriodLength || periodLength;

        const result = scheduleMatchUps({
          tournamentRecords,
          competitionMatchUps: matchUps,

          averageMatchUpMinutes: averageMinutes,
          recoveryMinutesMap,
          recoveryMinutes,

          matchUpDailyLimits,
          matchUpNotBeforeTimes,
          matchUpPotentialParticipantIds,

          checkPotentialConflicts,
          remainingScheduleTimes: previousRemainingScheduleTimes,

          venueIds: [venueId],
          periodLength,
          matchUpIds,
          date,
        });
        if (result.error) return result;

        previousRemainingScheduleTimes = result.remainingScheduleTimes;
        if (result.skippedScheduleTimes?.length) {
          // add skippedScheduleTimes for each date and return for testing
          skippedScheduleTimes[date] = result.skippedScheduleTimes;
        }
        if (result.remainingScheduleTimes?.length) {
          // add remainingScheduleTimes for each date and return for testing
          remainingScheduleTimes[date] = result.remainingScheduleTimes;
        }

        const roundNoTimeMatchUpIds = result?.noTimeMatchUpIds || [];
        noTimeMatchUpIds.push(...roundNoTimeMatchUpIds);
        const roundScheduledMatchUpIds = result?.scheduledMatchUpIds || [];
        scheduledMatchUpIds.push(...roundScheduledMatchUpIds);
        const roundOverLimitMatchUpIds = result?.overLimitMatchUpIds || [];
        overLimitMatchUpIds.push(...roundOverLimitMatchUpIds);
        const conflicts = result?.requestConflicts || [];
        if (conflicts.length) requestConflicts.push({ date, conflicts });
      }
    }
  }

  // returns the original form of the dateStrings, before extractDate()
  const scheduledDates = dateSchedulingProfiles.map(
    ({ scheduleDate }) => scheduleDate
  );

  const autoSchedulingAudit = {
    timeStamp: Date.now(),
    schedulingProfile,
    scheduledDates,
    noTimeMatchUpIds,
    scheduledMatchUpIds,
    overLimitMatchUpIds,
    requestConflicts,
  };
  const { topics } = getTopics();
  if (topics.includes(AUDIT)) {
    addNotice({ topic: AUDIT, payload: autoSchedulingAudit });
  } else {
    const timeItem = {
      itemType: 'autoSchedulingAudit',
      itemValue: autoSchedulingAudit,
    };
    for (const tournamentRecord of Object.values(tournamentRecords)) {
      addTournamentTimeItem({ tournamentRecord, timeItem });
    }
  }

  return {
    ...SUCCESS,

    scheduledDates,
    noTimeMatchUpIds,
    scheduledMatchUpIds,
    overLimitMatchUpIds,

    requestConflicts,
    skippedScheduleTimes,
    remainingScheduleTimes,
  };
}

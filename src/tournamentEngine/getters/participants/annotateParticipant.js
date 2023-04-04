import { participantScheduledMatchUps } from '../../governors/queryGovernor/participantScheduledMatchUps';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { addNationalityCode } from '../../governors/participantGovernor/addNationalityCode';
import { extractTime, timeStringMinutes } from '../../../utilities/dateTime';
import { participantScaleItem } from '../../accessors/participantScaleItem';
import { getDerivedSeedAssignments } from './getDerivedSeedAssignments';
import { getScaleValues } from './getScaleValues';
import { intersection } from '../../../utilities';

import { SCALE, SEEDING } from '../../../constants/scaleConstants';
import { WIN_RATIO } from '../../../constants/statsConstants';
import {
  BYE,
  DEFAULTED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function annotateParticipant({
  withScaleValues = true,
  eventsPublishStatuses,
  withEvents = true,
  withDraws = true,
  participantIdMap,
  scheduleAnalysis,
  derivedDrawInfo,
  usePublishState,
  withStatistics,
  withOpponents,
  withMatchUps,
  withSeeding,
  participant,
  withISO2,
  withIOC,
}) {
  const scheduleConflicts = [];
  const scheduleItems = [];

  if (withIOC || withISO2)
    addNationalityCode({ participant, withIOC, withISO2 });

  if (withScaleValues) {
    const { ratings, rankings } = getScaleValues({ participant });
    participant.rankings = rankings;
    participant.ratings = ratings;
  }

  const participantId = participant?.participantId;
  if (!participantId || !participantIdMap[participantId]) return {};

  const {
    potentialMatchUps,
    opponents,
    matchUps,
    events,
    losses,
    draws,
    wins,
  } = participantIdMap[participantId];

  const denominator = wins + losses;
  const numerator = wins;

  const statValue = denominator && numerator / denominator;

  const winRatioStat = {
    statCode: WIN_RATIO,
    denominator,
    numerator,
    statValue,
  };

  const participantDraws = Object.values(draws);
  const participantEvents = Object.values(events);

  if (withDraws && participantDraws) {
    participant.draws = participantDraws;

    for (const participantDraw of participantDraws) {
      const publishedSeeding =
        eventsPublishStatuses[participantDraw.eventId]?.publishedSeeding;

      const seedingPublished =
        !usePublishState ||
        (publishedSeeding?.published &&
          (publishedSeeding?.drawIds?.length === 0 ||
            publishedSeeding?.drawIds?.includes(participantDraw.drawId)));

      if (seedingPublished) {
        const seedAssignments = getDerivedSeedAssignments({
          drawId: participantDraw.drawId,
          derivedDrawInfo,
          participantId,
        });

        if (seedAssignments) {
          participantDraw.seedAssignments = seedAssignments;
        }
      }
    }
  }

  if (withEvents && participantEvents) {
    participant.events = participantEvents;

    if (withSeeding) {
      const seedingScales = Object.assign(
        {},
        ...(participant.timeItems || [])
          .filter(({ itemType }) => itemType.split('.')[1] === SEEDING)
          .map(({ itemType: seedingScaleName, itemValue: seedValue }) => ({
            [seedingScaleName]: seedValue,
          }))
      );
      for (const participantEvent of participantEvents) {
        const getScaleAccessor = (scaleName) =>
          [SCALE, SEEDING, participantEvent.eventType, scaleName].join('.');
        const publishedSeeding =
          eventsPublishStatuses[participantEvent.eventId]?.publishedSeeding;
        const eventSeedingScaleNames = (
          (publishedSeeding?.stageSeedingScaleNames &&
            Object.values(publishedSeeding?.stageSeedingScaleNames)) ||
          (Array.isArray(publishedSeeding?.seedingScaleNames) &&
            publishedSeeding.seedingScaleNames) ||
          []
        ).map(getScaleAccessor);
        const publishedEventSeedingScaleNames = intersection(
          Object.keys(seedingScales),
          eventSeedingScaleNames
        );
        const eventSeedingPublished = !!(
          !usePublishState ||
          (!Object.keys(seedingScales).length &&
            !publishedSeeding?.drawIds?.length) ||
          publishedEventSeedingScaleNames.length
        );

        if (eventSeedingPublished && publishedEventSeedingScaleNames.length) {
          if (publishedSeeding?.stageSeedingScaleNames) {
            const scaleValues = Object.keys(
              publishedSeeding.stageSeedingScaleNames
            )
              .map((key) => {
                const accessor = getScaleAccessor(
                  publishedSeeding.stageSeedingScaleNames[key]
                );
                const scaleValue = seedingScales[accessor];
                return [key, scaleValue];
              })
              .filter((pair) => pair[1])
              .map((pair) => ({ [pair[0]]: { seedValue: pair[1] } }));
            const seedAssignments = Object.assign({}, ...scaleValues);

            participantEvent.seedAssignments = seedAssignments;
          } else if (publishedEventSeedingScaleNames) {
            const seedValues = publishedEventSeedingScaleNames.map(
              (scaleName) => seedingScales[scaleName]
            );
            participantEvent.seedValue = seedValues.pop();
          }
        } else if (!usePublishState && typeof withSeeding === 'object') {
          const scaleValues = Object.keys(withSeeding)
            .map((key) => {
              const accessor = getScaleAccessor(withSeeding[key]);
              const scaleValue = seedingScales[accessor];
              return [key, scaleValue];
            })
            .filter((pair) => pair[1])
            .map((pair) => ({ [pair[0]]: { seedValue: pair[1] } }));
          const seedAssignments = Object.assign({}, ...scaleValues);

          participantEvent.seedAssignments = seedAssignments;
        } else {
          const { categoryName, ageCategoryCode } =
            participantEvent.category || {};

          let scaleItem;
          for (const scaleName of [
            participantEvent.eventId,
            ageCategoryCode,
            categoryName,
          ]) {
            const scaleAttributes = {
              eventType: participantEvent.eventType,
              scaleType: SEEDING,
              scaleName,
            };
            const result = participantScaleItem({
              scaleAttributes,
              participant,
            });
            if (result.scaleItem) {
              scaleItem = result.scaleItem;
              break;
            }
          }

          if (scaleItem) {
            const seedValue = scaleItem.scaleValue;
            const seedingPublished =
              !usePublishState ||
              (publishedSeeding?.published &&
                (publishedSeeding?.drawIds?.length === 0 ||
                  publishedSeeding?.drawIds?.includes(
                    participantEvent.drawId
                  )));

            if (seedingPublished) {
              participantEvent.seedValue = seedValue;
            }
          }
        }

        if (participantEvent.drawIds?.length) {
          for (const flightDrawId of participantEvent.drawIds || []) {
            const drawSeedPublishingDisabled =
              publishedSeeding?.drawIds?.length &&
              !publishedSeeding?.drawIds?.includes(flightDrawId);

            if (eventSeedingPublished && !drawSeedPublishingDisabled) {
              const seedAssignments = getDerivedSeedAssignments({
                drawId: flightDrawId,
                derivedDrawInfo,
                participantId,
              });

              // preserve filtering of MAIN/QUALIFYING seedValues, if present
              if (seedAssignments && participantEvent.seedAssignments) {
                for (const key of Object.keys(
                  participantEvent.seedAssignments
                )) {
                  participantEvent.seedAssignments[key] = seedAssignments[key];
                }
              } else {
                participantEvent.seedAssignments = seedAssignments;
              }
            }
          }
        }
      }
    }
  }

  const participantOpponents = Object.values(opponents).flat();
  if (withOpponents && participantOpponents?.length) {
    participant.opponents = participantOpponents;
    participantDraws?.forEach((draw) => {
      draw.opponents = participantOpponents.filter(
        (opponent) => opponent.drawId === draw.drawId
      );
    });
  }

  const participantPotentialMatchUps = Object.values(potentialMatchUps);
  const participantMatchUps = Object.values(matchUps);

  if (withMatchUps) {
    participant.potentialMatchUps = participantPotentialMatchUps;
    participant.matchUps = participantMatchUps;
  }

  const allParticipantMatchUps = participantMatchUps.concat(
    participantPotentialMatchUps
  );

  // scheduledMatchUps are a participant's matchUps separated by date and sorted by scheduledTime
  const { scheduledMatchUps } = participantScheduledMatchUps({
    matchUps: allParticipantMatchUps,
  });

  const { scheduledMinutesDifference } = scheduleAnalysis || {};

  Object.keys(scheduledMatchUps).forEach((date) => {
    scheduledMatchUps[date].filter(Boolean).forEach((matchUp, i) => {
      const {
        schedule: {
          scheduledTime,
          timeAfterRecovery,
          typeChangeTimeAfterRecovery,
        },
        matchUpStatus,
        roundPosition,
        structureName,
        matchUpType,
        roundNumber,
        matchUpId,
        drawId,
        score,
      } = matchUp;

      scheduleItems.push({
        ...matchUp.schedule,
        scheduledTime: extractTime(matchUp.schedule?.scheduledTime),
        roundPosition,
        structureName,
        matchUpType,
        roundNumber,
        matchUpId,
        drawId,
      });

      // matchUps with { matchUpStatus: BYE } are ignored or { matchUpStatus: WALKOVER } and no score
      const ignoreMatchUp =
        matchUpStatus === BYE ||
        ([WALKOVER, DEFAULTED].includes(matchUpStatus) &&
          !scoreHasValue({ score }));

      if (scheduledTime && !ignoreMatchUp) {
        const scheduledMinutes = timeStringMinutes(scheduledTime);
        // each matchUp only considers conflicts with matchUps which occur at the same or later scheduledTime
        const matchUpsToConsider = scheduledMatchUps[date].slice(i + 1);

        for (const consideredMatchUp of matchUpsToConsider) {
          // ignore { matchUpStatus: BYE } and matchUps which are unscheduled
          const ignoreMatchUp =
            consideredMatchUp.matchUpStatus === BYE ||
            ([WALKOVER, DEFAULTED].includes(consideredMatchUp.matchUpStatus) &&
              !scoreHasValue(consideredMatchUp));

          if (!ignoreMatchUp && consideredMatchUp.schedule?.scheduledTime) {
            // if there is a matchType change (SINGLES => DOUBLES or vice versa) then there is potentially a different timeAfterRecovery
            const typeChange =
              matchUp.matchUpType !== consideredMatchUp.matchUpType;
            const notBeforeTime = typeChange
              ? typeChangeTimeAfterRecovery || timeAfterRecovery
              : timeAfterRecovery;

            // if two matchUps are both potentials and both part of the same draw they cannot be considered in conflict
            const sameDraw = matchUp.drawId === consideredMatchUp.drawId;
            const bothPotential =
              matchUp.potential && consideredMatchUp.potential;

            const nextMinutes = timeStringMinutes(
              consideredMatchUp.schedule?.scheduledTime
            );
            const minutesDifference = nextMinutes - scheduledMinutes;

            // Conflicts can be determined in two ways:
            // 1. scheduledMinutesDifference - the minutes difference between two scheduledTimes
            // 2. A scheduledTime occurring before a prior matchUps notBeforeTime (timeAfterRecovery)
            const timeOverlap =
              scheduledMinutesDifference && !isNaN(scheduledMinutesDifference)
                ? minutesDifference <= scheduledMinutesDifference
                : timeStringMinutes(notBeforeTime) >
                  timeStringMinutes(consideredMatchUp.schedule?.scheduledTime);

            // if there is a time overlap capture both the prior matchUpId and the conflicted matchUpId
            if (timeOverlap && !(bothPotential && sameDraw)) {
              scheduleConflicts.push({
                priorScheduledMatchUpId: consideredMatchUp.matchUpId,
                matchUpIdWithConflict: matchUpId,
              });
            }
          }
        }
      }
    });
  });

  if (withStatistics) participant.statistics = [winRatioStat];

  return { scheduleConflicts, scheduleItems };
}

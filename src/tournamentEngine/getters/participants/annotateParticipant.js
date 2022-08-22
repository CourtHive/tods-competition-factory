import { participantScheduledMatchUps } from '../../governors/queryGovernor/participantScheduledMatchUps';
import { addNationalityCode } from '../../governors/participantGovernor/addNationalityCode';
import { extractTime, timeStringMinutes } from '../../../utilities/dateTime';
import { participantScaleItem } from '../../accessors/participantScaleItem';
import { addRankingProfile } from './addRankingProfile';
import { getScaleValues } from './getScaleValues';
import { getSeedValue } from '../getSeedValue';

import { BYE } from '../../../constants/matchUpStatusConstants';
import { SEEDING } from '../../../constants/scaleConstants';

export function annotateParticipant({
  withScaleValues = true,
  eventsPublishStatuses,
  withRankingProfile,
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
  const scheduleItems = [];
  const scheduleConflicts = [];

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
    wins,
    losses,
    matchUps,
    potentialMatchUps,
    events,
    draws,
    opponents,
  } = participantIdMap[participantId];

  const numerator = wins;
  const denominator = wins + losses;
  const statValue = denominator && numerator / denominator;

  const winRatioStat = {
    statCode: 'winRatio',
    numerator,
    denominator,
    statValue,
  };

  const participantDraws = Object.values(draws);
  const participantEvents = Object.values(events);

  if (withDraws && participantDraws) {
    participant.draws = participantDraws;
    for (const participantDraw of participantDraws) {
      const event = participantEvents?.find(
        (e) => e.eventId === participantDraw.eventId
      );

      const { seedValue } = getSeedValue({
        drawId: participantDraw.drawId,
        participant,
        event,
      });

      if (seedValue) {
        const publishedSeeding =
          eventsPublishStatuses[participantDraw.eventId]?.publishedSeeding;

        const seedingPublished =
          !usePublishState ||
          (publishedSeeding?.published &&
            (publishedSeeding?.drawIds?.length === 0 ||
              publishedSeeding?.drawIds?.includes(participantDraw.drawId)));

        if (seedingPublished) {
          participantDraw.seedValue = seedValue;
        }
      }
    }
  }

  if (withEvents && participantEvents) {
    participant.events = participantEvents;
    let foundScaleName;

    if (withSeeding) {
      for (const participantEvent of participantEvents) {
        const { categoryName, ageCategoryCode } =
          participantEvent.category || {};

        let scaleItem;
        if (foundScaleName) {
          const scaleAttributes = {
            eventType: participantEvent.eventType,
            scaleName: foundScaleName,
            scaleType: SEEDING,
          };

          const result = participantScaleItem({
            scaleAttributes,
            participant,
          });
          scaleItem = result.scaleItem;
        } else {
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
              foundScaleName = scaleName;
              break;
            }
          }
        }

        if (participantEvent.drawIds?.length > 1) {
          for (const flightDrawId of participantEvent.drawIds || []) {
            const scaleAttributes = {
              eventType: participantEvent.eventType,
              scaleName: flightDrawId,
              scaleType: SEEDING,
            };
            const result = participantScaleItem({
              scaleAttributes,
              participant,
            });

            if (result.scaleItem?.seedValue) scaleItem = result.scaleItem;
          }
        }

        if (scaleItem) {
          const seedValue = scaleItem.scaleValue;
          const publishedSeeding =
            eventsPublishStatuses[participantEvent.eventId]?.publishedSeeding;

          const seedingPublished =
            !usePublishState ||
            (publishedSeeding?.published &&
              (publishedSeeding?.drawIds?.length === 0 ||
                publishedSeeding?.drawIds?.includes(participantEvent.drawId)));

          if (seedingPublished) {
            participantEvent.seedValue = seedValue;
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
        matchUpId,
        roundNumber,
        roundPosition,
        structureName,
        matchUpType,
        drawId,
      } = matchUp;

      scheduleItems.push({
        drawId,
        matchUpType,
        matchUpId,
        structureName,
        roundNumber,
        roundPosition,
        ...matchUp.schedule,
        scheduledTime: extractTime(matchUp.schedule?.scheduledTime),
      });

      // matchUps with { matchUpStatus: BYE } are ignored
      if (scheduledTime && matchUpStatus !== BYE) {
        const scheduledMinutes = timeStringMinutes(scheduledTime);
        // each matchUp only considers conflicts with matchUps which occur at the same or later scheduledTime
        const matchUpsToConsider = scheduledMatchUps[date].slice(i + 1);
        for (const consideredMatchUp of matchUpsToConsider) {
          // ignore { matchUpStatus: BYE } and matchUps which are unscheduled
          if (
            matchUpStatus !== BYE &&
            consideredMatchUp.schedule?.scheduledTime
          ) {
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

  if (withRankingProfile) {
    addRankingProfile({
      participantMatchUps,
      participantDraws,
      derivedDrawInfo,
      matchUps,
    });
  }

  if (withStatistics) participant.statistics = [winRatioStat];

  return { scheduleConflicts, scheduleItems };
}

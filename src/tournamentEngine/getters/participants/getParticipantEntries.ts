import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { definedAttributes, extractAttributes } from '../../../utilities';
import { timeSort, timeStringMinutes } from '../../../utilities/dateTime';
import { extensionsToAttributes } from '../../../utilities/makeDeepCopy';
import { getEventPublishStatuses } from './getEventPublishStatuses';
import { getEventSeedAssignments } from './getEventSeedAssignments';
import { allEventMatchUps } from '../matchUpsGetter/matchUpsGetter';
import { structureSort } from '../../../forge/transform';
import { processEventEntry } from './processEventEntry';
import { isObject } from '../../../utilities/objects';
import { getFlightProfile } from '../getFlightProfile';
import { addScheduleItem } from './addScheduleItem';
import { processSides } from './processSides';

import { DEFAULTED, WALKOVER } from '../../../constants/matchUpStatusConstants';
import { UNGROUPED, UNPAIRED } from '../../../constants/entryStatusConstants';
import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { WIN_RATIO } from '../../../constants/statsConstants';
import { HydratedMatchUp } from '../../../types/hydrated';

export function getParticipantEntries(params) {
  const {
    participantFilters,
    convertExtensions,
    policyDefinitions,
    tournamentRecord,
    usePublishState,
    contextProfile,
    participantMap,

    withPotentialMatchUps,
    withRankingProfile,
    withScheduleTimes,
    withScheduleItems,
    scheduleAnalysis,
    withTeamMatchUps,
    withStatistics,
    withOpponents,
    withMatchUps,
    withSeeding,
    withEvents,
    withDraws,
  } = params;

  if (withScheduleItems) console.log({ withScheduleItems });

  const targetParticipantIds = participantFilters?.participantIds;
  const getRelevantParticipantIds = (participantId) => {
    const relevantParticipantIds = [participantId];
    relevantParticipantIds.push(participantId);
    participantMap[
      participantId
    ]?.participant.individualParticipantIds?.forEach(
      (individualParticiapntId) =>
        relevantParticipantIds.push(individualParticiapntId)
    );

    return relevantParticipantIds.some(
      (obj) =>
        !targetParticipantIds?.length ||
        targetParticipantIds.includes(obj.relevantParticipantId)
    )
      ? relevantParticipantIds
      : [];
  };

  const withOpts = {
    withMatchUps: withMatchUps || withRankingProfile,
    withEvents: withEvents || withRankingProfile,
    withDraws: withDraws || withRankingProfile,
    withPotentialMatchUps,
    withRankingProfile,
    withScheduleTimes,
    scheduleAnalysis,
    withTeamMatchUps,
    withStatistics,
    participantMap,
    withOpponents,
    withSeeding,
  };

  const participantIdsWithConflicts: string[] = [];
  const mappedMatchUps: { [key: string]: HydratedMatchUp } = {};
  const matchUps: HydratedMatchUp[] = [];
  const eventsPublishStatuses = {};
  const derivedEventInfo: any = {};
  const derivedDrawInfo: any = {};

  const getRanking = ({ eventType, scaleNames, participantId }) =>
    participantMap[participantId].participant?.rankings?.[eventType]?.find(
      (ranking) => scaleNames.includes(ranking.scaleName)
    )?.scaleValue;

  for (const event of tournamentRecord?.events || []) {
    if (
      participantFilters?.eventIds &&
      !participantFilters.eventIds.includes(event.eventId)
    )
      continue;

    const {
      drawDefinitions = [],
      extensions,
      eventType,
      eventName,
      category,
      entries,
      eventId,
      gender,
    } = event;

    const { flightProfile } = getFlightProfile({ event });
    const flights = flightProfile?.flights;

    const publishStatuses = getEventPublishStatuses({ event });
    const publishedSeeding = publishStatuses?.publishedSeeding;
    if (publishStatuses) eventsPublishStatuses[eventId] = publishStatuses;

    if (withEvents || withSeeding || withRankingProfile) {
      const extensionConversions = convertExtensions
        ? Object.assign({}, ...extensionsToAttributes(extensions))
        : {};

      derivedEventInfo[eventId] = {
        ...extensionConversions,
        eventName,
        eventType,
        category,
        eventId,
        gender,
      };

      const scaleNames = [
        category?.categoryName,
        category?.ageCategoryCode,
      ].filter(Boolean);

      for (const entry of entries) {
        const { participantId } = entry;
        if (!participantId || !participantMap[participantId]) continue; // handle bad data

        // get event ranking; this is the same for pairs, teams and all individual participants
        const ranking = getRanking({ eventType, scaleNames, participantId });

        let seedAssignments, seedValue;
        if (withSeeding) {
          const participant = participantMap[participantId].participant;
          ({ seedAssignments, seedValue } = getEventSeedAssignments({
            publishedSeeding,
            usePublishState,
            withSeeding,
            participant,
            event,
          }));
        }

        // IMPORTANT NOTE!
        // id is the pair, team or individual participant currently being processed
        // whereas participantId is the id of the entry into the event
        const addEventEntry = (id: string) => {
          if (participantMap[id]?.events?.[eventId]) return;
          const participant = participantMap[id];

          processEventEntry({
            extensionConversions,
            seedAssignments,
            participant,
            withSeeding,
            seedValue,
            eventId,
            ranking,
            entry,
          });
        };

        addEventEntry(participantId);

        // add details for individualParticipantIds for TEAM/PAIR events
        const individualParticipantIds =
          participantMap[participantId].participant.individualParticipantIds ||
          [];
        individualParticipantIds.forEach(addEventEntry);
      }
    }

    if (withDraws || withRankingProfile || withSeeding) {
      const getSeedingMap = (assignments) =>
        assignments
          ? Object.assign(
              {},
              ...assignments.map((assignment) => ({
                [assignment.participantId]: assignment,
              }))
            )
          : undefined;

      for (const drawDefinition of drawDefinitions) {
        const {
          structures = [],
          drawOrder,
          drawName,
          drawType,
          entries,
          drawId,
        } = drawDefinition;
        const flightNumber = flights?.find((flight) => flight.drawId === drawId)
          ?.flightNumber;

        const scaleNames = [
          category?.categoryName,
          category?.ageCategoryCode,
        ].filter(Boolean);

        // used in rankings pipeline.
        // the structures in which a particpant particpates are ordered
        // to enable differentiation for Points-per-round and points-per-win
        const orderedStructureIds = (drawDefinition.structures || [])
          .sort((a, b) => structureSort(a, b))
          .map(({ structureId, structures }) => {
            return [
              structureId,
              ...(structures || []).map(({ structureId }) => structureId),
            ];
          })
          .flat(Infinity);

        let qualifyingPositionAssignments,
          qualifyingSeedAssignments,
          mainPositionAssignments,
          mainSeedAssignments,
          drawSize = 0;

        // build up assignedParticipantIds array
        // to ensure that only assignedParticipants are included
        const assignedParticipantIds = structures
          .filter(
            ({ stage, stageSequence }) =>
              (stage === MAIN && stageSequence === 1) || stage === QUALIFYING
          )
          .flatMap((structure) => {
            const { seedAssignments, stageSequence, stage } = structure;
            const { positionAssignments } = getPositionAssignments({
              structure,
            });

            if (stage === MAIN) {
              drawSize = positionAssignments?.length ?? 0;
              mainPositionAssignments = positionAssignments;
              mainSeedAssignments = seedAssignments;
            } else if (stageSequence === 1) {
              qualifyingPositionAssignments = positionAssignments;
              qualifyingSeedAssignments = seedAssignments;
            }
            return positionAssignments;
          })
          .map(({ participantId }) => participantId)
          .filter(Boolean);

        const mainSeedingMap = getSeedingMap(mainSeedAssignments);
        const qualifyingSeedingMap = getSeedingMap(qualifyingSeedAssignments);

        const relevantEntries = entries.filter(({ participantId }) =>
          assignedParticipantIds.includes(participantId)
        );

        const publishedSeeding =
          eventsPublishStatuses?.[eventId]?.publishedSeeding;

        const seedingPublished =
          !usePublishState ||
          (publishedSeeding?.published &&
            (publishedSeeding?.drawIds?.length === 0 ||
              publishedSeeding?.drawIds?.includes(drawId)));

        for (const entry of relevantEntries) {
          const { entryStatus, entryStage, entryPosition, participantId } =
            entry;

          // get event ranking
          const ranking = getRanking({
            participantId,
            scaleNames,
            eventType,
          });

          // IMPORTANT NOTE!
          // id is the pair, team or individual participant currently being processed
          // whereas participantId is the id of the entry into the draw
          const addDrawEntry = (id) => {
            if (participantMap[id].draws?.[drawId]) return;

            const includeSeeding = withSeeding && seedingPublished;

            const seedAssignments = includeSeeding ? {} : undefined;
            const mainSeeding = includeSeeding
              ? mainSeedingMap?.[participantId]?.seedValue ||
                mainSeedingMap?.[participantId]?.seedNumber
              : undefined;
            const qualifyingSeeding = includeSeeding
              ? qualifyingSeedingMap?.[participantId]?.seedValue ||
                qualifyingSeedingMap?.[participantId]?.seedNumber
              : undefined;

            if (seedAssignments && mainSeeding)
              seedAssignments[MAIN] = mainSeeding;
            if (seedAssignments && qualifyingSeeding)
              seedAssignments[QUALIFYING] = mainSeeding;

            if (withEvents || withRankingProfile) {
              if (includeSeeding) {
                // overwrite any event seeding with actual draw seeding (which may differ)
                participantMap[id].events[eventId].seedValue =
                  mainSeeding || qualifyingSeeding;
              } else if (participantMap[id].events[eventId]?.seedValue) {
                // if seeding for specific drawIds is NOT published, remove from event
                participantMap[id].events[eventId].seedValue = undefined;
              }
            }

            if (withDraws || withRankingProfile) {
              participantMap[id].draws[drawId] = definedAttributes(
                {
                  seedAssignments,
                  entryPosition,
                  entryStatus,
                  entryStage,
                  eventId,
                  ranking,
                  drawId,
                },
                false,
                false,
                true
              );
            }
          };

          if (![UNGROUPED, UNPAIRED].includes(entryStatus)) {
            addDrawEntry(participantId);

            const individualParticipantIds =
              participantMap[participantId].participant
                .individualParticipantIds || [];

            // add for individualParticipantIds when participantType is TEAM/PAIR
            individualParticipantIds?.forEach(addDrawEntry);
          }
        }

        derivedDrawInfo[drawId] = {
          qualifyingPositionAssignments,
          qualifyingSeedAssignments,
          mainPositionAssignments,
          qualifyingSeedingMap,
          mainSeedAssignments,
          orderedStructureIds,
          mainSeedingMap,
          flightNumber,
          drawOrder,
          drawName,
          drawType,
          drawSize,
          drawId,
          // qualifyingDrawSize,
        };
      }
    }

    if (
      withRankingProfile ||
      scheduleAnalysis ||
      withTeamMatchUps ||
      withStatistics ||
      withOpponents ||
      withMatchUps ||
      withDraws
    ) {
      const nextMatchUps = !!scheduleAnalysis || withPotentialMatchUps;
      const eventMatchUps =
        allEventMatchUps({
          afterRecoveryTimes: !!scheduleAnalysis,
          policyDefinitions,
          tournamentRecord,
          inContext: true,
          contextProfile,
          participantMap,
          nextMatchUps,
          event,
        })?.matchUps ?? [];

      for (const matchUp of eventMatchUps) {
        const {
          finishingPositionRange,
          potentialParticipants,
          tieMatchUps = [],
          sides = [],
          winningSide,
          matchUpType,
          matchUpId,
          eventId,
          drawId,
          collectionId,
          stageSequence,
          finishingRound,
          matchUpStatus,
          roundPosition,
          roundNumber,
          structureId,
          schedule,
          score,
          stage,
        } = matchUp;

        mappedMatchUps[matchUpId] = matchUp;

        const baseAttrs = {
          finishingPositionRange,
          finishingRound,
          stageSequence,
          roundPosition,
          collectionId,
          roundNumber,
          structureId,
          schedule,
          eventId,
          drawId,
          score,
          stage,
        };

        processSides({
          ...baseAttrs,
          ...withOpts,
          matchUpStatus,
          winningSide,
          matchUpType,
          matchUpId,
          sides,
        });

        for (const tieMatchUp of tieMatchUps) {
          const {
            winningSide: tieMatchUpWinningSide,
            sides: tieMatchUpSides = [],
            matchUpId: tieMatchUpId,
            matchUpStatus,
            matchUpType,
          } = tieMatchUp;
          processSides({
            ...baseAttrs,
            ...withOpts,
            winningSide: tieMatchUpWinningSide,
            tieWinningSide: winningSide,
            matchUpTieId: matchUpId,
            matchUpId: tieMatchUpId,
            sides: tieMatchUpSides,
            matchUpSides: sides,
            matchUpStatus,
            matchUpType,
          });
        }

        if (
          Array.isArray(potentialParticipants) &&
          (nextMatchUps || !!scheduleAnalysis || withScheduleTimes)
        ) {
          const potentialParticipantIds = potentialParticipants
            .flat()
            .map(extractAttributes('participantId'))
            .filter(Boolean);
          potentialParticipantIds?.forEach((participantId) => {
            const relevantParticipantIds =
              getRelevantParticipantIds(participantId);

            relevantParticipantIds?.forEach((relevantParticipantId) => {
              if (!participantMap[relevantParticipantId]) {
                return;
              }
              participantMap[relevantParticipantId].potentialMatchUps[
                matchUpId
              ] = definedAttributes({
                tournamentId: tournamentRecord?.tournamentId,
                matchUpId,
                eventId,
                drawId,
              });
            });

            if (!!scheduleAnalysis || withScheduleTimes) {
              addScheduleItem({
                potential: true,
                participantMap,
                participantId,
                matchUpStatus,
                roundPosition,
                structureId,
                matchUpType,
                roundNumber,
                matchUpId,
                schedule,
                drawId,
                score,
              });
            }
          });
        }
      }

      matchUps.push(...eventMatchUps);
    }
  }

  if (withStatistics || withRankingProfile || !!scheduleAnalysis) {
    const aggregators: any[] = Object.values(participantMap);
    for (const participantAggregator of aggregators) {
      const {
        wins,
        losses,
        [SINGLES]: { wins: singlesWins, losses: singlesLosses },
        [DOUBLES]: { wins: doublesWins, losses: doublesLosses },
      } = participantAggregator.counters;

      const addStatValue = (statCode, wins, losses) => {
        const denominator = wins + losses;
        const numerator = wins;

        const statValue = denominator && numerator / denominator;

        participantAggregator.statistics[statCode] = {
          denominator,
          numerator,
          statValue,
          statCode,
        };
      };

      if (withStatistics) {
        addStatValue(WIN_RATIO, wins, losses);
        addStatValue(`${WIN_RATIO}.${SINGLES}`, singlesWins, singlesLosses);
        addStatValue(`${WIN_RATIO}.${DOUBLES}`, doublesWins, doublesLosses);
      }

      if (withRankingProfile) {
        const diff = (range = []) => Math.abs(range[0] - range[1]);
        for (const drawId of Object.keys(participantAggregator.draws)) {
          const { orderedStructureIds = [], flightNumber } =
            derivedDrawInfo[drawId] || {};
          if (
            participantAggregator.structureParticipation &&
            orderedStructureIds.length
          ) {
            let finishingPositionRange;
            let nonQualifyingOrder = 0;

            // structures in which a participant participants/exits
            const orderedParticipation = orderedStructureIds
              .map((structureId) => {
                const participation =
                  participantAggregator.structureParticipation[structureId];
                if (!participation) return;

                if (!finishingPositionRange)
                  finishingPositionRange =
                    participation?.finishingPositionRange;
                if (
                  diff(finishingPositionRange) >
                  diff(participation?.finishingPositionRange)
                )
                  finishingPositionRange =
                    participation?.finishingPositionRange;

                const notQualifying = participation.stage !== QUALIFYING;
                if (notQualifying) nonQualifyingOrder += 1;

                const participationOrder = notQualifying
                  ? nonQualifyingOrder
                  : undefined;

                return definedAttributes({
                  ...participation,
                  participationOrder,
                  flightNumber,
                });
              })
              .filter(Boolean);

            if (participantAggregator.draws[drawId]) {
              participantAggregator.draws[drawId].finishingPositionRange =
                finishingPositionRange;
              participantAggregator.draws[drawId].structureParticipation =
                orderedParticipation;
            }
          }
        }
      }

      if (scheduleAnalysis) {
        const scheduledMinutesDifference = isObject(scheduleAnalysis)
          ? scheduleAnalysis.scheduledMinutesDifference
          : 0;

        // iterate through participantAggregator.scheduleItems
        const scheduleItems = participantAggregator.scheduleItems || [];
        const potentialMatchUps = participantAggregator.potentialMatchUps || {};
        const dateItems = scheduleItems.reduce((dateItems, scheduleItem) => {
          const { scheduledDate, scheduledTime } = scheduleItem;
          if (!dateItems[scheduledDate]) dateItems[scheduledDate] = [];
          if (scheduledTime) dateItems[scheduledDate].push(scheduleItem);

          return dateItems;
        }, {});

        // sort scheduleItems for each date
        Object.values(dateItems).forEach((items: any) => items.sort(timeSort));

        for (const scheduleItem of scheduleItems) {
          const {
            typeChangeTimeAfterRecovery,
            timeAfterRecovery,
            scheduledDate,
            scheduledTime,
          } = scheduleItem;

          const scheduleItemsToConsider = dateItems[scheduledDate];
          const scheduledMinutes = timeStringMinutes(scheduledTime);

          for (const consideredItem of scheduleItemsToConsider) {
            const ignoreItem =
              consideredItem.matchUpId === scheduleItem.matchUpId ||
              ([WALKOVER, DEFAULTED].includes(consideredItem.matchUpStatus) &&
                !consideredItem.scoreHasValue);
            if (ignoreItem) continue;

            // if there is a matchType change (SINGLES => DOUBLES or vice versa) then there is potentially a different timeAfterRecovery
            const typeChange =
              scheduleItem.matchUpType !== consideredItem.matchUpType;

            const notBeforeTime = typeChange
              ? typeChangeTimeAfterRecovery || timeAfterRecovery
              : timeAfterRecovery;

            // if two matchUps are both potentials and both part of the same draw they cannot be considered in conflict
            const sameDraw = scheduleItem.drawId === consideredItem.drawId;

            const bothPotential =
              potentialMatchUps[scheduleItem.matchUpId] &&
              potentialMatchUps[consideredItem.matchUpId];

            const nextMinutes = timeStringMinutes(consideredItem.scheduledTime);
            const minutesDifference = Math.abs(nextMinutes - scheduledMinutes);

            // Conflicts can be determined in two ways:
            // 1. scheduledMinutesDifference - the minutes difference between two scheduledTimes
            // 2. A scheduledTime occurring before a prior matchUps notBeforeTime (timeAfterRecovery)
            const timeOverlap =
              scheduledMinutesDifference && !isNaN(scheduledMinutesDifference)
                ? minutesDifference <= scheduledMinutesDifference
                : timeStringMinutes(notBeforeTime) >
                  timeStringMinutes(consideredItem.scheduledTime);

            // if there is a time overlap capture both the prior matchUpId and the conflicted matchUpId
            if (timeOverlap && !(bothPotential && sameDraw)) {
              participantAggregator.scheduleConflicts.push({
                priorScheduledMatchUpId: consideredItem.matchUpId,
                matchUpIdWithConflict: scheduleItem.matchUpId,
              });
            }
          }
        }

        const pid = participantAggregator.participant.participantId;
        if (participantAggregator.scheduleConflicts.length) {
          participantIdsWithConflicts.push(pid);
        }

        participantMap[pid].scheduleConflicts =
          participantAggregator.scheduleConflicts;
      }
    }
  }

  return {
    participantIdsWithConflicts,
    eventsPublishStatuses,
    derivedEventInfo,
    derivedDrawInfo,
    mappedMatchUps,
    participantMap,
    matchUps,
  };
}

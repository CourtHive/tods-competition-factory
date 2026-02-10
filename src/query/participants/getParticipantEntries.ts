import { getEventSeedAssignments } from '@Query/event/getEventSeedAssignments';
import { getPositionAssignments } from '@Query/drawDefinition/positionsGetter';
import { getDrawId, getParticipantId } from '@Functions/global/extractors';
import { processEventEntry } from '@Query/participant/processEventEntry';
import { allEventMatchUps } from '@Query/matchUps/getAllEventMatchUps';
import { getPublishState } from '@Query/publishing/getPublishState';
import { addScheduleItem } from '@Query/matchUps/addScheduleItem';
import { structureSort } from '@Functions/sorters/structureSort';
import { getFlightProfile } from '@Query/event/getFlightProfile';
import { timeSort, timeStringMinutes } from '@Tools/dateTime';
import { extensionsToAttributes } from '@Tools/makeDeepCopy';
import { processSides } from '@Query/matchUps/processSides';
import { definedAttributes } from '@Tools/definedAttributes';
import { stringSort } from '@Functions/sorters/stringSort';
import { isExit } from '@Validators/isExit';
import { isObject } from '@Tools/objects';

// constants and types
import { UNGROUPED, UNPAIRED } from '@Constants/entryStatusConstants';
import { MAIN, QUALIFYING } from '@Constants/drawDefinitionConstants';
import { DOUBLES, SINGLES } from '@Constants/matchUpTypes';
import { WIN_RATIO } from '@Constants/statsConstants';
import { HydratedMatchUp } from '@Types/hydrated';
import { unique } from '@Tools/arrays';

export function getParticipantEntries(params) {
  const {
    participantFilters,
    convertExtensions,
    policyDefinitions,
    tournamentRecord,
    usePublishState,
    contextFilters,
    matchUpFilters,
    participantMap,
    contextProfile,

    withPotentialMatchUps,
    withRankingProfile,
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

  const targetParticipantIds = participantFilters?.participantIds;
  const getRelevantParticipantIds = (participantId) => {
    const relevantParticipantIds = [participantId];
    participantMap[participantId]?.participant.individualParticipantIds?.forEach((individualParticiapntId) =>
      relevantParticipantIds.push(individualParticiapntId),
    );

    return relevantParticipantIds.some((id) => !targetParticipantIds?.length || targetParticipantIds.includes(id))
      ? relevantParticipantIds
      : [];
  };

  const withOpts = {
    withMatchUps: withMatchUps || withRankingProfile,
    withEvents: withEvents || withRankingProfile,
    withDraws: withDraws || withRankingProfile,
    withPotentialMatchUps,
    withRankingProfile,
    withScheduleItems,
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
    participantMap[participantId]?.participant?.rankings?.[eventType]?.find((ranking) =>
      scaleNames.includes(ranking.scaleName),
    )?.scaleValue;

  for (const event of tournamentRecord?.events || []) {
    if (participantFilters?.eventIds && !participantFilters.eventIds.includes(event.eventId)) continue;

    const { drawDefinitions = [], extensions = [], eventType, eventName, category, entries, eventId, gender } = event;

    const { flightProfile } = getFlightProfile({ event });
    const flights = flightProfile?.flights ?? [];

    const publishStatuses = getPublishState({ event }).publishState;
    if (publishStatuses) eventsPublishStatuses[eventId] = publishStatuses;
    const publishedSeeding = publishStatuses?.status?.publishedSeeding;

    if (withEvents || withSeeding || withRankingProfile) {
      const extensionConversions = convertExtensions
        ? Object.assign({}, ...extensionsToAttributes(extensions ?? []))
        : {};

      derivedEventInfo[eventId] = {
        ...extensionConversions,
        eventName,
        eventType,
        category,
        eventId,
        gender,
      };

      const scaleNames = [category?.categoryName, category?.ageCategoryCode].filter(Boolean);

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
            convertExtensions,
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
        const individualParticipantIds = participantMap[participantId].participant.individualParticipantIds || [];
        individualParticipantIds.forEach(addEventEntry);
      }
    }
    const eventPublishedSeeding = eventsPublishStatuses?.[eventId]?.publishedSeeding;

    if (withDraws || withRankingProfile || withSeeding) {
      const getSeedingMap = (assignments) =>
        assignments
          ? Object.assign(
              {},
              ...assignments.map(({ participantId, seedValue, seedNumber }) => ({
                [participantId]: { seedValue, seedNumber },
              })),
            )
          : undefined;

      const drawIds = unique([...drawDefinitions.map(getDrawId), ...flights.map(getDrawId)]);

      for (const drawId of drawIds) {
        const drawDefinition = drawDefinitions.find((drawDefinition) => drawDefinition.drawId === drawId);
        const scaleNames = [category?.categoryName, category?.ageCategoryCode].filter(Boolean);
        const { structures = [], drawOrder, drawName, drawType } = drawDefinition ?? {};
        const flight = flights?.find((flight) => flight.drawId === drawId);
        const entries = drawDefinition?.entries || flight?.drawEntries;
        const flightNumber = flight?.flightNumber;

        // used in rankings pipeline.
        // the structures in which a particpant particpates are ordered
        // to enable differentiation for Points-per-round and points-per-win
        const orderedStructureIds = (drawDefinition?.structures || [])
          .sort((a, b) => structureSort(a, b))
          .map(({ structureId, structures }) => {
            return [structureId, ...(structures || []).map(({ structureId }) => structureId)];
          })
          .flat(Infinity);

        let qualifyingPositionAssignments,
          qualifyingSeedAssignments,
          mainPositionAssignments,
          mainSeedAssignments,
          drawSize = 0;

        // build up assignedParticipantIds Set
        // to ensure that only assignedParticipants are included
        const assignedParticipantIds = new Set(
          structures
            .filter(({ stage, stageSequence }) => (stage === MAIN && stageSequence === 1) || stage === QUALIFYING)
            .flatMap((structure) => {
              const { positionAssignments } = getPositionAssignments({ structure });
              const { seedAssignments, stageSequence, stage } = structure;

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
            .filter(Boolean),
        );

        const mainSeedingMap = getSeedingMap(mainSeedAssignments);
        const qualifyingSeedingMap = getSeedingMap(qualifyingSeedAssignments);

        const relevantEntries = drawDefinition
          ? entries.filter(({ participantId }) => assignedParticipantIds.has(participantId))
          : entries;

        const seedingPublished =
          !usePublishState ||
          (eventPublishedSeeding?.published &&
            (eventPublishedSeeding?.drawIds?.length === 0 || eventPublishedSeeding?.drawIds?.includes(drawId)));

        for (const entry of relevantEntries) {
          if (!participantMap[entry.participantId]) continue; // handle bad data
          const { entryStatus, entryStage, entryPosition, participantId } = entry;

          // get event ranking
          const ranking = getRanking({
            participantId,
            scaleNames,
            eventType,
          });

          // IMPORTANT NOTE!
          // id is the pair, team or individual participant currently being processed
          // whereas participantId is the id of the entry into the draw
          const addParticipantDrawEntry = (id) => {
            if (!participantMap[id] || participantMap[id].draws?.[drawId]) return;

            const includeSeeding = withSeeding && seedingPublished;

            const seedAssignments = includeSeeding ? {} : undefined;
            const mainSeeding = includeSeeding
              ? mainSeedingMap?.[participantId]?.seedValue || mainSeedingMap?.[participantId]?.seedNumber
              : undefined;
            const mainSeedingAssignments = mainSeeding ? mainSeedingMap?.[participantId] : undefined;
            const qualifyingSeeding = includeSeeding
              ? qualifyingSeedingMap?.[participantId]?.seedValue || qualifyingSeedingMap?.[participantId]?.seedNumber
              : undefined;
            const qualifyingSeedingAssignments = qualifyingSeeding ? qualifyingSeedingMap?.[participantId] : undefined;

            if (seedAssignments && mainSeeding) seedAssignments[MAIN] = mainSeedingAssignments;
            if (seedAssignments && qualifyingSeeding) seedAssignments[QUALIFYING] = qualifyingSeedingAssignments;

            const seedValue = mainSeeding || qualifyingSeeding;
            if (seedValue) {
              if (!participantMap[id].participant.seedings[eventType])
                participantMap[id].participant.seedings[eventType] = [];

              if (mainSeedingAssignments) {
                participantMap[id].participant.seedings[eventType].push({
                  ...mainSeedingAssignments,
                  scaleName: drawId,
                });
              }
              if (qualifyingSeedingAssignments) {
                participantMap[id].participant.seedings[eventType].push({
                  ...qualifyingSeedingAssignments,
                  scaleName: drawId,
                });
              }

              if (seedAssignments) {
                if (!participantMap[id].events[eventId].seedAssignments)
                  participantMap[id].events[eventId].seedAssignments = {};

                Object.keys(seedAssignments).forEach(
                  (stage) => (participantMap[id].events[eventId].seedAssignments[stage] = seedAssignments[stage]),
                );
              }
            }

            if (withDraws || withRankingProfile) {
              participantMap[id].draws[drawId] = definedAttributes(
                {
                  seedAssignments,
                  entryPosition,
                  entryStatus,
                  entryStage,
                  seedValue,
                  eventId,
                  ranking,
                  drawId,
                },
                false,
                false,
                true,
              );
            }
          };

          if (![UNGROUPED, UNPAIRED].includes(entryStatus)) {
            addParticipantDrawEntry(participantId);

            const individualParticipantIds = participantMap[participantId].participant.individualParticipantIds || [];

            // add for individualParticipantIds when participantType is TEAM/PAIR
            individualParticipantIds?.forEach(addParticipantDrawEntry);
          }
        }

        const stages = (drawDefinition?.structures ?? []).reduce((stages, structure) => {
          if (!stages.includes(structure.stage)) stages.push(structure.stage);
          return stages;
        }, []);

        const linksCount = (drawDefinition?.links ?? []).length;

        derivedDrawInfo[drawId] = {
          qualifyingPositionAssignments,
          qualifyingSeedAssignments,
          mainPositionAssignments,
          qualifyingSeedingMap,
          mainSeedAssignments,
          orderedStructureIds,
          mainSeedingMap,
          flightNumber,
          linksCount,
          drawOrder,
          drawName,
          drawType,
          drawSize,
          drawId,
          stages,
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
          participantMap,
          contextFilters,
          matchUpFilters,
          contextProfile,
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
          containerStructureId,
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
          containerStructureId,
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
          tournamentRecord,
          drawDefinitions,
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

        if (Array.isArray(potentialParticipants) && (nextMatchUps || !!scheduleAnalysis || withScheduleItems)) {
          const potentialParticipantIds = potentialParticipants.flat().map(getParticipantId).filter(Boolean);
          potentialParticipantIds?.forEach((participantId) => {
            const relevantParticipantIds = getRelevantParticipantIds(participantId);

            relevantParticipantIds?.forEach((relevantParticipantId) => {
              if (!participantMap[relevantParticipantId]) {
                return;
              }
              participantMap[relevantParticipantId].potentialMatchUps[matchUpId] = definedAttributes({
                tournamentId: tournamentRecord?.tournamentId,
                matchUpId,
                eventId,
                drawId,
              });
            });

            if (!!scheduleAnalysis || withScheduleItems) {
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
          const { orderedStructureIds = [], flightNumber } = derivedDrawInfo[drawId] || {};
          if (participantAggregator.structureParticipation && orderedStructureIds.length) {
            let finishingPositionRange;
            let nonQualifyingOrder = 0;

            // structures in which a participant participants/exits
            const orderedParticipation = orderedStructureIds
              .map((structureId) => {
                const participation = participantAggregator.structureParticipation[structureId];
                if (!participation) return undefined;

                if (!finishingPositionRange) finishingPositionRange = participation?.finishingPositionRange;
                if (diff(finishingPositionRange) > diff(participation?.finishingPositionRange))
                  finishingPositionRange = participation?.finishingPositionRange;

                const notQualifying = participation.stage !== QUALIFYING;
                if (notQualifying) nonQualifyingOrder += 1;

                const participationOrder = notQualifying ? nonQualifyingOrder : undefined;

                return definedAttributes({
                  ...participation,
                  participationOrder,
                  flightNumber,
                });
              })
              .filter(Boolean);

            if (participantAggregator.draws[drawId]) {
              // this is where finishingPositionRanges for round robin groups would be added in the future
              // here we have access to hydrated matchUps and can tallyParticipantResults to get groupOrders
              // from which we can derive finishingPositionRanges for round robin groups
              participantAggregator.draws[drawId].finishingPositionRange = finishingPositionRange;
              participantAggregator.draws[drawId].structureParticipation = orderedParticipation;
            }
          }
        }
      }

      if (scheduleAnalysis) {
        const scheduledMinutesDifference = isObject(scheduleAnalysis) ? scheduleAnalysis.scheduledMinutesDifference : 0;

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
          const { typeChangeTimeAfterRecovery, timeAfterRecovery, scheduledDate, scheduledTime } = scheduleItem;

          const scheduleItemsToConsider = dateItems[scheduledDate];
          const scheduledMinutes = timeStringMinutes(scheduledTime);

          for (const consideredItem of scheduleItemsToConsider) {
            const ignoreItem =
              consideredItem.matchUpId === scheduleItem.matchUpId ||
              (isExit(consideredItem.matchUpStatus) && !consideredItem.checkScoreHasValue);
            if (ignoreItem) continue;

            // if there is a matchType change (SINGLES => DOUBLES or vice versa) then there is potentially a different timeAfterRecovery
            const typeChange = scheduleItem.matchUpType !== consideredItem.matchUpType;

            const notBeforeTime = typeChange ? typeChangeTimeAfterRecovery || timeAfterRecovery : timeAfterRecovery;

            // if two matchUps are both potentials and both part of the same draw they cannot be considered in conflict
            const sameDraw = scheduleItem.drawId === consideredItem.drawId;

            const bothPotential =
              potentialMatchUps[scheduleItem.matchUpId] && potentialMatchUps[consideredItem.matchUpId];

            const consideredMinutes = timeStringMinutes(consideredItem.scheduledTime);
            const minutesDifference = Math.abs(consideredMinutes - scheduledMinutes);
            const itemIsPrior = consideredMinutes >= scheduledMinutes;

            // Conflicts can be determined in two ways:
            // 1. scheduledMinutesDifference - the minutes difference between two scheduledTimes
            // 2. A scheduledTime occurring before a prior matchUps notBeforeTime (timeAfterRecovery)
            const timeOverlap =
              scheduledMinutesDifference && !Number.isNaN(scheduledMinutesDifference)
                ? minutesDifference <= scheduledMinutesDifference
                : itemIsPrior && timeStringMinutes(consideredItem.scheduledTime) < timeStringMinutes(notBeforeTime);

            // if there is a time overlap capture both the prior matchUpId and the conflicted matchUpId
            if (timeOverlap && !(bothPotential && sameDraw) && itemIsPrior) {
              const key = [scheduleItem.matchUpId, consideredItem.matchUpId].sort(stringSort).join('|');
              participantAggregator.scheduleConflicts[key] = {
                priorScheduledMatchUpId: scheduleItem.matchUpId,
                matchUpIdWithConflict: consideredItem.matchUpId,
              };
            }
          }
        }

        const pid = participantAggregator.participant.participantId;
        if (Object.keys(participantAggregator.scheduleConflicts).length) {
          participantIdsWithConflicts.push(pid);
        }

        participantMap[pid].scheduleConflicts = participantAggregator.scheduleConflicts;
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

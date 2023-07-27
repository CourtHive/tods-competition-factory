import { findTournamentExtension } from '../queryGovernor/extensionQueries';
import { getAccessorValue } from '../../../utilities/getAccessorValue';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter/matchUpsGetter';
import { getTieFormatDesc } from './getTieFormatDescription';
import { getTimeItem } from '../queryGovernor/timeItems';
import { getDetailsWTN } from './getDetailsWTN';
import { getAvgWTN } from './getAvgWTN';

import { MISSING_TOURNAMENT_ID } from '../../../constants/errorConditionConstants';
import { ADD_SCALE_ITEMS } from '../../../constants/topicConstants';
import { SEEDING } from '../../../constants/scaleConstants';
import {
  CONSOLATION,
  MAIN,
  PLAY_OFF,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';
import {
  PAIR,
  TEAM_PARTICIPANT,
} from '../../../constants/participantConstants';
import {
  AUDIT_POSITION_ACTIONS,
  DRAW_DELETIONS,
  FLIGHT_PROFILE,
} from '../../../constants/extensionConstants';

export function getStructureReports({
  firstFlightOnly = true,
  extensionProfiles,
  tournamentRecord,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_ID };

  const eventStructureReports = {};

  const extensionValues = Object.assign(
    {},
    ...(extensionProfiles || []).map(({ name, label, accessor }) => {
      const element = findTournamentExtension({
        tournamentRecord,
        name,
      })?.extension?.value;

      const value = accessor
        ? getAccessorValue({ element, accessor })?.value
        : element;

      return { [label || name]: value };
    })
  );

  const tournamentId = tournamentRecord?.tournamentId;
  const participantsProfile = { withScaleValues: true };
  const matchUps =
    allTournamentMatchUps({
      participantsProfile,
      tournamentRecord,
    }).matchUps || [];

  const getSeedingBasis = (timeItems) => {
    const timeItem = getTimeItem({
      itemType: ADD_SCALE_ITEMS,
      itemSubTypes: [SEEDING],
      element: { timeItems },
    })?.timeItem;
    return timeItem?.itemValue?.scaleBasis;
  };

  const tournamentStructureData = tournamentRecord?.events?.flatMap(
    ({
      timeItems: eventTimeItems,
      drawDefinitions = [],
      extensions,
      eventType,
      eventId,
      category,
    }) => {
      const flightProfile = extensions?.find((x) => x.name === FLIGHT_PROFILE);
      const flightNumbers = flightProfile?.value?.flights?.map((flight) => ({
        [flight.drawId]: flight.flightNumber,
      }));
      const flightMap = flightNumbers && Object.assign({}, ...flightNumbers);
      const drawDeletionsCount =
        extensions?.find((x) => x.name === DRAW_DELETIONS)?.value?.length || 0;

      const minFlightNumber =
        flightMap && Math.min(...Object.values(flightMap));

      const eventSeedingBasis = getSeedingBasis(eventTimeItems);

      eventStructureReports[eventId] = {
        totalPositionManipulations: 0,
        maxPositionManipulations: 0,
        generatedDrawsCount: 0,
        drawDeletionsCount,
        seedingBasis: eventSeedingBasis
          ? JSON.stringify(eventSeedingBasis)
          : undefined,
        tournamentId,
        eventId,
      };

      return (
        // check whether to only pull data from initial flights & ignore all other flights
        drawDefinitions
          .filter(
            (d) =>
              !firstFlightOnly ||
              !flightNumbers ||
              flightMap[d.drawId] === minFlightNumber
          )
          .flatMap(
            ({
              matchUpFormat: drawMatchUpFormat,
              tieFormat: drawTieFormat,
              timeItems: drawTimeItems,
              extensions,
              structures,
              drawType,
              drawId,
            }) => {
              const {
                avgConfidence,
                matchUpFormats,
                matchUpsCount,
                pctNoRating,
                avgWTN,
              } = getAvgWTN({
                eventType,
                matchUps,
                drawId,
              });

              const seedingBasis =
                getSeedingBasis(drawTimeItems) || eventSeedingBasis;

              const positionManipulations = getPositionManipulations({
                extensions,
              });
              const manipulationsCount = positionManipulations?.length || 0;

              eventStructureReports[eventId].totalPositionManipulations +=
                manipulationsCount;
              eventStructureReports[eventId].generatedDrawsCount += 1;

              if (
                manipulationsCount >
                eventStructureReports[eventId].maxPositionManipulations
              )
                eventStructureReports[eventId].maxPositionManipulations =
                  manipulationsCount;

              return structures
                ?.filter(
                  (s) =>
                    s.stageSequence === 1 &&
                    [QUALIFYING, MAIN, CONSOLATION, PLAY_OFF].includes(s.stage)
                )
                .map((s) => {
                  const finalMatchUp =
                    [MAIN, PLAY_OFF].includes(s.stage) &&
                    matchUps.find(
                      (matchUp) =>
                        matchUp.structureId === s.structureId &&
                        matchUp.finishingRound === 1 &&
                        matchUp.winningSide
                    );

                  const winningParticipant = finalMatchUp?.sides?.find(
                    (side) => side.sideNumber === finalMatchUp.winningSide
                  )?.participant;

                  const winningTeamId =
                    winningParticipant?.participantType === TEAM_PARTICIPANT &&
                    winningParticipant.participantId;

                  const { individualParticipants } =
                    (winningParticipant?.participantType === PAIR &&
                      winningParticipant) ||
                    {};

                  const winningPersonWTN = getDetailsWTN({
                    participant:
                      individualParticipants?.[0] || winningParticipant,
                    eventType,
                  });
                  const {
                    personId: winningPersonId,
                    personOtherId: winningPersonOtherId,
                    tennisId: winningPersonTennisId,
                    confidence: confidence1,
                    wtnRating: wtnRating1,
                  } = winningPersonWTN || {};

                  const winningPerson2WTN = getDetailsWTN({
                    participant: individualParticipants?.[1],
                    eventType,
                  });
                  const {
                    personId: winningPerson2Id,
                    personOtherId: winningPerson2OtherId,
                    tennisId: winningPerson2TennisId,
                    confidence: confidence2,
                    wtnRating: wtnRating2,
                  } = winningPerson2WTN || {};

                  const { ageCategoryCode, categoryName, subType } =
                    category || {};
                  const matchUpFormat = s.matchUpFormat || drawMatchUpFormat;
                  const matchUpsInitialFormat =
                    matchUpFormats[matchUpFormat] || 0;
                  const pctInitialMatchUpFormat =
                    (matchUpsInitialFormat / matchUpsCount) * 100;

                  const {
                    tieFormatName: drawTieFormatName,
                    tieFormatDesc: drawTieFormatDesc,
                  } = getTieFormatDesc(drawTieFormat);
                  const {
                    tieFormatName: structureTieFormatName,
                    tieFormatDesc: structureTieFormatDesc,
                  } = getTieFormatDesc(s.tieFormat);

                  const equivalentTieFormatDesc =
                    drawTieFormatDesc === structureTieFormatDesc;
                  const tieFormatName =
                    !equivalentTieFormatDesc && structureTieFormatName;
                  const tieFormatDesc =
                    s.tieFormat &&
                    !equivalentTieFormatDesc &&
                    structureTieFormatDesc;

                  const manipulations =
                    positionManipulations?.filter(
                      (action) => action.structureId === s.structureId
                    )?.length || 0;

                  return {
                    ...extensionValues,
                    tournamentId,
                    eventId,
                    structureId: s.structureId,
                    drawId,
                    eventType,
                    category: subType,
                    categoryName,
                    ageCategoryCode,
                    flightNumber: flightMap[drawId],
                    drawType,
                    stage: s.stage,
                    seedingBasis: seedingBasis
                      ? JSON.stringify(seedingBasis)
                      : undefined,
                    winningPersonId,
                    winningPersonOtherId,
                    winningPersonTennisId,
                    winningPersonWTNrating: wtnRating1,
                    winningPersonWTNconfidence: confidence1,
                    winningPerson2Id,
                    winningPerson2OtherId,
                    winningPerson2TennisId,
                    winningPerson2WTNrating: wtnRating2,
                    winningPerson2WTNconfidence: confidence2,
                    winningTeamId,
                    positionManipulations: manipulations,
                    pctNoRating,
                    matchUpFormat,
                    pctInitialMatchUpFormat,
                    matchUpsCount,
                    drawTieFormatName,
                    drawTieFormatDesc,
                    tieFormatName,
                    tieFormatDesc,
                    avgConfidence,
                    avgWTN,
                  };
                });
            }
          )
      );
    }
  );

  return {
    eventStructureReports: Object.values(eventStructureReports),
    structureReports: tournamentStructureData,
  };
}

function getPositionManipulations({ extensions }) {
  return extensions
    ?.find(({ name }) => name === AUDIT_POSITION_ACTIONS)
    ?.value?.slice(1);
}

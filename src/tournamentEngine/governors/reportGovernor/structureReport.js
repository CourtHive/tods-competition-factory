import { findTournamentExtension } from '../queryGovernor/extensionQueries';
import { getAccessorValue } from '../../../utilities/getAccessorValue';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getTieFormatDesc } from './getTieFormatDescription';
import { getDetailsWTN } from './getDetailsWTN';
import { getAvgWTN } from './getAvgWTN';

import { MISSING_TOURNAMENT_ID } from '../../../constants/errorConditionConstants';
import {
  AUDIT_POSITION_ACTIONS,
  DRAW_DELETIONS,
  FLIGHT_PROFILE,
} from '../../../constants/extensionConstants';
import {
  CONSOLATION,
  MAIN,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';

export function getStructureReports({
  firstFlightOnly = true,
  extensionProfiles,
  tournamentRecord,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_ID };

  const eventStructureReport = {};

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

  const tournamentStructureData = tournamentRecord?.events?.flatMap(
    ({ drawDefinitions = [], eventType, eventId, category, extensions }) => {
      const flightProfile = extensions?.find((x) => x.name === FLIGHT_PROFILE);
      const flightNumbers = flightProfile?.value?.flights?.map((flight) => ({
        [flight.drawId]: flight.flightNumber,
      }));
      const flightMap = flightNumbers && Object.assign({}, ...flightNumbers);
      const drawDeletionsCount =
        extensions?.find((x) => x.name === DRAW_DELETIONS)?.value?.length || 0;

      eventStructureReport[eventId] = {
        totalPositionManipulations: 0,
        maxPositionManipulations: 0,
        generatedDrawsCount: 0,
        drawDeletionsCount,
        tournamentId,
        eventId,
      };

      return (
        // check whether to only pull data from initial flights & ignore all other flights
        drawDefinitions
          .filter(
            (d) =>
              !firstFlightOnly || !flightNumbers || flightMap[d.drawId] === 1
          )
          .flatMap(
            ({
              matchUpFormat: drawMatchUpFormat,
              tieFormat: drawTieFormat,
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

              const positionManipulations = getPositionManipulations({
                extensions,
              });
              const manipulationsCount = positionManipulations?.length || 0;

              eventStructureReport[eventId].totalPositionManipulations +=
                manipulationsCount;
              eventStructureReport[eventId].generatedDrawsCount += 1;

              if (
                manipulationsCount >
                eventStructureReport[eventId].maxPositionManipulations
              )
                eventStructureReport[eventId].maxPositionManipulations =
                  manipulationsCount;

              return structures
                ?.filter(
                  (s) =>
                    s.stageSequence === 1 &&
                    [QUALIFYING, MAIN, CONSOLATION].includes(s.stage)
                )
                .map((s) => {
                  const finalMatchUp =
                    s.stage === MAIN &&
                    matchUps.find(
                      (matchUp) =>
                        matchUp.structureId === s.structureId &&
                        matchUp.finishingRound === 1 &&
                        matchUp.winningSide
                    );

                  const winningParticipant = finalMatchUp?.sides?.find(
                    (side) => side.sideNumber === finalMatchUp.winningSide
                  )?.participant;
                  const { individualParticipants, person, ratings, rankings } =
                    winningParticipant || {};

                  const winnerDetails = (
                    individualParticipants?.map(
                      ({ person, ratings, rankings }) => ({
                        rankings,
                        ratings,
                        person,
                      })
                    ) || [{ person, ratings, rankings }]
                  ).filter((x) => x?.person);
                  const winningPersonWTN = getDetailsWTN({
                    participant: winnerDetails?.[0],
                    eventType,
                  });
                  const {
                    personId: winningPersonId,
                    confidence: confidence1,
                    wtnRating: wtnRating1,
                  } = winningPersonWTN || {};

                  const winningPerson2WTN = getDetailsWTN({
                    participant: winnerDetails?.[1],
                    eventType,
                  });
                  const {
                    personId: winningPerson2Id,
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

                  const tieFormat = s.tieFormat || drawTieFormat;
                  const { tieFormatName, tieFormatDesc } =
                    getTieFormatDesc(tieFormat);

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
                    winningPersonId,
                    winningPersonWTNrating: wtnRating1,
                    winningPersonWTNconfidence: confidence1,
                    winningPerson2Id,
                    winningPerson2WTNrating: wtnRating2,
                    winningPerson2WTNconfidence: confidence2,
                    positionManipulations: manipulations,
                    pctNoRating,
                    matchUpFormat,
                    pctInitialMatchUpFormat,
                    matchUpsCount,
                    tieFormatDesc,
                    tieFormatName,
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
    eventStructureReport: Object.values(eventStructureReport),
    structureReport: tournamentStructureData,
  };
}

function getPositionManipulations({ extensions }) {
  const positionManipulations = extensions
    ?.find(({ name }) => name === AUDIT_POSITION_ACTIONS)
    ?.value?.slice(1);
  return positionManipulations;
}

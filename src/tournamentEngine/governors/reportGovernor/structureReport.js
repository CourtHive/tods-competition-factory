import { findTournamentExtension } from '../queryGovernor/extensionQueries';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { getTieFormatDesc } from './getTieFormatDescription';
import { getDetailsWTN } from './getDetailsWTN';
import { getAvgWTN } from './getAvgWTN';

import { MISSING_TOURNAMENT_ID } from '../../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../../constants/extensionConstants';
import {
  CONSOLATION,
  MAIN,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';

export function structureReport({ firstFlightOnly = true, tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_ID };

  const level = findTournamentExtension({ name: 'level', tournamentRecord })
    ?.extension?.value?.level;
  const levelOrder = level?.orderIndex;
  const districtCode = findTournamentExtension({
    name: 'districtCode',
    tournamentRecord,
  })?.extension?.value;
  const sectionCode = findTournamentExtension({
    name: 'sectionCode',
    tournamentRecord,
  })?.extension?.value;

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

      return (
        // check whether to only pull data from initial flights & ignore all other flights
        drawDefinitions
          .filter(
            (d) =>
              !firstFlightOnly || !flightNumbers || flightMap[d.drawId] === 1
          )
          .flatMap(
            ({
              structures,
              drawId,
              drawType,
              matchUpFormat: drawMatchUpFormat,
              tieFormat: drawTieFormat,
            }) => {
              const {
                avgWTN,
                avgConfidence,
                matchUpFormats,
                matchUpsCount,
                pctNoRating,
              } = getAvgWTN({
                eventType,
                matchUps,
                drawId,
              });

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
                        person,
                        ratings,
                        rankings,
                      })
                    ) || [{ person, ratings, rankings }]
                  ).filter((x) => x?.person);
                  const winningPersonWTN = getDetailsWTN({
                    participant: winnerDetails?.[0],
                    eventType,
                  });
                  const {
                    personId: winningPersonId,
                    wtnRating: wtnRating1,
                    confidence: confidence1,
                  } = winningPersonWTN || {};

                  const winningPerson2WTN = getDetailsWTN({
                    participant: winnerDetails?.[1],
                    eventType,
                  });
                  const {
                    personId: winningPerson2Id,
                    wtnRating: wtnRating2,
                    confidence: confidence2,
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

                  return {
                    tournamentId,
                    levelOrder,
                    sectionCode,
                    districtCode,
                    eventId,
                    eventType,
                    category: subType,
                    categoryName,
                    ageCategoryCode,
                    flightNumber: flightMap[drawId],
                    drawId,
                    drawType,
                    stage: s.stage,
                    winningPersonId,
                    winningPersonWTNrating: wtnRating1,
                    winningPersonWTNconfidence: confidence1,
                    winningPerson2Id,
                    winningPerson2WTNrating: wtnRating2,
                    winningPerson2WTNconfidence: confidence2,
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

  return tournamentStructureData;
}

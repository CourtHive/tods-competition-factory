import { findTournamentExtension } from '../queryGovernor/extensionQueries';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';

import { MISSING_TOURNAMENT_ID } from '../../../constants/errorConditionConstants';
import { FLIGHT_PROFILE } from '../../../constants/extensionConstants';
import { DOUBLES_MATCHUP } from '../../../constants/matchUpTypes';
import { WTN } from '../../../constants/ratingConstants';
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
                  const winningPersonId = winnerDetails?.[0]?.person?.personId;
                  const winningPersonWTN = winnerDetails?.[0]?.ratings?.[
                    eventType
                  ]?.find(({ scaleName }) => scaleName === WTN)?.scaleValue;
                  const { wtnRating: wtnRating1, confidence: confidence1 } =
                    winningPersonWTN || {};

                  const winningPerson2Id = winnerDetails?.[1]?.person?.personId;
                  const winningPerson2WTN = winnerDetails?.[1]?.ratings?.[
                    eventType
                  ]?.find(({ scaleName }) => scaleName === WTN)?.scaleValue;
                  const { wtnRating: wtnRating2, confidence: confidence2 } =
                    winningPerson2WTN || {};

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

function getAvgWTN({ matchUps, drawId, eventId, eventType }) {
  const matchUpFormats = {};

  const countMatchUpFormat = ({ matchUpFormat }) => {
    if (!matchUpFormat) return;
    if (!matchUpFormats[matchUpFormat]) matchUpFormats[matchUpFormat] = 0;
    matchUpFormats[matchUpFormat] += 1;
  };
  const participantsMap = matchUps
    .filter((matchUp) =>
      eventId ? matchUp.eventId === eventId : matchUp.drawId === drawId
    )
    .reduce((participants, matchUp) => {
      countMatchUpFormat(matchUp);
      (matchUp.sides || [])
        .flatMap((side) =>
          (
            side?.participant?.individualParticipants || [side?.participant]
          ).filter(Boolean)
        )
        .forEach(
          (participant) =>
            (participants[participant.participantId] = participant)
        );
      return participants;
    }, {});
  const eventParticipants = Object.values(participantsMap);
  const wtnRatings = eventParticipants
    .map((participant) => getWTNdetails({ participant, eventType }))
    .filter(({ wtnRating }) => wtnRating);

  const pctNoRating =
    ((eventParticipants.length - wtnRatings.length) /
      eventParticipants.length) *
    100;

  const wtnTotals = wtnRatings.reduce(
    (totals, wtnDetails) => {
      const { wtnRating, confidence } = wtnDetails;
      totals.totalWTN += wtnRating;
      totals.totalConfidence += confidence;
      return totals;
    },
    { totalWTN: 0, totalConfidence: 0 }
  );
  const avgWTN = wtnTotals.totalWTN / wtnRatings.length;
  const avgConfidence = wtnTotals.totalConfidence / wtnRatings.length;

  const matchUpsCount = Object.values(matchUpFormats).reduce(
    (p, c) => (p += c || 0),
    0
  );

  return { avgWTN, avgConfidence, matchUpFormats, matchUpsCount, pctNoRating };
}

function getWTNdetails({ participant, eventType }) {
  const personId = participant?.person?.personId;
  const personWTN = participant?.ratings?.[eventType]?.find(
    ({ scaleName }) => scaleName === WTN
  )?.scaleValue;
  const { wtnRating, confidence } = personWTN || {};
  return { personId, wtnRating, confidence };
}

function getTieFormatDesc(tieFormat) {
  if (!tieFormat) return {};
  const tieFormatName = tieFormat.tieFormatName;
  const collectionDesc = tieFormat.collectionDefinitions
    ?.map((def) => {
      const { matchUpType, matchUpFormat, matchUpCount, category } = def;
      const ageCategoryCode = category?.ageCategoryCode;
      const matchUpTypeCode = matchUpType === DOUBLES_MATCHUP ? 'D' : 'S';
      return [
        matchUpCount,
        matchUpTypeCode,
        ageCategoryCode,
        matchUpFormat,
      ].join(';');
    })
    .join('|');
  return {
    tieFormatName: tieFormat ? tieFormatName || 'UNNAMED' : undefined,
    tieFormatDesc: [collectionDesc].join('='),
  };
}

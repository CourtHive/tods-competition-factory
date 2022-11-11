import { addStructureParticipation } from './addStructureParticipation';

import { DEFAULTED, WALKOVER } from '../../../constants/matchUpStatusConstants';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import {
  PAIR,
  TEAM_PARTICIPANT,
} from '../../../constants/participantConstants';

export function processSides({
  withTeamMatchUps,
  participantMap,
  withOpponents,
  withMatchUps,
  withEvents,
  withDraws,

  finishingPositionRange,
  finishingRound,
  matchUpStatus,
  stageSequence,
  roundNumber,
  structureId,
  stage,

  withRankingProfile,
  tieWinningSide,
  matchUpTieId,
  matchUpSides,
  matchUpType,
  winningSide,
  matchUpId,
  eventId,
  drawId,
  sides,
}) {
  const opponents =
    withOpponents &&
    sides?.length === 2 &&
    Object.assign(
      {},
      ...sides
        .map(({ sideNumber }, i) => {
          const opponentParticipantId = sides[1 - i].participantId;
          return (
            sideNumber && {
              [sideNumber]: opponentParticipantId,
            }
          );
        })
        .filter(Boolean)
    );

  for (const side of sides) {
    const { participantId, sideNumber } = side;
    const participantWon = winningSide === sideNumber;

    const getOpponentInfo = (opponentParticipantId) => {
      const opponent = participantMap[opponentParticipantId]?.participant;
      const participantType = opponent?.participantType;
      const info = [
        {
          participantId: opponentParticipantId,
          participantType,
        },
      ];

      if (participantType !== TEAM_PARTICIPANT) {
        for (const participantId of opponent?.individualParticipantIds || []) {
          const participant = participantMap[participantId]?.participant;
          info.push({
            participantType: participant?.participantType,
            participantId,
          });
        }
      }

      return info;
    };

    const addMatchUp = (participantId, opponentParticipantId) => {
      if (withMatchUps) {
        const opponentParticipantInfo =
          withOpponents && getOpponentInfo(opponentParticipantId);
        participantMap[participantId].matchUps[matchUpId] = {
          opponentParticipantInfo,
          participantWon,
          matchUpType,
          sideNumber,
          matchUpId,
        };
      }
      if (withRankingProfile) {
        addStructureParticipation({
          finishingPositionRange,
          participantMap,
          participantWon,
          finishingRound,
          matchUpStatus,
          participantId,
          stageSequence,
          roundNumber,
          structureId,
          matchUpId,
          drawId,
          stage,
        });
      }
    };

    const addPartnerParticiapntId = (element, partnerParticipantId) => {
      if (element) {
        if (!element.partnerParticipantIds) element.partnerParticipantIds = [];
        if (!element.partnerParticipantIds.includes(partnerParticipantId))
          element.partnerParticipantIds.push(partnerParticipantId);
      }
    };

    const addPartner = ({ participantId, partnerParticipantId }) => {
      if (withDraws)
        addPartnerParticiapntId(
          participantMap[participantId]?.draws?.[drawId],
          partnerParticipantId
        );
      if (withEvents) {
        addPartnerParticiapntId(
          participantMap[participantId]?.events?.[eventId],
          partnerParticipantId
        );
      }
      if (withMatchUps) {
        addPartnerParticiapntId(
          participantMap[participantId]?.matchUps?.[matchUpId],
          partnerParticipantId
        );
      }
    };

    if (participantId) {
      const opponentParticipantId = opponents?.[sideNumber];

      addMatchUp(participantId, opponentParticipantId);

      if (withOpponents && opponentParticipantId) {
        participantMap[participantId].opponents[opponentParticipantId] = {
          participantId: opponentParticipantId,
          matchUpId,
          eventId,
          drawId,
        };
      }

      const isPair =
        participantMap[participantId].participant.participantType === PAIR;
      const individualParticipantIds =
        participantMap[participantId].participant.individualParticipantIds ||
        [];

      if (matchUpTieId) {
        if (withTeamMatchUps) {
          const addTeamMatchUp = (participantId) =>
            (participantMap[participantId].matchUps[matchUpTieId] = {
              participantWon: tieWinningSide === sideNumber,
              matchUpType: TEAM_MATCHUP,
              matchUpId: matchUpTieId,
              sideNumber,
            });
          addTeamMatchUp(participantId);
          individualParticipantIds.forEach(addTeamMatchUp);
        }

        if (withDraws) {
          if (!participantMap[participantId].draws[drawId]) {
            const teamParticipantId = matchUpSides.find(
              (s) => s.sideNumber === sideNumber
            )?.participant?.participantId;
            const teamEntryStatus =
              participantMap[teamParticipantId]?.draws?.[drawId]?.entryStatus;

            const addDrawData = (participantId) =>
              (participantMap[participantId].draws[drawId] = {
                entryStatus: teamEntryStatus,
                // add positions played in lineUp collections
                eventId,
                drawId,
              });
            addDrawData(participantId);
            individualParticipantIds.forEach(addDrawData);
          }
        }
      }

      if (isPair) {
        individualParticipantIds.forEach((participantId) =>
          addMatchUp(participantId, opponentParticipantId)
        );
        individualParticipantIds.forEach((participantId, i) => {
          const partnerParticipantId = individualParticipantIds[1 - i];
          addPartner({ participantId, partnerParticipantId });
        });

        // in TEAM events PAIR participants do not appear in entries
        if (withEvents && matchUpSides) {
          const teamParticipantId = matchUpSides.find(
            (s) => s.sideNumber === sideNumber
          )?.participant?.participantId;
          const teamEntry = participantMap[teamParticipantId].events[eventId];

          participantMap[participantId].events[eventId] = teamEntry;
          individualParticipantIds.forEach(
            (individualParticiapntId) =>
              (participantMap[individualParticiapntId].events[eventId] =
                teamEntry)
          );
        }
      }

      if (winningSide) {
        const processParticipantId = (id) => {
          if (participantWon) {
            participantMap[id].counters[matchUpType].wins += 1;
            participantMap[id].counters.wins += 1;
            if (matchUpStatus === WALKOVER) {
              participantMap[id].counters[matchUpType].walkoverWins += 1;
              participantMap[id].counters.walkoverWins += 1;
            }
            if (matchUpStatus === DEFAULTED) {
              participantMap[id].counters[matchUpType].defaultWins += 1;
              participantMap[id].counters.defaultWins += 1;
            }
          } else {
            participantMap[id].counters[matchUpType].losses += 1;
            participantMap[id].counters.losses += 1;
            if (matchUpStatus === WALKOVER) {
              participantMap[id].counters[matchUpType].walkovers += 1;
              participantMap[id].counters.walkovers += 1;
            }
            if (matchUpStatus === DEFAULTED) {
              participantMap[id].counters[matchUpType].defaults += 1;
              participantMap[id].counters.defaults += 1;
            }
          }
        };
        processParticipantId(participantId);
        individualParticipantIds.forEach(processParticipantId);
      }
    }
  }
}

import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { deleteParticipants } from '../participantGovernor/deleteParticipants';
import { addParticipant } from '../participantGovernor/addParticipants';
import { updateTeamLineUp } from './drawDefinitions/updateTeamLineUp';
import { getTieMatchUpContext } from './getTieMatchUpContext';
import { intersection } from '../../../utilities';

import { COMPETITOR } from '../../../constants/participantRoles';
import { SUCCESS } from '../../../constants/resultConstants';
import { PAIR } from '../../../constants/participantTypes';
import { DOUBLES } from '../../../constants/matchUpTypes';
import {
  INVALID_PARTICIPANT_TYPE,
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function replaceTieMatchUpParticipantId(params) {
  const matchUpContext = getTieMatchUpContext(params);
  if (matchUpContext.error) return matchUpContext;

  const {
    existingParticipantId,
    tournamentRecord,
    newParticipantId,
    drawDefinition,
  } = params;

  if (!existingParticipantId || !newParticipantId)
    return { error: MISSING_PARTICIPANT_ID };

  const {
    collectionPosition,
    teamParticipants,
    collectionId,
    dualMatchUp,
    tieMatchUp,
    tieFormat,
  } = matchUpContext;

  const { matchUpType } = tieMatchUp;

  const side = tieMatchUp.sides.find(
    (side) =>
      side.participant?.participantId === existingParticipantId ||
      side.participant?.individualParticipantIds?.includes(
        existingParticipantId
      )
  );
  if (!side) return { error: PARTICIPANT_NOT_FOUND };

  const { tournamentParticipants: targetParticipants } =
    getTournamentParticipants({
      tournamentRecord,
      participantFilters: {
        participantIds: [existingParticipantId, newParticipantId],
      },
    });

  if (targetParticipants.length !== 2) return { error: MISSING_PARTICIPANT_ID };
  if (
    targetParticipants[0].participantType !==
    targetParticipants[1].participantType
  )
    return { error: INVALID_PARTICIPANT_TYPE };

  const dualMatchUpSide = dualMatchUp.sides.find(
    ({ sideNumber }) => sideNumber === side.sideNumber
  );

  let newParticipantIdInLineUp;
  const modifiedLineUp =
    dualMatchUpSide.lineUp?.map((teamCompetitor) => {
      if (
        ![existingParticipantId, newParticipantId].includes(
          teamCompetitor.participantId
        )
      ) {
        return teamCompetitor;
      }

      if (
        [existingParticipantId, newParticipantId].includes(
          teamCompetitor.participantId
        )
      ) {
        const collectionAssignments =
          teamCompetitor.collectionAssignments?.filter(
            (assignment) =>
              !(
                assignment.collectionId === collectionId &&
                assignment.collectionPosition === collectionPosition
              )
          );
        return {
          participantId: teamCompetitor.participantId,
          collectionAssignments,
        };
      }

      if (teamCompetitor.participantId === newParticipantId) {
        newParticipantIdInLineUp = true;
        if (!teamCompetitor.collectionAssignments)
          teamCompetitor.collectionAssignments = [];
        teamCompetitor.collectionAssignments.push({
          collectionId,
          collectionPosition,
        });
        return teamCompetitor;
      }
    }) || [];

  if (!newParticipantIdInLineUp) {
    modifiedLineUp.push({
      participantId: newParticipantId,
      collectionAssignments: [{ collectionId, collectionPosition }],
    });
  }

  const isDoubles = matchUpType === DOUBLES;

  const existingIndividualParticipantIds =
    isDoubles &&
    dualMatchUpSide.lineUp
      .map((teamCompetitor) => {
        const assignment = teamCompetitor.collectionAssignments?.find(
          (assignment) =>
            assignment.collectionId === collectionId &&
            assignment.collectionPosition === collectionPosition
        );
        return assignment && teamCompetitor.participantId;
      })
      .filter(Boolean);

  // now check whether new pairParticipant exists
  const individualParticipantIds =
    isDoubles &&
    modifiedLineUp
      .map((teamCompetitor) => {
        const assignment = teamCompetitor.collectionAssignments?.find(
          (assignment) =>
            assignment.collectionId === collectionId &&
            assignment.collectionPosition === collectionPosition
        );
        return assignment && teamCompetitor.participantId;
      })
      .filter(Boolean);

  dualMatchUpSide.lineUp = modifiedLineUp;

  const teamParticipantId = teamParticipants.find(
    (participant) =>
      intersection(participant?.individualParticipantIds || [], [
        existingParticipantId,
        newParticipantId,
      ]).length
  )?.participantId;

  teamParticipantId &&
    updateTeamLineUp({
      participantId: teamParticipantId,
      lineUp: modifiedLineUp,
      drawDefinition,
      tieFormat,
    });

  let participantAdded, participantRemoved;
  if (isDoubles) {
    const { tournamentRecord } = params;
    let result = getPairedParticipant({
      participantIds: individualParticipantIds,
      tournamentRecord,
    });

    if (!result.participant) {
      const participant = {
        individualParticipantIds,
        participantType: PAIR,
        participantRole: COMPETITOR,
      };
      const result = addParticipant({
        tournamentRecord,
        pairOverride: true,
        participant,
      });
      if (result.error) return result;
      participantAdded = result.participant?.participantId;
    }

    // now attempt to cleanup/delete previous pairParticipant
    result = getPairedParticipant({
      participantIds: existingIndividualParticipantIds,
      tournamentRecord,
    });
    const existingPairParticipantId = result.participant?.participantId;
    if (existingPairParticipantId) {
      const result = deleteParticipants({
        participantIds: [existingPairParticipantId],
        tournamentRecord,
      });
      if (result.success) participantRemoved = existingPairParticipantId;
    }
  }

  return { ...SUCCESS, participantRemoved, participantAdded };
}

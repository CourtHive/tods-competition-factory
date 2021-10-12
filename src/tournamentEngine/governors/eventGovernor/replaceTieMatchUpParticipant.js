import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { deleteParticipants } from '../participantGovernor/deleteParticipants';
import { addParticipant } from '../participantGovernor/addParticipants';
import { getTieMatchUpContext } from './getTieMatchUpContext';

import { COMPETITOR } from '../../../constants/participantRoles';
import { SUCCESS } from '../../../constants/resultConstants';
import { PAIR } from '../../../constants/participantTypes';
import { DOUBLES } from '../../../constants/matchUpTypes';
import {
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function replaceTieMatchUpParticipantId(params) {
  const result = getTieMatchUpContext(params);
  if (result.error) return result;

  const { existingParticipantId, newParticipantId } = params;
  if (!existingParticipantId || !newParticipantId)
    return { error: MISSING_PARTICIPANT_ID };

  const { collectionPosition, collectionId, dualMatchUp, tieMatchUp } = result;
  const { matchUpType } = tieMatchUp;

  const side = tieMatchUp.sides.find(
    (side) =>
      side.participant?.participantId === existingParticipantId ||
      side.participant?.individualParticipantIds?.includes(
        existingParticipantId
      )
  );
  if (!side) return { error: PARTICIPANT_NOT_FOUND };

  const dualMatchUpSide = dualMatchUp.sides.find(
    ({ sideNumber }) => sideNumber === side.sideNumber
  );

  let newParticipantIdInLineUp;
  const modifiedLineUp = dualMatchUpSide.lineUp.map((teamCompetitor) => {
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
  });

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

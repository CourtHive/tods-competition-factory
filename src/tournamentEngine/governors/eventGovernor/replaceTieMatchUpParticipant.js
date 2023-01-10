import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { modifyMatchUpNotice } from '../../../drawEngine/notifications/drawNotifications';
import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { deleteParticipants } from '../participantGovernor/deleteParticipants';
import { addParticipant } from '../participantGovernor/addParticipants';
import { updateTeamLineUp } from './drawDefinitions/updateTeamLineUp';
import { findExtension } from '../queryGovernor/extensionQueries';
import { getTieMatchUpContext } from './getTieMatchUpContext';

import { COMPETITOR } from '../../../constants/participantRoles';
import { LINEUPS } from '../../../constants/extensionConstants';
import { PAIR } from '../../../constants/participantConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { DOUBLES } from '../../../constants/matchUpTypes';
import {
  INVALID_PARTICIPANT_TYPE,
  MISSING_PARTICIPANT_ID,
  NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function replaceTieMatchUpParticipantId(params) {
  const matchUpContext = getTieMatchUpContext(params);
  if (matchUpContext.error) return matchUpContext;
  const stack = 'replaceTieMatchUpParticipantid';

  const {
    existingParticipantId,
    tournamentRecord,
    newParticipantId,
    drawDefinition,
  } = params;

  if (!existingParticipantId || !newParticipantId)
    return { error: MISSING_PARTICIPANT_ID };

  const {
    inContextDualMatchUp,
    collectionPosition,
    collectionId,
    dualMatchUp,
    tieMatchUp,
    tieFormat,
  } = matchUpContext;

  const { matchUpType } = tieMatchUp;

  const side = tieMatchUp.sides?.find(
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

  const { extension } = findExtension({
    element: drawDefinition,
    name: LINEUPS,
  });

  const lineUps = extension?.value || {};

  if (!dualMatchUp.sides?.length) {
    const extractSideDetail = ({
      displaySideNumber,
      drawPosition,
      sideNumber,
    }) => ({ drawPosition, sideNumber, displaySideNumber });

    dualMatchUp.sides = inContextDualMatchUp.sides.map((side) => {
      const participantId = side.participantId;
      return {
        ...extractSideDetail(side),
        lineUp: (participantId && lineUps[participantId]) || [],
      };
    });
  }

  const dualMatchUpSide = dualMatchUp.sides.find(
    ({ sideNumber }) => sideNumber === side.sideNumber
  );

  if (!dualMatchUpSide) {
    return {
      error: NOT_FOUND,
      existingParticipantId,
      sideNumber: side.sideNumber,
    };
  }

  const teamParticipantId = inContextDualMatchUp.sides?.find(
    ({ sideNumber }) => sideNumber === side.sideNumber
  )?.participantId;

  const teamLineUp = dualMatchUpSide.lineUp;
  const newParticipantIdInLineUp = teamLineUp?.find(
    ({ participantId }) => newParticipantId === participantId
  );

  const modifiedLineUp =
    teamLineUp?.map((teamCompetitor) => {
      // if the current competitor is not either id, return as is
      if (
        ![existingParticipantId, newParticipantId].includes(
          teamCompetitor.participantId
        )
      ) {
        return teamCompetitor;
      }

      // if current competitor includes an id then filter out current assignment
      if (
        [existingParticipantId, newParticipantId].includes(
          teamCompetitor.participantId
        )
      ) {
        teamCompetitor.collectionAssignments =
          teamCompetitor.collectionAssignments?.filter(
            (assignment) =>
              !(
                assignment.collectionId === collectionId &&
                assignment.collectionPosition === collectionPosition
              )
          );
      }

      // if current competitor is newParticipantId, push the new assignment
      if (teamCompetitor.participantId === newParticipantId) {
        if (!teamCompetitor.collectionAssignments)
          teamCompetitor.collectionAssignments = [];
        teamCompetitor.collectionAssignments.push({
          collectionPosition,
          collectionId,
        });
      }

      return teamCompetitor;
    }) || [];

  if (!newParticipantIdInLineUp) {
    modifiedLineUp.push({
      collectionAssignments: [{ collectionId, collectionPosition }],
      participantId: newParticipantId,
    });
  }

  const isDoubles = matchUpType === DOUBLES;

  const existingIndividualParticipantIds =
    isDoubles &&
    teamLineUp
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

  if (teamParticipantId) {
    const result = updateTeamLineUp({
      participantId: teamParticipantId,
      lineUp: modifiedLineUp,
      drawDefinition,
      tieFormat,
    });
    if (result.error) return result;
  } else {
    console.log('team participantId not found');
  }

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
        returnParticipant: true,
        pairOverride: true,
        tournamentRecord,
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

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    matchUp: dualMatchUp,
    context: stack,
    drawDefinition,
  });

  return { ...SUCCESS, participantRemoved, participantAdded };
}

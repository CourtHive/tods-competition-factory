import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { modifyMatchUpNotice } from '../../../drawEngine/notifications/drawNotifications';
import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { deleteParticipants } from '../participantGovernor/deleteParticipants';
import { modifyParticipant } from '../participantGovernor/modifyParticipant';
import { removeCollectionAssignments } from './removeCollectionAssignments';
import { addParticipant } from '../participantGovernor/addParticipants';
import { updateTeamLineUp } from './drawDefinitions/updateTeamLineUp';
import { findExtension } from '../queryGovernor/extensionQueries';
import { getTieMatchUpContext } from './getTieMatchUpContext';

import { INDIVIDUAL, PAIR } from '../../../constants/participantConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import { LINEUPS } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  EXISTING_OUTCOME,
  INVALID_PARTICIPANT,
  MISSING_PARTICIPANT_ID,
  NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function removeTieMatchUpParticipantId(params) {
  const { tournamentRecord, drawDefinition, participantId } = params;
  const stack = 'removeTieMatchUpParticiapantId';

  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const matchUpContext = getTieMatchUpContext(params);
  if (matchUpContext.error) return matchUpContext;

  const {
    inContextDualMatchUp,
    relevantAssignments,
    collectionPosition,
    teamParticipants,
    collectionId,
    matchUpType,
    dualMatchUp,
    tieMatchUp,
    tieFormat,
  } = matchUpContext;

  if (scoreHasValue({ score: tieMatchUp.score }) || tieMatchUp.winningSide)
    return { error: EXISTING_OUTCOME };

  const side = tieMatchUp.sides?.find(
    (side) =>
      side.participant?.participantId === participantId ||
      side.participant?.individualParticipantIds?.includes(participantId)
  );
  if (!side) return { error: PARTICIPANT_NOT_FOUND };

  const teamParticipantId = inContextDualMatchUp.sides?.find(
    ({ sideNumber }) => sideNumber === side.sideNumber
  )?.participantId;

  if (!teamParticipantId) return { error: PARTICIPANT_NOT_FOUND };

  const {
    tournamentParticipants: [participantToRemove],
  } = getTournamentParticipants({
    tournamentRecord,
    participantFilters: {
      participantIds: [participantId],
    },
  });

  if (!participantToRemove) {
    return { error: PARTICIPANT_NOT_FOUND };
  }

  if (matchUpType === SINGLES && participantToRemove.participantType === PAIR) {
    return { error: INVALID_PARTICIPANT };
  }

  const participantIds =
    participantToRemove.participantType === INDIVIDUAL
      ? [participantId]
      : participantToRemove.individualParticipantIds;

  if (!dualMatchUp.sides) {
    const { extension } = findExtension({
      element: drawDefinition,
      name: LINEUPS,
    });

    const lineUps = extension?.value || {};

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

  let dualMatchUpSide = dualMatchUp.sides?.find(
    ({ sideNumber }) => sideNumber === side.sideNumber
  );

  if (
    !dualMatchUpSide &&
    (dualMatchUp.sides?.filter(({ lineUp }) => !lineUp).length || 0) < 2
  ) {
    const drawPositionMap = teamParticipants.map(
      ({ participantId: teamParticipantId }) => ({
        drawPosition: relevantAssignments.find(
          (assignment) => assignment.participantId === teamParticipantId
        )?.drawPosition,
        teamParticipantId,
      })
    );

    dualMatchUpSide = dualMatchUp.sides?.find(
      (side) =>
        drawPositionMap.find(
          ({ drawPosition }) => drawPosition === side.drawPosition
        )?.teamParticipantId === teamParticipantId
    );
  }

  if (!dualMatchUpSide) {
    return { error: NOT_FOUND, participantId };
  }

  const { modifiedLineUp } = removeCollectionAssignments({
    collectionPosition,
    teamParticipantId,
    dualMatchUpSide,
    participantIds,
    drawDefinition,
    collectionId,
  });

  dualMatchUpSide.lineUp = modifiedLineUp;

  teamParticipantId &&
    updateTeamLineUp({
      participantId: teamParticipantId,
      lineUp: modifiedLineUp,
      drawDefinition,
      tieFormat,
    });

  // if an INDIVIDUAL participant is being removed from a DOUBLES matchUp
  // ...then the PAIR participant may need to be modified
  if (
    matchUpType === DOUBLES &&
    participantToRemove.participantType === INDIVIDUAL
  ) {
    const tieMatchUpSide = tieMatchUp.sides?.find(
      (side) => side.sideNumber === dualMatchUpSide.sideNumber
    );

    const { participantId: pairParticipantId } = tieMatchUpSide || {};
    const {
      tournamentParticipants: [pairParticipant],
    } = getTournamentParticipants({
      tournamentRecord,
      participantFilters: {
        participantIds: [pairParticipantId],
      },
      withEvents: true,
    });

    if (pairParticipant) {
      const individualParticipantIds =
        pairParticipant?.individualParticipantIds.filter(
          (currentId) => currentId !== participantId
        );

      // don't modify pair participant that is part of other events/draws
      if (!pairParticipant.draws.length) {
        if (individualParticipantIds.length) {
          pairParticipant.individualParticipantIds = individualParticipantIds;
          const result = modifyParticipant({
            participant: pairParticipant,
            pairOverride: true,
            tournamentRecord,
          });
          if (result.error) return result;
        } else {
          const result = deleteParticipants({
            participantIds: [pairParticipantId],
            tournamentRecord,
          });
          if (result.error) console.log('cleanup', { result });
        }
      } else {
        if (individualParticipantIds.length === 1) {
          // check to see if a pair with one individualParticipantId needs to be created
          const { participant: existingParticipant } = getPairedParticipant({
            participantIds: individualParticipantIds,
            tournamentRecord,
          });
          if (!existingParticipant) {
            const newPairParticipant = {
              participantRole: COMPETITOR,
              individualParticipantIds,
              participantType: PAIR,
            };
            const result = addParticipant({
              participant: newPairParticipant,
              pairOverride: true,
              tournamentRecord,
            });
            if (result.error) return result;
          }
        }
      }
    } else {
      return { error: PARTICIPANT_NOT_FOUND };
    }
  }

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    matchUp: dualMatchUp,
    context: stack,
    drawDefinition,
  });

  return { ...SUCCESS, modifiedLineUp };
}

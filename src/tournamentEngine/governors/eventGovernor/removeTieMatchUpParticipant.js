import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { findLineUpWithParticipantIds } from './drawDefinitions/findLineUpWithParticipantIds';
import { scoreHasValue } from '../../../drawEngine/governors/matchUpGovernor/scoreHasValue';
import { modifyMatchUpNotice } from '../../../drawEngine/notifications/drawNotifications';
import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { deleteParticipants } from '../participantGovernor/deleteParticipants';
import { modifyParticipant } from '../participantGovernor/modifyParticipant';
import { removeCollectionAssignments } from './removeCollectionAssignments';
import { addParticipant } from '../participantGovernor/addParticipants';
import { updateTeamLineUp } from './drawDefinitions/updateTeamLineUp';
import { getTieMatchUpContext } from './getTieMatchUpContext';
import { intersection } from '../../../utilities';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
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

  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const matchUpContext = getTieMatchUpContext(params);
  if (matchUpContext.error) return matchUpContext;

  const {
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

  if (!dualMatchUp.sides)
    dualMatchUp.sides = [{ sideNumber: 1 }, { sideNumber: 2 }];

  let dualMatchUpSide = dualMatchUp.sides?.find(
    ({ sideNumber }) => sideNumber === side.sideNumber
  );

  const templateTeamLineUp = findLineUpWithParticipantIds({
    drawDefinition,
    participantIds,
  });
  const teamParticipantId =
    templateTeamLineUp?.teamParticipantId ||
    teamParticipants?.find(
      (participant) =>
        intersection(
          participant?.individualParticipantIds || [],
          participantIds
        ).length === participantIds.length
    )?.participantId;

  if (!teamParticipantId) return { error: PARTICIPANT_NOT_FOUND };

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
    console.log({ drawPositionMap });

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

  modifyMatchUpNotice({ drawDefinition, matchUp: dualMatchUp });

  return { ...SUCCESS, modifiedLineUp };
}

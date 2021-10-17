import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { deleteParticipants } from '../participantGovernor/deleteParticipants';
import { modifyParticipant } from '../participantGovernor/modifyParticipant';
import { removeCollectionAssignments } from './removeCollectionAssignments';
import { addParticipant } from '../participantGovernor/addParticipants';
import { getTieMatchUpContext } from './getTieMatchUpContext';
import { overlap } from '../../../utilities';

import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_PARTICIPANT_TYPE,
  MISSING_COLLECTION_DEFINITION,
  MISSING_PARTICIPANT_ID,
  MISSING_TIE_FORMAT,
  PARTICIPANT_NOT_FOUND,
  TEAM_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function assignTieMatchUpParticipantId(params) {
  const result = getTieMatchUpContext(params);
  if (result.error) return result;

  const { tournamentRecord, drawDefinition, participantId, teamParticipantId } =
    params;
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const {
    relevantAssignments,
    collectionPosition,
    teamParticipants,
    collectionId,
    matchUpType,
    dualMatchUp,
    tieMatchUp,
    structure,
  } = result;

  const {
    tournamentParticipants: [participantToAssign],
  } = getTournamentParticipants({
    tournamentRecord,
    participantFilters: {
      participantIds: [participantId],
    },
  });

  if (!participantToAssign) {
    return { error: PARTICIPANT_NOT_FOUND };
  }

  const { individualParticipantIds, participantType } = participantToAssign;

  // check that the participantToAssign is the correct participantType for tieMatchUp.matchUpType
  if (matchUpType === SINGLES && participantType !== INDIVIDUAL) {
    return { error: INVALID_PARTICIPANT_TYPE };
  }

  const relevantParticipantIds =
    participantType === INDIVIDUAL ? [participantId] : individualParticipantIds;

  const participantTeam = teamParticipantId
    ? teamParticipants.find(
        ({ participantId }) => participantId === teamParticipantId
      )
    : teamParticipants.find(({ individualParticipantIds }) =>
        overlap(relevantParticipantIds, individualParticipantIds)
      );

  if (!participantTeam) {
    return { error: TEAM_NOT_FOUND };
  }

  const teamAssignment = relevantAssignments.find(
    (assignment) => assignment.participantId === participantTeam?.participantId
  );
  const teamDrawPosition = teamAssignment?.drawPosition;
  const teamSide = tieMatchUp.sides.find(
    ({ drawPosition }) => drawPosition === teamDrawPosition
  );
  const sideNumber = teamSide?.sideNumber;

  const tieFormat =
    dualMatchUp.tieFormat || structure.tieFormat || drawDefinition.tieFormat;

  if (!tieFormat) return { error: MISSING_TIE_FORMAT };

  const collectionDefinition = tieFormat.collectionDefinitions?.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );

  if (!collectionDefinition) return { error: MISSING_COLLECTION_DEFINITION };

  if (!dualMatchUp.sides) {
    const extractSideDetail = ({
      displaySideNumber,
      drawPosition,
      sideNumber,
    }) => ({ drawPosition, sideNumber, displaySideNumber });

    dualMatchUp.sides = [
      { ...extractSideDetail(tieMatchUp.sides[0]), lineUp: [] },
      { ...extractSideDetail(tieMatchUp.sides[1]), lineUp: [] },
    ];
  }

  const dualMatchUpSide = dualMatchUp.sides.find(
    (side) => side.sideNumber === sideNumber
  );

  const tieMatchUpSide = tieMatchUp.sides.find(
    (side) => side.sideNumber === sideNumber
  );

  let deleteParticipantId;
  if (matchUpType === DOUBLES && participantType !== PAIR) {
    const result = addParticipantId2Pair({
      side: tieMatchUpSide,
    });
    if (result.error) return result;
    deleteParticipantId = result.deleteParticipantId;
  } else if (matchUpType === DOUBLES && participantType === PAIR) {
    const participantIds = participantToAssign.individualParticipantIds || [];
    // first filter out any collectionAssignment with equivalent collectionId/collectionPosition/participantId
    const { modifiedLineUp } = removeCollectionAssignments({
      collectionPosition,
      participantIds,
      dualMatchUpSide,
      collectionId,
    });

    for (const participantId of participantIds) {
      updateLineUp({
        collectionPosition,
        modifiedLineUp,
        participantId,
        collectionId,
      });
    }

    dualMatchUpSide.lineUp = modifiedLineUp;
    return { ...SUCCESS, modifiedLineUp };
  }

  // first filter out any collectionAssignment with equivalent collectionId/collectionPosition/participantId
  const { modifiedLineUp } = removeCollectionAssignments({
    participantIds: [participantId],
    collectionPosition,
    dualMatchUpSide,
    collectionId,
  });

  updateLineUp({
    collectionPosition,
    modifiedLineUp,
    participantId,
    collectionId,
  });

  dualMatchUpSide.lineUp = modifiedLineUp;

  if (deleteParticipantId) {
    const result = deleteParticipants({
      participantIds: [deleteParticipantId],
      teamDrawIds: [drawDefinition.drawId],
      tournamentRecord,
    });
    if (result.error) console.log('cleanup', { result });
  }
  return { ...SUCCESS, modifiedLineUp };

  function addParticipantId2Pair({ side }) {
    let deleteParticipantId;

    if (!side.participant) {
      const newPairParticipant = {
        participantType: PAIR,
        participantRole: COMPETITOR,
        individualParticipantIds: [participantId],
      };
      const result = addParticipant({
        participant: newPairParticipant,
        pairOverride: true,
        tournamentRecord,
      });
      if (result.error) return result;
    } else {
      const individualParticipantIds =
        side.participant.individualParticipantIds || [];

      const sideParticipantsCount =
        individualParticipantIds.filter(Boolean).length;

      if (sideParticipantsCount === 1) {
        const { participant } = getPairedParticipant({
          participantIds: individualParticipantIds,
          tournamentRecord,
        });

        individualParticipantIds.push(participantId);

        const { participant: existingParticipant } = getPairedParticipant({
          participantIds: individualParticipantIds,
          tournamentRecord,
        });

        if (!existingParticipant) {
          participant.individualParticipantIds = individualParticipantIds;
          const result = modifyParticipant({
            individualParticipantIds,
            pairOverride: true,
            tournamentRecord,
            participant,
          });
          if (result.error) return result;
        } else {
          // check if there is a pairParticipant that includes both individualParticipantIds
          // if there is, use that and delete the PAIR participant with only one [individualParticipantId]
          deleteParticipantId = participant.participantId;
        }
      } else {
        console.log('###');
      }
    }
    return { ...SUCCESS, deleteParticipantId };
  }
}

function updateLineUp({
  collectionPosition,
  modifiedLineUp,
  participantId,
  collectionId,
}) {
  const participantCompetitiorProfile = modifiedLineUp?.find(
    (teamCompetitor) => teamCompetitor?.participantId === participantId
  );

  const newAssignment = { collectionId, collectionPosition };
  if (participantCompetitiorProfile) {
    participantCompetitiorProfile.collectionAssignments.push(newAssignment);
  } else {
    const teamCompetitor = {
      collectionAssignments: [newAssignment],
      participantId,
    };
    modifiedLineUp.push(teamCompetitor);
  }
}

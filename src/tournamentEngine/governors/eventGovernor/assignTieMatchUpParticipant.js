import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { modifyMatchUpNotice } from '../../../drawEngine/notifications/drawNotifications';
import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { deleteParticipants } from '../participantGovernor/deleteParticipants';
import { modifyParticipant } from '../participantGovernor/modifyParticipant';
import { removeCollectionAssignments } from './removeCollectionAssignments';
import { addParticipant } from '../participantGovernor/addParticipants';
import { updateTeamLineUp } from './drawDefinitions/updateTeamLineUp';
import { getTeamLineUp } from './drawDefinitions/getTeamLineUp';
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
  const matchUpContext = getTieMatchUpContext(params);
  if (matchUpContext.error) return matchUpContext;

  let teamParticipantId = params.teamParticipantId;
  const { tournamentRecord, drawDefinition, participantId } = params;
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

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

  if (!teamParticipantId) teamParticipantId = participantTeam.participantId;
  if (!teamParticipantId) return { error: PARTICIPANT_NOT_FOUND };

  const teamAssignment = relevantAssignments?.find(
    (assignment) => assignment.participantId === participantTeam?.participantId
  );
  const teamDrawPosition = teamAssignment?.drawPosition;
  const teamSide = tieMatchUp.sides?.find(
    ({ drawPosition }) => drawPosition === teamDrawPosition
  );
  const sideNumber = teamSide?.sideNumber;

  if (!tieFormat) {
    return { error: MISSING_TIE_FORMAT };
  }

  const collectionDefinition = tieFormat.collectionDefinitions?.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );

  if (!collectionDefinition) return { error: MISSING_COLLECTION_DEFINITION };

  if (!dualMatchUp.sides?.length) {
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

  const lineUp =
    dualMatchUpSide?.lineUp ||
    getTeamLineUp({
      participantId: teamParticipantId,
      drawDefinition,
    })?.lineUp;

  const assignedParticipantIds = lineUp
    ?.filter((participantAssignment) =>
      participantAssignment.collectionAssignments?.find(
        (assignment) =>
          assignment.collectionId === collectionId &&
          assignment.collectionPosition === collectionPosition
      )
    )
    ?.map((assignment) => assignment?.participantId);

  const participantIds =
    assignedParticipantIds?.length > 1
      ? assignedParticipantIds
      : participantType === PAIR
      ? participantToAssign.individualParticipantIds
      : [participantId];

  // first filter out any collectionAssignment with equivalent collectionId/collectionPosition/participantId
  const modifiedLineUp = removeCollectionAssignments({
    participantIds,
    collectionPosition,
    teamParticipantId,
    dualMatchUpSide,
    drawDefinition,
    collectionId,
  })?.modifiedLineUp;

  let deleteParticipantId;

  if (matchUpType === DOUBLES) {
    if (participantType !== PAIR) {
      let result = updateLineUp({
        collectionPosition,
        teamParticipantId,
        drawDefinition,
        modifiedLineUp,
        participantId,
        collectionId,
        tieFormat,
      });
      if (result?.error) return result;

      result = addParticipantId2Pair({
        side: tieMatchUpSide,
      });
      if (result.error) return result;
      deleteParticipantId = result.deleteParticipantId;

      dualMatchUpSide.lineUp = modifiedLineUp;
      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        matchUp: dualMatchUp,
        drawDefinition,
      });
    } else if (participantType === PAIR) {
      for (const participantId of participantIds) {
        updateLineUp({
          collectionPosition,
          teamParticipantId,
          drawDefinition,
          modifiedLineUp,
          participantId,
          collectionId,
          tieFormat,
        });
      }
    }
  } else {
    const result = updateLineUp({
      collectionPosition,
      teamParticipantId,
      drawDefinition,
      modifiedLineUp,
      participantId,
      collectionId,
      tieFormat,
    });
    if (result?.error) return result;
  }

  dualMatchUpSide.lineUp = modifiedLineUp;
  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    matchUp: dualMatchUp,
    drawDefinition,
  });

  if (deleteParticipantId) {
    const { error } = deleteParticipants({
      participantIds: [deleteParticipantId],
      tournamentRecord,
    });
    if (error) console.log('cleanup');
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
      }
    }

    return { ...SUCCESS, deleteParticipantId };
  }
}

function updateLineUp({
  collectionPosition,
  teamParticipantId,
  drawDefinition,
  modifiedLineUp,
  participantId,
  collectionId,
  tieFormat,
}) {
  const templateTeamLineUp = getTeamLineUp({
    participantId: teamParticipantId,
    drawDefinition,
  })?.lineUp;

  const participantCompetitiorProfile = (
    modifiedLineUp || templateTeamLineUp
  )?.find((teamCompetitor) => teamCompetitor?.participantId === participantId);

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

  return updateTeamLineUp({
    participantId: teamParticipantId,
    lineUp: modifiedLineUp,
    drawDefinition,
    tieFormat,
  });
}

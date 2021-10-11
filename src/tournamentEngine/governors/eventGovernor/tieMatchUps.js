import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { scoreHasValue } from '../../../drawEngine/governors/matchUpGovernor/scoreHasValue';
import { getMatchUpsMap } from '../../../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { deleteParticipants } from '../participantGovernor/deleteParticipants';
import { modifyParticipant } from '../participantGovernor/modifyParticipant';
import { getParticipantIds } from '../../../global/functions/extractors';
import { addParticipant } from '../participantGovernor/addParticipants';
import { overlap } from '../../../utilities';

import { INDIVIDUAL, PAIR, TEAM } from '../../../constants/participantTypes';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  EXISTING_OUTCOME,
  INVALID_MATCHUP,
  INVALID_PARTICIPANT_TYPE,
  INVALID_VALUES,
  MATCHUP_NOT_FOUND,
  MISSING_COLLECTION_DEFINITION,
  MISSING_DRAW_ID,
  MISSING_SIDE_NUMBER,
  MISSING_TIE_FORMAT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

// removal of sideMember is currently done by assigning { participantId: undefined, sideNumber, sideMember }
// TODO: implement removeTieMatchUpParticipantId where participantId is defined
// inContext participants report not picking up pairParticipants in tie/dual matchUps
// inContext PAIR participants do not have draws/event reporting, for the same reason?
export function assignTieMatchUpParticipantId(params) {
  const { tournamentRecord, drawDefinition, event } = params;
  const { participantId, tieMatchUpId } = params;
  let { sideMember } = params;

  // sideNumber can be checked against the participantId, which can be resolved based on the participantId team membership
  // if sideNumber is not provided and there is a participantId then sideNumber can be resolved
  // checks should ensure no attempts are made to add participant to incorrect side
  // 1. get drawPositions for tieMatchUp
  // 2. get team participants for each side
  // 3. discover which team particiapntId belongs to and side for team participant

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!event) return { error: EVENT_NOT_FOUND };
  if (sideMember && ![1, 2].includes(sideMember))
    return { error: INVALID_VALUES };

  const matchUpsMap = getMatchUpsMap({ drawDefinition });

  // tieMatchUp is matchUpType: SINGLES or DOUBLES
  const { matchUp: tieMatchUp, structure } = findMatchUp({
    tournamentParticipants: tournamentRecord.participants,
    matchUpId: tieMatchUpId,
    inContext: true,
    drawDefinition,
    matchUpsMap,
  });
  if (!tieMatchUp) return { error: MATCHUP_NOT_FOUND };

  const {
    collectionId,
    collectionPosition,
    drawPositions,
    matchUpTieId,
    matchUpType,
  } = tieMatchUp;

  if (![SINGLES, DOUBLES].includes(matchUpType))
    return { error: INVALID_MATCHUP };

  const { positionAssignments } = getPositionAssignments({ structure });
  const relevantAssignments = positionAssignments?.filter((assignment) =>
    drawPositions.includes(assignment.drawPosition)
  );

  const { tournamentParticipants: teamParticipants } =
    getTournamentParticipants({
      tournamentRecord,
      participantFilters: {
        participantTypes: [TEAM],
        participantIds: getParticipantIds(relevantAssignments),
      },
    });

  const {
    tournamentParticipants: [participantToAssign],
  } = getTournamentParticipants({
    tournamentRecord,
    participantFilters: {
      participantIds: [participantId],
    },
  });

  const { matchUp: dualMatchUp } = findMatchUp({
    matchUpId: matchUpTieId,
    drawDefinition,
    matchUpsMap,
  });

  if (!participantToAssign) {
    if (![1, 2].includes(params.sideNumber))
      return { error: MISSING_SIDE_NUMBER };

    if (scoreHasValue({ score: tieMatchUp.score }) || tieMatchUp.winningSide)
      return { error: EXISTING_OUTCOME };

    const dualMatchUpSide = dualMatchUp.sides.find(
      (side) => side.sideNumber === params.sideNumber
    );
    const { modifiedLineUp, removedParticipantId } = removeCollectionAssignment(
      {
        collectionPosition,
        dualMatchUpSide,
        collectionId,
        sideMember,
      }
    );
    dualMatchUpSide.lineUp = modifiedLineUp;

    if (matchUpType === DOUBLES) {
      const tieMatchUpSide = tieMatchUp.sides.find(
        (side) => side.sideNumber === params.sideNumber
      );

      const { participantId: pairParticipantId } = tieMatchUpSide;
      const {
        tournamentParticipants: [pairParticipant],
      } = getTournamentParticipants({
        tournamentRecord,
        participantFilters: {
          participantIds: [pairParticipantId],
        },
        withMatchUps: true,
        inContext: true,
      });

      if (pairParticipant) {
        const individualParticipantIds =
          pairParticipant?.individualParticipantIds.filter(
            (participantId) => participantId !== removedParticipantId
          );
        pairParticipant.individualParticipantIds = individualParticipantIds;
        const result = modifyParticipant({
          participant: pairParticipant,
          pairOverride: true,
          tournamentRecord,
        });
        if (result.error) return result;
      } else {
        console.log('pair participant not found');
      }
    }

    return { ...SUCCESS, modifiedLineUp };
  }

  const { individualParticipantIds, participantType } = participantToAssign;

  // check that the participantToAssign is the correct participantType for tieMatchUp.matchUpType
  if (matchUpType === SINGLES && participantType !== INDIVIDUAL) {
    return { error: INVALID_PARTICIPANT_TYPE };
  }

  const relevantParticipantIds =
    participantType === INDIVIDUAL ? [participantId] : individualParticipantIds;

  const participantTeam = teamParticipants.find(
    ({ individualParticipantIds }) =>
      overlap(relevantParticipantIds, individualParticipantIds)
  );

  const teamAssignment = relevantAssignments.find(
    (assignment) => assignment.participantId === participantTeam.participantId
  );
  const teamDrawPosition = teamAssignment.drawPosition;
  const teamSide = tieMatchUp.sides.find(
    ({ drawPosition }) => drawPosition === teamDrawPosition
  );
  const sideNumber = teamSide.sideNumber;

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
      sideMember,
    });
    if (result.error) return result;
    sideMember = sideMember || result.sideMember;
    deleteParticipantId = result.deleteParticipantId;
  } else if (matchUpType === DOUBLES && participantType === PAIR) {
    console.log({ participantToAssign });
    // TODO: each individual needs to be check to see that they are part of the team
    // each individual needs to have their collectionAssignments updated independently
    return { error: 'Not implemented' };
  }

  // first filter out any collectionAssignment with equivalent collectionId/collectionPosition/sideMembers
  const { modifiedLineUp } = removeCollectionAssignment({
    collectionPosition,
    dualMatchUpSide,
    collectionId,
    sideMember,
  });

  const participantCompetitiorProfile = modifiedLineUp.find(
    (teamCompetitor) => teamCompetitor.participantId === participantId
  );

  const newAssignment = { collectionId, collectionPosition, sideMember };
  if (participantCompetitiorProfile) {
    participantCompetitiorProfile.collectionAssignments.push(newAssignment);
  } else {
    const teamCompetitor = {
      collectionAssignments: [newAssignment],
      participantId,
      sideMember,
    };
    modifiedLineUp.push(teamCompetitor);
    const missingSideMember = modifiedLineUp.find((competitor) =>
      competitor.collectionAssignments.find(
        (assignment) =>
          assignment.collectionPosition === collectionPosition &&
          assignment.collectionId === collectionId
      )
    );
    if (missingSideMember) missingSideMember.sideMember = 1;
  }
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

  function addParticipantId2Pair({ side, sideMember }) {
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
      sideMember = 1;
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
        sideMember = 2;
      }
    }
    return { ...SUCCESS, sideMember, deleteParticipantId };
  }
}

function removeCollectionAssignment({
  collectionPosition,
  dualMatchUpSide,
  collectionId,
  sideMember,
}) {
  let removedParticipantId;
  const modifiedLineUp = dualMatchUpSide.lineUp.map((teamCompetitor) => {
    const collectionAssignments = teamCompetitor.collectionAssignments?.filter(
      (assignment) => {
        const target =
          assignment.collectionId === collectionId &&
          assignment.collectionPosition === collectionPosition &&
          (!sideMember || sideMember === assignment.sideMember);
        if (target) removedParticipantId = teamCompetitor.participantId;
        return !target;
      }
    );
    return {
      participantId: teamCompetitor.participantId,
      collectionAssignments,
    };
  });
  return { modifiedLineUp, removedParticipantId };
}

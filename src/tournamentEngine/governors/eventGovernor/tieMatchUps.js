import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { scoreHasValue } from '../../../drawEngine/governors/matchUpGovernor/scoreHasValue';
import { getMatchUpsMap } from '../../../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { overlap } from '../../../utilities';
import { UUID } from '../../../utilities/UUID';

import { INDIVIDUAL, PAIR, TEAM } from '../../../constants/participantTypes';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { COMPETITOR } from '../../../constants/participantRoles';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  EXISTING_OUTCOME,
  INVALID_MATCHUP,
  INVALID_PARTICIPANT_TYPE,
  MATCHUP_NOT_FOUND,
  MISSING_COLLECTION_DEFINITION,
  MISSING_DRAW_ID,
  MISSING_SIDE_NUMBER,
  MISSING_TIE_FORMAT,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function assignTieMatchUpParticipantId(params) {
  const { tournamentRecord, drawDefinition, event } = params;
  const { participantId, sideMember, tieMatchUpId } = params;

  // sideNumber can be checked against the participantId, which can be resolved based on the participantId team membership
  // if sideNumber is not provided and there is a participantId then sideNumber can be resolved
  // checks should ensure no attempts are made to add participant to incorrect side
  // 1. get drawPositions for tieMatchUp
  // 2. get team participants for each side
  // 3. discover which team particiapntId belongs to and side for team participant

  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: EVENT_NOT_FOUND };

  const matchUpsMap = getMatchUpsMap({ drawDefinition });

  // tieMatchUp is matchUpType: SINGLES or DOUBLES
  const { matchUp: tieMatchUp, structure } = findMatchUp({
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
  const teamParticipantIds = relevantAssignments.map(
    ({ participantId }) => participantId
  );

  const { tournamentParticipants: teamParticipants } =
    getTournamentParticipants({
      tournamentRecord,
      participantFilters: {
        participantTypes: [TEAM],
        participantIds: teamParticipantIds,
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
    if (matchUpType === SINGLES) {
      if (![1, 2].includes(params.sideNumber))
        return { error: MISSING_SIDE_NUMBER };

      if (scoreHasValue({ score: tieMatchUp.score }) || tieMatchUp.winningSide)
        return { error: EXISTING_OUTCOME };

      const dualMatchUpSide = dualMatchUp.sides.find(
        (side) => side.sideNumber === params.sideNumber
      );
      const modifiedLineUp = removeCollectionAssignment({
        collectionPosition,
        dualMatchUpSide,
        collectionId,
      });
      dualMatchUpSide.lineUp = modifiedLineUp;

      return { ...SUCCESS, modifiedLineUp };
    }
    return { error: PARTICIPANT_NOT_FOUND };
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
  // console.log({ tieFormat, collectionDefinition });

  if (!dualMatchUp.sides) {
    const extractSideDetail = ({
      drawPosition,
      sideNumber,
      displaySideNumber,
    }) => ({ drawPosition, sideNumber, displaySideNumber });

    dualMatchUp.sides = [
      { ...extractSideDetail(tieMatchUp.sides[0]), lineUp: [] },
      { ...extractSideDetail(tieMatchUp.sides[1]), lineUp: [] },
    ];
  }

  const dualMatchUpSide = dualMatchUp.sides.find(
    (side) => side.sideNumber === sideNumber
  );

  if (matchUpType === DOUBLES && participantType !== PAIR) {
    const details = {
      dualMatchUp,
      dualMatchUpSide,
      teamParticipants,
      participantTeam,
      collectionDefinition,
    };
    console.log('ADDING INDIVIDUAL INTO PAIR MATCHUP', details);
    // is there a lineUp for this side that includes collectionId/collectionPosition?
    // if not, need to create a pair participant that includes current individualParticipantId

    const result = addParticipantIdToPair({
      side: dualMatchUpSide,
      dualMatchUp,
      sideMember,
    });
    if (result.error) return result;
  }

  // first filter out any collectionAssignment with equivalent collectionId/collectionPosition/sideMembers
  const modifiedLineUp = removeCollectionAssignment({
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
    };
    modifiedLineUp.push(teamCompetitor);
  }
  dualMatchUpSide.lineUp = modifiedLineUp;

  return { ...SUCCESS, modifiedLineUp };

  function addParticipantIdToPair({ side, sideMember }) {
    if (!side.participant)
      side.participant = {
        // individualParticipants: [], // TODO: remove expanded participants
        individualParticipantIds: [],
      };

    const individualParticipantIds = side.participant.individualParticipantIds;
    const { tournamentParticipants: individualParticipants } =
      getTournamentParticipants({
        tournamentRecord,
        participantFilters: {
          participantIds: [individualParticipantIds],
        },
      });

    individualParticipantIds[sideMember - 1] = participantId;

    const sideParticipantsCount =
      individualParticipantIds.filter(Boolean).length;

    if (sideParticipantsCount === 2) {
      const { participant } = getPairedParticipant({
        tournamentRecord,
        participantIds: individualParticipantIds,
      });
      const sideParticipantId = participant?.participantId;

      if (sideParticipantId) {
        side.participantId = sideParticipantId;
      } else {
        side.participantId = UUID();
        const newPairParticipant = {
          participantId: side.participantId,
          participantType: PAIR,
          participantRole: COMPETITOR,
          participantName: individualParticipants
            .map(personFamilyName)
            .join('/'),
          individualParticipantIds,
        };
        tournamentRecord.participants.push(newPairParticipant);
      }
      // delete side.participant;
      /*
    } else {
      side.participant.individualParticipants[sideMember - 1] = {
        participantId,
      };
      */
    }

    return SUCCESS;
  }

  function personFamilyName(participant) {
    const { participantId } = participant;
    const participantData = tournamentRecord.participants.reduce(
      (data, candidate) => {
        return candidate.participantId === participantId ? candidate : data;
      },
      undefined
    );
    const person = participantData && participantData.person;
    return person && person.standardFamilyName;
  }

  /*
  function removeParticipantIdFromPair({ side, sideMember }) {
    side.participantId = undefined;
    if (!side.participant) side.participant = { individualParticipants: [] };
    side.participant.individualParticipants = individualParticipants.map(
      (participant, index) => {
        return index + 1 === sideMember ? undefined : participant;
      }
    );

    return SUCCESS;
  }
  */
}

function removeCollectionAssignment({
  dualMatchUpSide,
  collectionId,
  collectionPosition,
  sideMember,
}) {
  return dualMatchUpSide.lineUp.map((teamCompetitor) => {
    const collectionAssignments = teamCompetitor.collectionAssignments?.filter(
      (assignment) =>
        !(
          assignment.collectionId === collectionId &&
          assignment.collectionPosition === collectionPosition &&
          (!sideMember || sideMember === sideMember)
        )
    );
    return {
      participantId: teamCompetitor.participantId,
      collectionAssignments,
    };
  });
}

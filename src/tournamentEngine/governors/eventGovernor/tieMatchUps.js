import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { getMatchUpsMap } from '../../../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../../drawEngine/getters/positionsGetter';
// import { getPairedParticipant } from '../participantGovernor/getPairedParticipant';
import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { intersection } from '../../../utilities';
// import { UUID } from '../../../utilities/UUID';

import { INDIVIDUAL, PAIR, TEAM } from '../../../constants/participantTypes';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  INVALID_PARTICIPANT_TYPE,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function assignTieMatchUpParticipantId(props) {
  // let { individualParticipants } = props; // clarify use
  const { tournamentRecord, drawDefinition, event } = props;
  const { participantId, sideMember, tieMatchUpId } = props;

  // TODO: sideNumber should not be required; should be resolved based on the participantId team membership
  // will additionally insure no attempts are made to add participant to incorrect side
  // 1. get drawPositions for tieMatchUp
  // 2. get team participants for each side
  // 3. discover which team particiapntId belongs to and side for team participant

  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: EVENT_NOT_FOUND };

  const matchUpsMap = getMatchUpsMap({ drawDefinition });
  const { matchUp, structure } = findMatchUp({
    matchUpId: tieMatchUpId,
    inContext: true,
    drawDefinition,
    matchUpsMap,
  });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const {
    collectionId,
    collectionPosition,
    drawPositions,
    matchUpTieId,
    matchUpType,
  } = matchUp;

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

  if (!participantToAssign) return { error: PARTICIPANT_NOT_FOUND };
  const { individualParticipantIds, participantType } = participantToAssign;

  if (
    (matchUpType === SINGLES && participantType !== INDIVIDUAL) ||
    (matchUpType === DOUBLES && participantType !== PAIR)
  ) {
    return { error: INVALID_PARTICIPANT_TYPE };
  }
  // check that the participantToAssign is the correct participantType for matchUp.matchUpType

  const relevantParticipantIds =
    participantType === INDIVIDUAL ? [participantId] : individualParticipantIds;

  const participantTeam = teamParticipants.find(
    ({ individualParticipantIds }) => {
      return intersection(relevantParticipantIds, individualParticipantIds)
        .length;
    }
  );

  const teamAssignment = relevantAssignments.find(
    (assignment) => assignment.participantId === participantTeam.participantId
  );
  const teamDrawPosition = teamAssignment.drawPosition;
  const teamSide = matchUp.sides.find(
    ({ drawPosition }) => drawPosition === teamDrawPosition
  );
  const sideNumber = teamSide.sideNumber;

  const { matchUp: dualMatchUp } = findMatchUp({
    matchUpId: matchUpTieId,
    drawDefinition,
    matchUpsMap,
  });

  if (!dualMatchUp.sides) {
    dualMatchUp.sides = [
      { ...matchUp.sides[0], lineUp: [] },
      { ...matchUp.sides[1], lineUp: [] },
    ];
  }

  const dualMatchUpSide = dualMatchUp.sides.find(
    (side) => side.sideNumber === sideNumber
  );
  const participantCompetitiorProfile = dualMatchUpSide.lineUp.find(
    (teamCompetitor) => teamCompetitor.participantId === participantId
  );

  if (participantCompetitiorProfile) {
    //
  } else {
    const teamCompetitor = {
      collectionAssignments: [{ collectionId, collectionPosition, sideMember }],
      participantId,
    };
    dualMatchUpSide.lineUp.push(teamCompetitor);
  }

  /*
  const tieFormat =
    dualMatchUp.tieFormat || structure.tieFormat || drawDefinition.tieFormat;

  if (!tieFormat) return { error: 'Missing TIE_FORMAT' };

  const collection = tieFormat.collectionDefinitions?.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  */

  /*

  const side = tieMatchUp.sides[sideNumber - 1];
  if (tieMatchUp.matchUpType === DOUBLES) {
    if (participantId) {
      const result = addParticipantIdToPair({ side, sideMember });
      if (result.error) return result;
    } else {
      const result = removeParticipantIdFromPair({ side, sideMember });
      if (result.error) return result;
    }
  } else {
    // assign participantId to collectionPosition
  }
  */

  return SUCCESS;

  /*
  function addParticipantIdToPair({ side, sideMember }) {
    if (!side.participant)
      side.participant = {
        individualParticipants: [], // TODO: remove expanded participants
        individualParticipantIds: [],
      };
    individualParticipants =
      individualParticipants || side.participant.individualParticipants;
    individualParticipants[sideMember - 1] = { participantId };

    const sideParticipantsCount = individualParticipants.filter(
      (p) => p && p.participantId
    ).length;

    if (sideParticipantsCount === 2) {
      const participantIds = individualParticipants.map(
        ({ participantId }) => participantId
      );
      const { participant } = getPairedParticipant({
        tournamentRecord,
        participantIds,
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
          participantName: side.participant.individualParticipants
            .map(personFamilyName)
            .join('/'),
          individualParticipants,
        };
        tournamentRecord.participants.push(newPairParticipant);
      }
      delete side.participant;
    } else {
      side.participant.individualParticipants[sideMember - 1] = {
        participantId,
      };
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

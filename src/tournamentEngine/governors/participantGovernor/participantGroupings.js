import { COMPETITOR } from '../../../constants/participantRoles';
import { SUCCESS } from '../../../constants/resultConstants';
import { INDIVIDUAL, TEAM } from '../../../constants/participantTypes';
import {
  INVALID_PARTICIPANT_TYPE,
  NO_PARTICIPANT_REMOVED,
  TEAM_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function addParticipantsToGrouping(props) {
  const { tournamentRecord } = props;
  const {
    groupingType = TEAM,
    groupingParticipantId,
    participantIds,
    removeFromOtherTeams,
  } = props;

  const tournamentParticipants = tournamentRecord.participants || [];
  const groupingParticipant = tournamentParticipants.find(
    (participant) => participant.participantId === groupingParticipantId
  );

  if (groupingParticipant.participantType !== groupingType) {
    return {
      error: INVALID_PARTICIPANT_TYPE,
      participantType: groupingParticipant.participantType,
    };
  }

  let added = false;
  if (groupingParticipant) {
    const individualParticipants =
      groupingParticipant.individualParticipants || [];
    const individualParticipantIds =
      groupingParticipant.individualParticipantIds;
    const participantIdsToAdd = participantIds.filter((participantId) => {
      const participantIsMember = individualParticipantIds.includes(
        participantId
      );
      return !participantIsMember;
    });

    // integrity chck to insure only individuals can be added to groupings
    const invalidParticipantIds = participantIdsToAdd.filter(
      (participantId) => {
        const participant = tournamentParticipants.find(
          (tournamentParticipant) =>
            tournamentParticipant.participantId === participantId
        );
        return participant.participantType !== INDIVIDUAL;
      }
    );
    if (invalidParticipantIds.length)
      return { error: INVALID_PARTICIPANT_TYPE, invalidParticipantIds };

    if (!participantIdsToAdd.length) {
      return SUCCESS; // participants already team members
    } else {
      if (removeFromOtherTeams) {
        removeParticipantsFromAllTeams({
          tournamentRecord,
          participantIds: participantIdsToAdd,
        });
      }
      groupingParticipant.individualParticipants = individualParticipants.concat(
        ...participantIdsToAdd
      );
      added = true;
    }
  }

  return added ? SUCCESS : { error: TEAM_NOT_FOUND };
}

export function removeParticipantsFromGroup({
  tournamentRecord,
  groupingParticipantId,
  participantIds,
}) {
  const tournamentParticipants = tournamentRecord.participants || [];

  const groupingParticipant = tournamentParticipants.find((participant) => {
    return participant.participantId === groupingParticipantId;
  });

  const { removed } = removeParticipantIdsFromGrouping({
    groupingParticipant,
    participantIds,
  });

  return removed ? SUCCESS : { error: NO_PARTICIPANT_REMOVED };
}

function removeParticipantIdsFromGrouping({
  groupingParticipant,
  participantIds,
}) {
  let removed = 0;
  if (!groupingParticipant) return { removed };
  const individualParticipants =
    groupingParticipant.individualParticipants || [];
  groupingParticipant.individualParticipants = individualParticipants.filter(
    (value) => {
      const participantId =
        typeof value === 'object' ? value.participantId : value;
      const removeParticipant = participantIds.includes(participantId);
      if (removeParticipant) removed++;
      return !removeParticipant;
    }
  );
  return { groupingParticipant, removed };
}

export function removeParticipantsFromAllTeams({
  groupingType = TEAM,
  tournamentRecord,
  participantIds,
}) {
  const tournamentParticipants = tournamentRecord.participants || [];

  let modifications = 0;
  tournamentParticipants
    .filter((participant) => {
      return (
        (participant.participantRole === COMPETITOR ||
          !participant.participantRole) &&
        participant.participantType === groupingType
      );
    })
    .forEach((team) => {
      const { groupingParticipant, removed } = removeParticipantIdsFromGrouping(
        {
          groupingParticipant: team,
          participantIds,
        }
      );
      if (removed) {
        team = groupingParticipant;
        modifications++;
      }
    });

  return modifications ? SUCCESS : { error: NO_PARTICIPANT_REMOVED };
}

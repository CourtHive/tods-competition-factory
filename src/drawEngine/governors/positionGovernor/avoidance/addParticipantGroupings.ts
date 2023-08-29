import { makeDeepCopy } from '../../../../utilities';

import {
  GROUP,
  INDIVIDUAL,
  PAIR,
  TEAM,
} from '../../../../constants/participantConstants';
import { Participant } from '../../../../types/tournamentFromSchema';

type AddParticipantGroupingsArgs = {
  participants?: Participant[];
  participantsProfile?: any;
};

export function addParticipantGroupings({
  participantsProfile,
  participants = [],
}: AddParticipantGroupingsArgs) {
  const participantsWithGroupings = makeDeepCopy(
    participants,
    participantsProfile?.convertExtensions,
    true
  );
  const teamParticipants = participantsWithGroupings.filter(
    (participant) => participant.participantType === TEAM
  );
  const groupParticipants = participantsWithGroupings.filter(
    (participant) => participant.participantType === GROUP
  );

  // should pairParticipants only consider those that are in the same event as current draw?
  // TODO: this requires access to the parent event which is not currently in scope
  const pairParticipants = participantsWithGroupings.filter(
    (participant) => participant.participantType === PAIR
  );

  participantsWithGroupings.forEach((participant) => {
    if (participant.participantType === INDIVIDUAL) {
      const { participantId } = participant;
      participant.groupParticipantIds = [];
      participant.teamParticipantIds = [];
      participant.pairParticipantIds = [];
      participant.groups = [];
      participant.teams = [];

      teamParticipants.forEach((team) => {
        (team?.individualParticipantIds || []).forEach(
          (individualParticipantId) => {
            if (
              individualParticipantId === participantId &&
              !participant.teamParticipantIds?.includes(team.participantId)
            ) {
              participant.teamParticipantIds.push(team.participantId);
              participant.teams.push({
                participantRoleResponsibilities:
                  team.participantRoleResponsibilities,
                participantOtherName: team.participantOtherName,
                participantName: team.participantName,
                participantId: team.participantId,
                teamId: team.teamId,
              });
            }
          }
        );
      });
      pairParticipants.forEach((pair) => {
        (pair?.individualParticipantIds || []).forEach(
          (individualParticipantId) => {
            if (
              individualParticipantId === participantId &&
              !participant.pairParticipantIds.includes(pair.participantId)
            ) {
              participant.pairParticipantIds.push(pair.participantId);
            }
          }
        );
      });
      groupParticipants.forEach((group) => {
        (group?.individualParticipantIds || []).forEach(
          (individualParticipantId) => {
            if (
              individualParticipantId === participantId &&
              !participant.groupParticipantIds.includes(group.participantId)
            ) {
              participant.groupParticipantIds.push(group.participantId);
              participant.groups.push({
                participantRoleResponsibilities:
                  group.participantRoleResponsibilities,
                participantOtherName: group.participantOtherName,
                participantName: group.participantName,
                participantId: group.participantId,
              });
            }
          }
        );
      });
    }
  });

  return participantsWithGroupings;
}

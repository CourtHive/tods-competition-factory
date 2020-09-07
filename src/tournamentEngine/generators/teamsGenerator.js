import { UUID } from "competitionFactory/utilities";
import { SUCCESS } from "competitionFactory/constants/resultConstants";
import { COMPETITOR } from 'competitionFactory/constants/participantRoles';
import { TEAM } from "competitionFactory/constants/participantTypes";

export function generateTeamsFromParticipantAttribute(props) {
  const {
    tournamentRecord,
    personAttribute,
    participantAttribute,
  } = props;

  const teams = {};
  const participants = tournamentRecord.participants || [];

  participants.forEach(participant => {
    if (!participant.person) return;
    if (participant.participantRole !== COMPETITOR) return;

    const attributeValue = personAttribute ?
      participant.person[personAttribute] :
      participant[participantAttribute];

    if (attributeValue) {
      if (!Object.keys(teams).includes(attributeValue)) {
        teams[attributeValue] = {
          name: attributeValue,
          participantId: UUID(),
          participantType: TEAM,
          participantRole: COMPETITOR,
          individualParticipants: [],
          participantProfile: {
            groupingAttribute:  personAttribute || participantAttribute
          }
        };
      }
      
      teams[attributeValue].individualParticipants.push(participant.participantId);
    }
  });

  const groupingAttributes = Object.keys(teams);

  const overlappingTeamParticipantids = participants.map(participant => {
    if (participant.participantType !== 'TEAM') return undefined;
    if (participant.participantRole !== 'COMPETITOR') return undefined;
    const { participantProfile } = participant;
    const { groupingAttribute } = participantProfile || {};

    if (groupingAttributes.includes(groupingAttribute)) {
      return participant.participantId;
    }
    return undefined;
  }).filter(f=>f);

  let participantsAdded = 0;
  Object.keys(teams).forEach(attributeValue => {
    const participant = teams[attributeValue];
    const { participantId } = participant;
    if (!overlappingTeamParticipantids.includes(participantId)) {
      tournamentRecord.participants.push(participant);
      participantsAdded++;
    }
  });

  console.log({participantsAdded});

  if (participantsAdded) return SUCCESS;
}
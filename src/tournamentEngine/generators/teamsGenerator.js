import { UUID } from '../../utilities';
import { SUCCESS } from '../../constants/resultConstants';
import { COMPETITOR } from '../../constants/participantRoles';
import { TEAM } from '../../constants/participantTypes';
import { addExtension } from '../governors/tournamentGovernor/addRemoveExtensions';
import { findExtension } from '../governors/queryGovernor/extensionQueries';

export function generateTeamsFromParticipantAttribute(props) {
  const {
    tournamentRecord,
    participantAttribute,
    personAttribute,
    uuids,
  } = props;

  const teams = {};
  const participants = tournamentRecord.participants || [];

  participants.forEach((participant) => {
    if (!participant.person) return;
    if (participant.participantRole !== COMPETITOR) return;

    const attributeValue = personAttribute
      ? participant.person[personAttribute]
      : participant[participantAttribute];

    if (attributeValue) {
      if (!Object.keys(teams).includes(attributeValue)) {
        teams[attributeValue] = {
          participantName: attributeValue,
          participantId: uuids?.pop() || UUID(),
          participantType: TEAM,
          participantRole: COMPETITOR,
          individualParticipantIds: [],
        };

        const extension = {
          name: 'groupingAttribute',
          value: personAttribute || participantAttribute,
        };
        addExtension({ element: teams[attributeValue], extension });
      }

      teams[attributeValue].individualParticipantIds.push(
        participant.participantId
      );
    }
  });

  const groupingAttributes = Object.keys(teams);

  const overlappingTeamParticipantids = participants
    .map((participant) => {
      if (participant.participantType !== 'TEAM') return undefined;
      if (participant.participantRole !== 'COMPETITOR') return undefined;

      const { extension } = findExtension({
        element: participant,
        name: 'groupingAttribute',
      });
      const groupingAttribute = extension?.value;

      if (groupingAttributes.includes(groupingAttribute)) {
        return participant.participantId;
      }
      return undefined;
    })
    .filter((f) => f);

  let participantsAdded = 0;
  Object.keys(teams).forEach((attributeValue) => {
    const participant = teams[attributeValue];
    const { participantId } = participant;
    if (!overlappingTeamParticipantids.includes(participantId)) {
      tournamentRecord.participants.push(participant);
      participantsAdded++;
    }
  });

  console.log({ participantsAdded });

  if (participantsAdded) {
    return Object.assign({}, SUCCESS, { participantsAdded });
  } else {
    return { error: 'No matching participants found' };
  }
}

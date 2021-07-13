import { addExtension } from '../governors/tournamentGovernor/addRemoveExtensions';
import { findExtension } from '../governors/queryGovernor/extensionQueries';
import { addNotice } from '../../global/globalState';
import { UUID } from '../../utilities';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';
import { GROUPING_ATTRIBUTE } from '../../constants/extensionConstants';
import { ADD_PARTICIPANTS } from '../../constants/topicConstants';
import { COMPETITOR } from '../../constants/participantRoles';
import { SUCCESS } from '../../constants/resultConstants';
import { TEAM } from '../../constants/participantTypes';

export function generateTeamsFromParticipantAttribute(params) {
  if (!params?.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const { tournamentRecord, participantAttribute, personAttribute, uuids } =
    params;

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
          name: GROUPING_ATTRIBUTE,
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
      if (participant.participantType !== TEAM) return undefined;
      if (participant.participantRole !== COMPETITOR) return undefined;

      const { extension } = findExtension({
        element: participant,
        name: GROUPING_ATTRIBUTE,
      });
      const groupingAttribute = extension?.value;

      if (groupingAttributes.includes(groupingAttribute)) {
        return participant.participantId;
      }
      return undefined;
    })
    .filter(Boolean);

  const newParticipants = [];
  let participantsAdded = 0;
  Object.keys(teams).forEach((attributeValue) => {
    const participant = teams[attributeValue];
    const { participantId } = participant;
    if (!overlappingTeamParticipantids.includes(participantId)) {
      tournamentRecord.participants.push(participant);
      newParticipants.push(participant);
      participantsAdded++;
    }
  });

  if (participantsAdded) {
    addNotice({
      topic: ADD_PARTICIPANTS,
      payload: { participants: newParticipants },
    });
  }

  if (participantsAdded) {
    return { ...SUCCESS, participantsAdded };
  } else {
    return { error: 'No matching participants found' };
  }
}

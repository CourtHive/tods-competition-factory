import { addExtension } from '../governors/tournamentGovernor/addRemoveExtensions';
import { findExtension } from '../governors/queryGovernor/extensionQueries';
import { getAccessorValue } from '../../utilities/getAccessorValue';
import { addNotice } from '../../global/globalState';
import { UUID } from '../../utilities';

import { MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';
import { GROUPING_ATTRIBUTE } from '../../constants/extensionConstants';
import { ADD_PARTICIPANTS } from '../../constants/topicConstants';
import { COMPETITOR } from '../../constants/participantRoles';
import { SUCCESS } from '../../constants/resultConstants';
import { INDIVIDUAL, TEAM } from '../../constants/participantTypes';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} participantAttribute - optional - participant attribute to be used to group individual participants
 * @param {string} personAttribute - optional - person attribute to be used to group individual participants
 * @param {string} accessor - optional - dot delimited string targeting nested value
 * @param {string[]} uuids - optional - array of unique identifiers for genrated team participants
 * @returns { success: true } or { error }
 */
export function generateTeamsFromParticipantAttribute({
  tournamentRecord,
  participantAttribute,
  personAttribute,
  accessor,
  uuids,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const teams = {};
  const individualParticipants = (tournamentRecord.participants || []).filter(
    ({ participantType, participantRole }) =>
      participantType === INDIVIDUAL && participantRole === COMPETITOR
  );

  for (const individualParticipant of individualParticipants) {
    const { value: accessorValue } = getAccessorValue({
      element: individualParticipant,
      accessor,
    });
    const attributeValue =
      accessorValue ||
      (personAttribute
        ? individualParticipant.person[personAttribute]
        : individualParticipant[participantAttribute]);

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
        individualParticipant.participantId
      );
    }
  }

  const groupingAttributes = Object.keys(teams);

  const overlappingTeamParticipantIds = (tournamentRecord.participants || [])
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
    if (!overlappingTeamParticipantIds.includes(participantId)) {
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

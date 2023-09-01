import { findExtension } from '../../global/functions/deducers/findExtension';
import { addExtension } from '../../global/functions/producers/addExtension';
import { getAccessorValue } from '../../utilities/getAccessorValue';
import { addNotice } from '../../global/state/globalState';
import { UUID } from '../../utilities';

import { GROUPING_ATTRIBUTE } from '../../constants/extensionConstants';
import { INDIVIDUAL, TEAM } from '../../constants/participantConstants';
import { ADD_PARTICIPANTS } from '../../constants/topicConstants';
import { COMPETITOR } from '../../constants/participantRoles';
import { SUCCESS } from '../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  NO_PARTICIPANTS_GENERATED,
} from '../../constants/errorConditionConstants';
import { Tournament } from '../../types/tournamentFromSchema';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} participantAttribute - optional - participant attribute to be used to group individual participants
 * @param {string} personAttribute - optional - person attribute to be used to group individual participants
 * @param {string} accessor - optional - dot delimited string targeting nested value
 * @param {string[]} uuids - optional - array of unique identifiers for genrated team participants
 * @returns { success: true } or { error }
 */

type GenerateTeamsArgs = {
  participantAttribute?: string;
  tournamentRecord: Tournament;
  addParticipants?: boolean;
  personAttribute?: string;
  teamNames?: string[];
  accessor?: string;
  uuids?: string[];
};
export function generateTeamsFromParticipantAttribute({
  addParticipants = true, // optional boolean to disable add
  participantAttribute,
  tournamentRecord,
  personAttribute,
  teamNames,
  accessor,
  uuids,
}: GenerateTeamsArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const teams = {};
  const individualParticipants = (tournamentRecord.participants || []).filter(
    ({ participantType, participantRole }) =>
      participantType === INDIVIDUAL && participantRole === COMPETITOR
  );

  let teamIndex = 0;

  for (const individualParticipant of individualParticipants) {
    const accessorValue =
      accessor &&
      getAccessorValue({
        element: individualParticipant,
        accessor,
      })?.value;

    const attributeValue =
      accessorValue ||
      (personAttribute && individualParticipant.person?.[personAttribute]) ||
      (participantAttribute && individualParticipant[participantAttribute]);

    if (attributeValue) {
      if (!Object.keys(teams).includes(attributeValue)) {
        teams[attributeValue] = {
          participantName: teamNames?.[teamIndex] || attributeValue,
          participantId: uuids?.pop() || UUID(),
          individualParticipantIds: [],
          participantRole: COMPETITOR,
          participantType: TEAM,
        };

        const extension = {
          name: GROUPING_ATTRIBUTE,
          value: personAttribute || participantAttribute,
        };
        addExtension({ element: teams[attributeValue], extension });

        teamIndex += 1;
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
        name: GROUPING_ATTRIBUTE,
        element: participant,
      });
      const groupingAttribute = extension?.value;

      if (groupingAttributes.includes(groupingAttribute)) {
        return participant.participantId;
      }
      return undefined;
    })
    .filter(Boolean);

  let participantsAdded = 0;
  const newParticipants: any[] = [];
  Object.keys(teams).forEach((attributeValue) => {
    const participant = teams[attributeValue];
    const { participantId } = participant;
    if (!overlappingTeamParticipantIds.includes(participantId)) {
      if (!tournamentRecord.participants) tournamentRecord.participants = [];
      if (addParticipants) tournamentRecord.participants.push(participant);
      newParticipants.push(participant);
      participantsAdded++;
    }
  });

  if (addParticipants && participantsAdded) {
    addNotice({
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: newParticipants,
      },
      topic: ADD_PARTICIPANTS,
    });
    return { ...SUCCESS, participantsAdded };
  } else if (newParticipants.length) {
    return { ...SUCCESS, newParticipants };
  } else {
    return { error: NO_PARTICIPANTS_GENERATED };
  }
}

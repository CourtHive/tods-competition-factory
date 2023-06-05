import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { findParticipant } from '../../../global/functions/deducers/findParticipant';
import { getParticipantId } from '../../../global/functions/extractors';
import { definedAttributes } from '../../../utilities/objects';
import { addParticipants } from './addParticipants';
import { UUID } from '../../../utilities';

import { INDIVIDUAL, PAIR } from '../../../constants/participantConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  COMPETITOR,
  participantRoles,
} from '../../../constants/participantRoles';
import {
  INVALID_PARTICIPANT_ROLE,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

// add persons to a tournamentRecord and create participants in the process
// include ability to specify a doubles partner by personId
export function addPersons({
  participantRole = COMPETITOR,
  tournamentRecord,
  persons,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(persons)) return { error: INVALID_VALUES };
  if (!Object.keys(participantRoles).includes(participantRole))
    return { error: INVALID_PARTICIPANT_ROLE };

  const existingPersonIds = (tournamentRecord.participants || [])
    .map(({ person }) => person?.personId)
    .filter(Boolean);

  const newPersonIds = [];

  const personsToAdd = persons
    .filter(
      (person) =>
        person &&
        // don't add a person if their personId is present in tournament.participants
        (!person.personId || !existingPersonIds.includes(person.personId))
    )
    .map((person) => {
      if (!person.personId) person.personId = UUID();
      // keep track of all incoming personIds for doubles creation
      newPersonIds.push(person.personId);
      return person;
    });

  // remove top level attributes which are used for participant generation
  const excludeAttributes = (element, attributes) => {
    return Object.assign(
      {},
      ...Object.keys(element)
        .filter((key) => !attributes.includes(key))
        .map((key) => ({ [key]: element[key] }))
    );
  };

  const individualParticipants = personsToAdd.map((person) =>
    definedAttributes({
      extensions: person.participantExtensions,
      timeItems: person.participantTimeItems,
      participantType: INDIVIDUAL,
      participantRole,
      person: excludeAttributes(person, [
        'participantExtensions',
        'participantTimeItems',
        'pairedPersons',
      ]),
    })
  );

  let addedPairParticipantsCount = 0;
  let addedIndividualParticipantsCount = 0;

  let result = addParticipants({
    participants: individualParticipants,
    tournamentRecord,
  });
  if (result.error) return result;
  addedIndividualParticipantsCount = result.addedCount || 0;

  const pairParticipants = [];

  const tournamentParticipants =
    getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
      tournamentRecord,
    })?.tournamentParticipants || [];

  if (participantRole === COMPETITOR) {
    persons
      .filter(({ pairedPersons }) => pairedPersons)
      .forEach(({ personId, pairedPersons }) => {
        Array.isArray(pairedPersons) &&
          pairedPersons.forEach((pairing) => {
            const individualParticipants = [personId, pairing.personId]
              .map((id) =>
                findParticipant({ tournamentParticipants, personId: id })
              )
              .filter(Boolean);
            if (individualParticipants.length === 2) {
              const individualParticipantIds =
                individualParticipants.map(getParticipantId);
              pairParticipants.push(
                definedAttributes({
                  extensions: pairing.participantExtensions,
                  timeItems: pairing.timeItems,
                  participantRole: COMPETITOR,
                  individualParticipantIds,
                  participantType: PAIR,
                })
              );
            }
          });
      });
  }

  if (pairParticipants.length) {
    result = addParticipants({
      participants: pairParticipants,
      tournamentRecord,
    });
    if (result.error) return result;
    addedPairParticipantsCount = result.addedCount || 0;
  }

  const addedCount =
    addedIndividualParticipantsCount + addedPairParticipantsCount;

  return { ...SUCCESS, addedCount, newPersonIds };
}

import { extractDate, formatDate } from '../../../utilities/dateTime';
import { generatePersons } from '../../generators/generatePersons';
import { generateAddress } from '../../generators/generateAddress';
import { nameMocks } from '../../utilities/nameMocks';
import { UUID } from '../../../utilities';
import {
  findEventExtension,
  findTournamentExtension,
} from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import {
  postalCodeMocks,
  stateMocks,
  cityMocks,
} from '../../utilities/address';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { FEMALE, MALE, OTHER } from '../../../constants/genderConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  FLIGHT_PROFILE,
  internalExtensions,
  PERSON_REQUESTS,
  SCHEDULING_PROFILE,
} from '../../../constants/extensionConstants';
import {
  GROUP,
  INDIVIDUAL,
  PAIR,
  TEAM,
} from '../../../constants/participantConstants';

export function anonymizeTournamentRecord({
  keepExtensions = [], // e.g. ['level']
  anonymizeParticipantNames = true,
  tournamentRecord,
  tournamentName,
  personIds = [],
  tournamentId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  // if keepExtensions is boolean true then keep all extensions
  // otherwise, keep any specified extensions along with internal extensions
  const extensionsToKeep = Array.isArray(keepExtensions)
    ? internalExtensions.concat(...keepExtensions)
    : internalExtensions;

  const filterExtensions = (element) => {
    if (Array.isArray(keepExtensions)) {
      return element?.extensions?.filter((extension) =>
        extensionsToKeep.includes(extension.name)
      );
    } else {
      return element?.extensions;
    }
  };

  // create mapping from original element IDs to newly generated UUIDs
  const idMap = {};

  // change the tournamentId and name
  tournamentRecord.extensions = filterExtensions(tournamentRecord);

  const newTournamentId = tournamentId || UUID();
  idMap[tournamentRecord.tournamentId] = newTournamentId;
  tournamentRecord.tournamentId = newTournamentId;

  tournamentRecord.createdAt = new Date().toISOString();
  tournamentRecord.tournamentName =
    tournamentName || `Anonymized: ${formatDate(new Date())}`;

  delete tournamentRecord.parentOrganisation;

  for (const participant of tournamentRecord.participants || []) {
    const newParticipantId = UUID();
    idMap[participant.participantId] = newParticipantId;
    participant.participantId = newParticipantId;
  }

  // update all PAIR, GROUP and TEAM participant individualParticipantIds
  for (const participant of tournamentRecord.participants || []) {
    if (Array.isArray(participant.individualParticipantIds)) {
      participant.individualParticipantIds =
        participant.individualParticipantIds.map(
          (individualParticipantId) => idMap[individualParticipantId]
        );
    }
  }

  let venueIndex = 0;
  for (const venue of tournamentRecord.venues || []) {
    venue.extensions = filterExtensions(venue);
    venue.venueName = `Venue #${venueIndex}`;
    venue.venueAbbreviation = `V${venueIndex}`;
    const newVenueId = UUID();
    idMap[venue.venueId] = newVenueId;
    venueIndex += 1;
    // venue.eventId = UUID(); eventIds can't be anonymized without updating schedulingProfiles
  }

  let eventCount = 1;
  for (const event of tournamentRecord.events || []) {
    event.extensions = filterExtensions(event);

    const newEventId = UUID();
    idMap[event.eventId] = newEventId;
    event.eventId = newEventId;
    const categoryName =
      event.category?.categoryName ||
      event.category?.ageCategoryCode ||
      event.category?.ratingType ||
      event.gender;
    event.eventName = `Event ${eventCount} ${categoryName}`;

    // update all event entries
    if (Array.isArray(event.entries)) {
      for (const entry of event.entries) {
        entry.participantId = idMap[entry.participantId];
      }
    }

    /*
    // no need to remove entry extensions
    for (const entry of event.entries || []) { entry.extensions = filterExtensions(entry); }
    */

    for (const drawDefinition of event.drawDefinitions || []) {
      drawDefinition.extensions = filterExtensions(drawDefinition);
      const newDrawId = UUID();
      idMap[drawDefinition.drawId] = newDrawId;
      drawDefinition.drawId = newDrawId;

      // update all drawDefinition entries
      if (Array.isArray(drawDefinition.entries)) {
        for (const entry of drawDefinition.entries) {
          entry.participantId = idMap[entry.participantId];
        }
      }

      const updateStructure = (structure) => {
        structure.extensions = filterExtensions(structure);
        const newStructureId = UUID();
        idMap[structure.structureId] = newStructureId;
        structure.structureId = newStructureId;

        // update positionAssignments for all structures
        for (const assignment of structure.positionAssignments || []) {
          if (assignment.participantId)
            assignment.participantId = idMap[assignment.participantId];
        }

        // update seedAssignments for all structures
        for (const assignment of structure.seedAssignments || []) {
          if (assignment.participantId)
            assignment.participantId = idMap[assignment.participantId];
        }

        // update lineUps in each matchUp
        for (const matchUp of structure.matchUps || []) {
          for (const side of matchUp.sides || []) {
            if (!side.lineUp) continue;
            side.lineUp = side.lineUp.map(
              ({ participantId, collectionAssignments }) => ({
                participantId: idMap[participantId],
                collectionAssignments,
              })
            );
          }
        }
      };

      for (const structure of drawDefinition.structures || []) {
        updateStructure(structure);

        // account for structureType CONTAINER
        if (Array.isArray(structure.structures)) {
          for (const childStructure of structure.structures) {
            updateStructure(childStructure);
          }
        }
      }

      // use idMap to update all link IDs
      for (const link of drawDefinition.links || []) {
        link.source.structureId = idMap[link.source.structureId];
        link.target.structureId = idMap[link.target.structureId];
      }
    }

    const { extension: flightProfile } = findEventExtension({
      name: FLIGHT_PROFILE,
      event,
    });

    // use idMap to update all IDs in flightProfiles
    if (Array.isArray(flightProfile?.value?.flights)) {
      flightProfile.value.flights?.forEach((flight) => {
        flight.drawId = idMap[flight.drawId];
        if (Array.isArray(flight.drawEntries)) {
          for (const entry of flight.drawEntries) {
            entry.participantId = idMap[entry.participantId];
          }
        }
      });
    }

    eventCount += 1;
  }

  const consideredDate = tournamentRecord.startDate || formatDate(new Date());

  const individualParticipants = (tournamentRecord.participants || []).filter(
    ({ participantType }) => participantType === INDIVIDUAL
  );

  const gendersCount = individualParticipants.reduce(
    (counts, participant) => {
      const gender = participant.person?.sex;
      if ([MALE, FEMALE].includes(gender)) {
        counts[gender] += 1;
      } else {
        counts[OTHER] += 1;
      }
      return counts;
    },
    { [MALE]: 0, [FEMALE]: 0, [OTHER]: 0 }
  );

  const genderedPersons = Object.assign(
    {},
    ...Object.keys(gendersCount).map((gender) => ({
      [gender]:
        generatePersons({
          category: { ageCategoryCode: 'O18' }, // ageCategoryCode is unimportant since birthYear will be replaced
          count: gendersCount[gender],
          addressProps: { citiesCount: 10 },
          personExtensions: [],
          consideredDate,
          sex: gender,
        })?.persons || [],
    }))
  );

  const genderedIndices = { [MALE]: 0, [FEMALE]: 0, [OTHER]: 0 };

  const individualParticipantsCount = individualParticipants.length;

  const addressComponents = individualParticipants.reduce(
    (components, participant) => {
      const address = participant.person?.addresses?.[0] || {};
      const { city, state, postalCode } = address;
      if (!components.cities.includes(city)) components.cities.push(city);
      if (!components.states.includes(state)) components.states.push(state);
      if (!components.postalCodes.includes(postalCode))
        components.postalCodes.push(postalCode);
      return components;
    },
    { cities: [], postalCodes: [], states: [] }
  );

  const postalCodesCount = addressComponents.postalCodes.length;
  const citiesCount = addressComponents.cities.length;
  const statesCount = addressComponents.states.length;

  const { cities } = cityMocks({
    count: citiesCount || individualParticipantsCount,
    participantsCount: individualParticipantsCount,
  });
  const { states } = stateMocks({
    count: statesCount || individualParticipantsCount,
    participantsCount: individualParticipantsCount,
  });
  const { postalCodes } = postalCodeMocks({
    count: postalCodesCount || individualParticipantsCount,
    participantsCount: individualParticipantsCount,
  });
  const addressValues = { cities, states, postalCodes };

  individualParticipants.forEach((individualParticipant, participantIndex) => {
    const person = individualParticipant?.person;
    const gender = person?.sex || OTHER;
    const birthYear = extractDate(person?.birthDate)?.split('-')[0];

    const genderedIndex = genderedIndices[gender];
    const generatedPerson = genderedPersons[gender][genderedIndex];
    genderedIndices[gender] += 1;

    if (birthYear) {
      const [, month, day] = generatedPerson?.birthDate?.split('-') || [];
      const birthDate = [birthYear, month, day].join('-');
      generatedPerson.birthDate = birthDate;
    }

    if (person?.addresses) {
      const address = generateAddress({
        ...addressValues,
        participantIndex,
        nationalityCode: generatedPerson.nationalityCode,
      });

      generatedPerson.addresses = [address];
    }

    generatedPerson.personId = personIds?.[participantIndex] || UUID();

    if (anonymizeParticipantNames) {
      generatedPerson.standardFamilyName = generatedPerson.lastName;
      generatedPerson.standardGivenName = generatedPerson.firstName;
      individualParticipant.participantName = `${generatedPerson.standardGivenName} ${generatedPerson.standardFamilyName}`;
    } else {
      generatedPerson.standardFamilyName = person?.standardFamilyName;
      generatedPerson.standardGivenName = person?.standardGivenName;
    }

    delete generatedPerson.firstName;
    delete generatedPerson.lastName;

    generatedPerson.extensions = filterExtensions(person);
    individualParticipant.person = generatedPerson;
    idMap[person?.personId] = generatedPerson.personId;
  });

  const pairParticipants = (tournamentRecord.participants || []).filter(
    ({ participantType }) => participantType === PAIR
  );

  pairParticipants.forEach((pairParticipant) => {
    const { individualParticipantIds } = pairParticipant;
    pairParticipant.participantName = generatePairParticipantName({
      individualParticipantIds,
      individualParticipants,
    });
  });

  const teamParticipants = (tournamentRecord.participants || []).filter(
    ({ participantType }) => participantType === TEAM
  );
  const teamParticipantsCount = teamParticipants.length;
  const teamNames = nameMocks({ count: teamParticipantsCount }).names;
  teamParticipants.forEach((teamParticipant, i) => {
    teamParticipant.participantName = teamNames[i];
  });

  const groupParticipants = (tournamentRecord.participants || []).filter(
    ({ participantType }) => participantType === GROUP
  );
  const groupParticipantsCount = groupParticipants.length;
  const groupNames = nameMocks({
    count: groupParticipantsCount,
    nameRoot: 'Group',
  }).names;
  groupParticipants.forEach((teamParticipant, i) => {
    teamParticipant.participantName = groupNames[i];
  });

  const { extension: schedulingProfile } = findTournamentExtension({
    name: SCHEDULING_PROFILE,
    tournamentRecord,
  });

  // use idMap to update all IDs in schedulingProfile
  if (Array.isArray(schedulingProfile?.value)) {
    schedulingProfile.value.forEach((round) => {
      round.tournamentId = idMap[round.tournamentId];
      round.structureId = idMap[round.structureId];
      round.eventId = idMap[round.eventId];
      round.drawId = idMap[round.drawId];
    });
  }

  const { extension: personRequests } = findTournamentExtension({
    name: PERSON_REQUESTS,
    tournamentRecord,
  });

  // use idMap to update all IDs in personRequests
  if (Array.isArray(personRequests?.value)) {
    personRequests.value.forEach((request) => {
      request.personId = idMap[request.personId];
    });
  }

  return { ...SUCCESS };
}

function generatePairParticipantName({
  individualParticipantIds,
  individualParticipants,
}) {
  let participantName = individualParticipants
    .filter(({ participantId }) =>
      individualParticipantIds.includes(participantId)
    )
    .map(({ person }) => person?.standardFamilyName)
    .filter(Boolean)
    .sort()
    .join('/');

  if (individualParticipantIds.length === 1) participantName += '/Unknown';
  return participantName;
}

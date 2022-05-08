import { generatePersons } from '../../generators/generatePersons';
import { generateAddress } from '../../generators/generateAddress';
import { formatDate } from '../../../utilities/dateTime';
import { teamMocks } from '../../utilities/teamMocks';
import { UUID } from '../../../utilities';
import {
  postalCodeMocks,
  stateMocks,
  cityMocks,
} from '../../utilities/address';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { INDIVIDUAL, PAIR, TEAM } from '../../../constants/participantTypes';
import { FEMALE, MALE, OTHER } from '../../../constants/genderConstants';
import { SUCCESS } from '../../../constants/resultConstants';

// TODO: anonymize VenueNames ... and, eventually, venueIds
export function anonymizeTournamentRecord({
  // extensionsToKeep = [], e.g. 'level'
  anonymizeParticipantNames = true,
  tournamentRecord,
  tournamentName,
  personIds = [],
  tournamentId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  // change the tournamentId and name
  tournamentRecord.tournamentId = tournamentId || UUID();
  tournamentRecord.createdAt = new Date().toISOString();
  tournamentRecord.tournamentName =
    tournamentName || `Anonymized: ${formatDate(new Date())}`;

  delete tournamentRecord.parentOrganisation;

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
    const birthYear = person?.birthDate?.split('-').reverse()[0];

    const genderedIndex = genderedIndices[gender];
    const generatedPerson = genderedPersons[gender][genderedIndex];
    genderedIndices[gender] += 1;

    if (birthYear) {
      const [, month, day] = generatedPerson?.birthDate?.split('-') || [];
      const birthDate = [birthYear, month, day].join('-');
      generatedPerson.birthDate = birthDate;
    }

    if (person.addresses) {
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
    }

    delete generatedPerson.firstName;
    delete generatedPerson.lastName;

    individualParticipant.person = generatedPerson;
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

  const teamNames = teamMocks({ count: teamParticipantsCount }).teams;

  teamParticipants.forEach((teamParticipant, i) => {
    teamParticipant.participantName = teamNames[i];
  });

  // TODO: remove specific extensions...
  // what other places in a tournament might contain PII?

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

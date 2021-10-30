import { cityMocks, stateMocks, postalCodeMocks } from '../utilities/address';
import { randomInt, skewedDistribution } from '../../utilities/math';
import { generateRange, shuffleArray, UUID } from '../../utilities';
import { definedAttributes } from '../../utilities/objects';
import { countries } from '../../fixtures/countryData';
import { personMocks } from '../utilities/personMocks';
import { teamMocks } from '../utilities/teamMocks';

import defaultRatingsParameters from '../../fixtures/ratings/ratingsParameters';
import { INDIVIDUAL, PAIR, TEAM } from '../../constants/participantTypes';
import { RANKING, RATING, SCALE } from '../../constants/scaleConstants';
import { COMPETITOR } from '../../constants/participantRoles';
import { DOUBLES } from '../../constants/matchUpTypes';
import { SINGLES } from '../../constants/eventConstants';

/**
 *
 * Generate mock participants
 *
 * @param {string[]} nationalityCodes - an array of ISO codes to randomly assign to participants
 * @param {number} nationalityCodesCount - number of nationality codes to use when generating participants
 * @param {number} participantsCount - number of participants to generate
 * @param {string} participantType - [INDIVIDUAL, PAIR, TEAM]
 * @param {number[]} personIds - optional array of pre-defined personIds
 * @param {string} matchUpType - optional - [SINGLES, DOUBLES] - forces PAIR participant generation if DOUBLES
 * @param {string} sex - optional - [MALE, FEMALE]
 * @param {number} valuesInstanceLimit - maximum number of values which can be the same
 * @param {number} valuesCount - number of values to generate
 * @param {boolean} inContext - whether to expand PAIR and TEAM individualParticipantIds => individualParticipant objects
 * @param {object[]} personData - optional array of persons to seed generator [{ firstName, lastName, sex, nationalityCode }]
 * @param {object} personExtensions - optional array of extentsions to apply to all persons
 * @param {string} consideredDate - date from which category ageMaxDate and ageMinDate should be calculated (typically tournament.startDate or .endDate)
 * @param {object} category - optional - { categoryName, ageCategoryCode, ratingType, ratingMax, ratingMin }
 * @param {number[]} rankingRankge - optional - range within which ranking numbers should be generated for specified category (non-rating)
 * @param {number} scaledParticipantsCount - optional - number of participants to assign rankings/ratings - defaults to ~25
 *
 */
export function generateParticipants({
  ratingsParameters = defaultRatingsParameters,
  valuesInstanceLimit,
  consideredDate,
  category,

  nationalityCodesCount,
  nationalityCodeType,
  nationalityCodes,

  participantsCount = 32,
  participantType,
  personIds,
  uuids,

  personExtensions,
  addressProps,
  matchUpType,
  personData,
  sex,

  inContext,

  rankingRange = [1, 100], // range of ranking positions to generate
  scaledParticipantsCount, // number of participants to assign rankings/ratings
}) {
  const doubles = participantType === PAIR || matchUpType === DOUBLES;
  const team = participantType === TEAM || matchUpType === TEAM;
  const individualParticipantsCount =
    participantsCount * (doubles ? 2 : team ? 8 : 1);

  const { persons: mockedPersons, error } = personMocks({
    count: individualParticipantsCount,
    personExtensions,
    consideredDate,
    personData,
    category,
    sex,
  });
  if (error) return { error };

  // generated arrays of rankings and ratings to be attached as scaleItems
  let doublesRankings = [],
    singlesRankings = [],
    singlesRatings = [],
    doublesRatings = [];

  if (typeof category === 'object') {
    const { categoryName, ageCategoryCode, ratingType } = category;
    if ((categoryName || ageCategoryCode) && !ratingType) {
      singlesRankings = shuffleArray(generateRange(...rankingRange)).slice(
        0,
        scaledParticipantsCount || randomInt(20, 30)
      );
      if ([PAIR, TEAM].includes(participantType))
        doublesRankings = shuffleArray(generateRange(...rankingRange)).slice(
          0,
          scaledParticipantsCount || randomInt(20, 30)
        );
    }

    if (ratingType && ratingsParameters[ratingType]) {
      let { ratingMax, ratingMin } = category;
      const ratingParameter = ratingsParameters[ratingType];
      const {
        attributes = {},
        decimalsCount,
        accessors,
        range,
      } = ratingParameter;

      const inverted = range[0] > range[1];
      const skew = inverted ? 2 : 0.5;
      const [min, max] = range.slice().sort();
      const generateRatings = () =>
        generateRange(0, 1000)
          .map(() => skewedDistribution(min, max, skew, decimalsCount))
          .filter(
            (rating) =>
              (!ratingMax || rating <= ratingMax) &&
              (!ratingMin || rating >= ratingMin)
          )
          .slice(0, scaledParticipantsCount || randomInt(20, 30))
          .map((scaleValue) =>
            !accessors
              ? scaleValue
              : Object.assign(
                  {},
                  ...accessors.map((accessor) => ({ [accessor]: scaleValue })),
                  attributes
                )
          );

      singlesRatings = generateRatings();
      if ([PAIR, TEAM].includes(participantType)) {
        doublesRatings = generateRatings();
      }
    }
  }

  const isoCountries = countries.filter((country) =>
    nationalityCodeType === 'ISO' ? country.iso : country.ioc
  );
  const { citiesCount, statesCount, postalCodesCount } = addressProps || {};

  function getMin(count) {
    const instances = Math.ceil(individualParticipantsCount / count);
    if (valuesInstanceLimit && instances > valuesInstanceLimit)
      return Math.ceil(individualParticipantsCount / valuesInstanceLimit);
    return count;
  }

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

  const isoMin = getMin(nationalityCodesCount);
  const isoList = isoMin
    ? shuffleArray(isoCountries).slice(0, nationalityCodesCount)
    : nationalityCodes
    ? isoCountries.filter((isoCountry) =>
        nationalityCodes.includes(isoCountry.key)
      )
    : isoCountries;

  const countriesList = shuffleArray(
    generateRange(0, Math.ceil(individualParticipantsCount / (isoMin || 1)))
      .map(() => isoList)
      .flat(Infinity)
  );

  const teamNames = teamMocks({ count: participantsCount }).teams;
  const participants = generateRange(0, participantsCount)
    .map((i) => {
      const sideParticipantsCount = doubles ? 2 : team ? 8 : 1;
      const individualParticipants = generateRange(
        0,
        sideParticipantsCount
      ).map((j) => {
        const participantIndex = i * sideParticipantsCount + j;
        return generateIndividualParticipant(participantIndex);
      });

      const individualParticipantIds = individualParticipants.map(
        (participant) => participant.participantId
      );

      const pairName = individualParticipants
        .map((i) => i.person.standardFamilyName)
        .join('/');

      const groupParticipant = {
        participantId: uuids?.pop() || UUID(),
        participantType: doubles ? PAIR : TEAM,
        participantRole: COMPETITOR,
        participantName: doubles ? pairName : teamNames[i],
        individualParticipantIds,
      };

      if (inContext)
        groupParticipant.individualParticipants = individualParticipants;

      return doubles || team
        ? [groupParticipant, ...individualParticipants]
        : individualParticipants;
    })
    .flat();

  return { participants };

  function generateIndividualParticipant(participantIndex) {
    const person = mockedPersons[participantIndex];
    const {
      nationalityCode: personNationalityCode,
      extensions,
      firstName,
      birthDate,
      lastName,
      sex,
    } = person || {};
    const standardGivenName = firstName || 'GivenName';
    const standardFamilyName = lastName || 'FamilyName';
    const participantName = `${standardGivenName} ${standardFamilyName}`;
    const country = countriesList[participantIndex];
    const nationalityCode =
      (country &&
        (nationalityCodeType === 'ISO'
          ? country.iso
          : country.ioc || country.iso)) ||
      personNationalityCode;

    if (countriesList?.length && !nationalityCode && !personNationalityCode) {
      console.log('%c Invalid Nationality Code', { participantIndex, country });
    }
    const address = generateAddress({
      ...addressValues,
      participantIndex,
      nationalityCode,
    });
    const participant = definedAttributes({
      participantId: uuids?.pop() || UUID(),
      participantType: INDIVIDUAL,
      participantRole: COMPETITOR,
      participantName,
      person: {
        addresses: [address],
        personId: (personIds?.length && personIds[participantIndex]) || UUID(),
        standardFamilyName,
        standardGivenName,
        nationalityCode,
        extensions,
        birthDate,
        sex,
      },
    });

    if (category) {
      const singlesRanking = singlesRankings[participantIndex];
      const doublesRanking = doublesRankings[participantIndex];

      addScaleItem({
        scaleValue: singlesRanking,
        eventType: SINGLES,
        scaleType: RANKING,
        participant,
        category,
      });
      addScaleItem({
        scaleValue: doublesRanking,
        eventType: DOUBLES,
        scaleType: RANKING,
        participant,
        category,
      });

      const singlesRating = singlesRatings[participantIndex];
      const doublesRating = doublesRatings[participantIndex];

      addScaleItem({
        scaleValue: singlesRating,
        eventType: SINGLES,
        scaleType: RATING,
        participant,
        category,
      });
      addScaleItem({
        scaleValue: doublesRating,
        eventType: DOUBLES,
        scaleType: RATING,
        participant,
        category,
      });
    }

    return participant;
  }
}

function addScaleItem({
  scaleValue: itemValue,
  participant,
  eventType,
  scaleType,
  category,
}) {
  const scaleName =
    category.categoryName || category.ratingType || category.ageCategoryCode;
  const itemType = [SCALE, scaleType, eventType, scaleName].join('.');
  const timeItem = { itemValue, itemType };
  if (scaleName && itemValue) {
    if (!participant.timeItems) participant.timeItems = [];
    participant.timeItems.push(timeItem);
  }
}

function generateAddress(addressAttributes) {
  const { cities, states, postalCodes, nationalityCode, participantIndex } =
    addressAttributes;
  const address = {
    city: cities && cities[participantIndex],
    state: states && states[participantIndex],
    postalCode: postalCodes && postalCodes[participantIndex],
    countryCode: nationalityCode,
  };
  return address;
}

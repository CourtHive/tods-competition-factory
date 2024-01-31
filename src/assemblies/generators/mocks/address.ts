import statesData from '../../../fixtures/data/territories.json';
import citiesData from '../../../fixtures/data/cities.json';
import { randomInt } from '@Tools/math';

import { generateRange, randomMember, shuffleArray } from '@Tools/arrays';

export function address() {
  return {
    city: cityMocks().cities[0],
    state: stateMocks().states[0],
    postalCode: postalCodeMocks().postalCodes[0],
  };
}

export function cityMocks({ count = 1, participantsCount = 32 } = {}) {
  const shuffledCities = shuffleArray(citiesData);
  const candidateCities = shuffledCities.slice(0, count);

  // the following ensures that all of the generated items are used at least once
  const cities = generateRange(0, participantsCount).map((i) =>
    i < Math.min(count, shuffledCities.length) ? candidateCities[i] : randomMember(candidateCities),
  );
  return { cities };
}

export function stateMocks({ count = 1, participantsCount = 32 } = {}) {
  const shuffledStates = shuffleArray(statesData);
  const candidateStates = shuffledStates
    .slice(0, count)
    .map((state) => Object.keys(state))
    .flat();

  // the following ensures that all of the generated items are used at least once
  const states = generateRange(0, participantsCount).map((i) =>
    i < Math.min(count, shuffledStates.length) ? candidateStates[i] : randomMember(candidateStates),
  );
  return { states };
}

export function postalCodeMocks({ count = 1, participantsCount = 32 } = {}) {
  const candidatePostalCodes = generateRange(0, count).map(() =>
    generateRange(0, 5)
      .map(() => randomInt(0, 9))
      .join(''),
  );

  // the following ensures that all of the generated items are used at least once
  const postalCodes = generateRange(0, participantsCount).map((i) =>
    i < count ? candidatePostalCodes[i] : randomMember(candidatePostalCodes),
  );
  return { postalCodes };
}

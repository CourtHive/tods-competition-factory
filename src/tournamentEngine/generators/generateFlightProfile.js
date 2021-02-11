import { addEventExtension } from '../governors/tournamentGovernor/addRemoveExtensions';
import { chunkArray, generateRange, makeDeepCopy, UUID } from '../../utilities';
import { getFlightProfile } from '../getters/getFlightProfile';

import {
  EXISTING_PROFILE,
  MISSING_EVENT,
} from '../../constants/errorConditionConstants';
import { SUCCESS } from '../../constants/resultConstants';

/**
 *
 * @param {object} event - automatically retrieved by tournamentEngine given eventId
 * @param {string} eventId - unique identifier for event
 * @param {string} splitMethod - one of the supported methods for splitting entries
 * @param {object} scaleAttributes - { scaleName, scaleType, evenTType }
 * @param {number} flightsCount - number of flights to create from existing entries
 * @param {string[]} flightNames - array of names to be used when generating flights
 * @param {string} flightNameRoot - root word for generating flight names
 * @param {boolean} deleteExisting - if flightProfile exists then delete
 *
 */
export function generateFlightProfile({
  event,
  splitMethod = 'evenSplit',
  scaleAttributes,
  flightNames = [],
  flightsCount,
  flightNameRoot = 'Flight',
  deleteExisting,
}) {
  if (!event) return { error: MISSING_EVENT };

  const { flightProfile } = getFlightProfile({ event });
  if (flightProfile && !deleteExisting) return { error: EXISTING_PROFILE };

  const eventEntries = event.entries || [];
  const entriesTypeMap = eventEntries.reduce((entriesTypeMap, entry) => {
    const { entryType } = entry;
    if (!entriesTypeMap[entryType]) entriesTypeMap[entryType] = [];
    entriesTypeMap[entryType].push(entry);
    return entriesTypeMap;
  }, {});

  if (scaleAttributes) {
    // sort entries by scaleAttributes
  }

  let splitEntryTypes = [];

  if (splitMethod === 'evenSplit') {
    const entriesCount = eventEntries.length;
    const chunkSize = Math.ceil(entriesCount / flightsCount);
    splitEntryTypes = Object.keys(entriesTypeMap).map((entryType) => {
      return chunkArray(entriesTypeMap[entryType], chunkSize);
    });
  }

  const flights = generateRange(0, flightsCount).map((index) => {
    const entries = [].concat(
      ...splitEntryTypes.map((entryType) => entryType[index])
    );
    const flight = {
      entries,
      drawId: UUID(),
      flightName:
        (flightNames?.length && flightNames[index]) ||
        `${flightNameRoot} ${index + 1}`,
    };
    return flight;
  });

  const extension = {
    name: 'flightProfile',
    value: {
      flights,
    },
  };

  addEventExtension({ event, extension });

  return Object.assign(SUCCESS, { flightProfile: makeDeepCopy({ flights }) });
}

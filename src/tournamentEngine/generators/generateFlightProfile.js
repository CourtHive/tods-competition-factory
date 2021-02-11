import { chunkArray, generateRange, UUID } from '../../utilities';
import { addEventExtension } from '../governors/tournamentGovernor/addRemoveExtensions';

import { MISSING_EVENT } from '../../constants/errorConditionConstants';

/**
 *
 * @param {object} event - automatically retrieved by tournamentEngine given eventId
 * @param {string} eventId - unique identifier for event
 * @param {string} splitMethod - one of the supported methods for splitting entries
 * @param {object} scaleAttributes - { scaleName, scaleType, evenTType }
 * @param {number} flightsCount - number of flights to create from existing entries
 * @param {string[]} flightNames - array of names to be used when generating flights
 * @param {string} flightNameRoot - root word for generating flight names
 *
 */
export function generateFlightProfile({
  event,
  splitMethod = 'evenSplit',
  scaleAttributes,
  flightNames,
  flightsCount,
  flightNameRoot = 'Flight',
}) {
  if (!event) return { error: MISSING_EVENT };

  const entriesTypeMap = (event.entries || []).reduce(
    (entriesTypeMap, entry) => {
      const { entryType } = entry;
      if (!entriesTypeMap[entryType]) entriesTypeMap[entryType] = [];
      entriesTypeMap[entryType].push(entry);
      return entriesTypeMap;
    },
    {}
  );

  if (scaleAttributes) {
    // sort entries by scaleAttributes
  }

  let splitEntryTypes = [];

  if (splitMethod === 'eventSplit') {
    splitEntryTypes = Object.keys(entriesTypeMap).map((entryType) => {
      return chunkArray(entriesTypeMap[entryType], flightsCount);
    });
  }

  const flights = generateRange(0, flightsCount).map((index) => {
    const entries = [].concat(
      ...splitEntryTypes.map((entryType) => entryType[index])
    );
    const flight = {
      entries,
      drawId: UUID(),
      flightName: flightNames[index] || `${flightNameRoot} ${index + 1}`,
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

  return;
}

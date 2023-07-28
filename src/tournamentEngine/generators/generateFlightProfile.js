import { attachFlightProfile as attachProfile } from '../governors/eventGovernor/attachFlightProfile';
import { getScaledEntries } from '../governors/eventGovernor/entries/getScaledEntries';
import { chunkArray, generateRange, chunkByNth, UUID } from '../../utilities';
import { getParticipantId } from '../../global/functions/extractors';
import { getDevContext } from '../../global/state/globalState';
import { getFlightProfile } from '../getters/getFlightProfile';

import { DIRECT_ENTRY_STATUSES } from '../../constants/entryStatusConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  EXISTING_PROFILE,
  MISSING_EVENT,
} from '../../constants/errorConditionConstants';
import {
  SPLIT_SHUTTLE,
  SPLIT_WATERFALL,
} from '../../constants/flightConstants';

/**
 *
 * @param {object} event - automatically retrieved by tournamentEngine given eventId
 * @param {string} eventId - unique identifier for event
 * @param {string} splitMethod - one of the supported methods for splitting entries
 * @param {object} scaleAttributes - { scaleName, scaleType, evenTType }
 * @param {object[]} scaledEntries - pre-sorted entries
 * @param {function} scaleSortMethod - ignored if scaledEntries present
 * @param {boolean} sortDescending - ignored if scaledEntries present
 * @param {number} flightsCount - number of flights to create from existing entries
 * @param {object[]} flightValues - optional - [{ flightNumber: 1, matchUpValue: 1, flightNumber: 2, matchUpValue: 2 }]
 * @param {string[]} drawNames - array of names to be used when generating flights
 * @param {string} drawNameRoot - root word for generating flight names
 * @param {boolean} deleteExisting - if flightProfile exists then delete
 * @param {string} stage - OPTIONAL - only consider event entries matching stage
 *
 */
export function generateFlightProfile({
  drawNameRoot = 'Flight',
  attachFlightProfile,
  tournamentRecord,
  scaleAttributes,
  scaleSortMethod,
  deleteExisting,
  sortDescending,
  drawNames = [],
  scaledEntries,
  flightsCount,
  flightValues,
  splitMethod,
  uuids = [],
  event,
  stage,
}) {
  if (!event) return { error: MISSING_EVENT };
  const eventEntries = event.entries || [];

  const { flightProfile } = getFlightProfile({ event });
  if (flightProfile && attachFlightProfile && !deleteExisting) {
    return { error: EXISTING_PROFILE };
  }

  if (!scaledEntries) {
    ({ scaledEntries } = getScaledEntries({
      tournamentRecord,
      scaleAttributes,
      scaleSortMethod,
      sortDescending,
      event,
      stage,
    }));
  }

  const scaledEntryParticipantIds = scaledEntries.map(getParticipantId);
  const unscaledEntries = eventEntries
    .filter(
      ({ participantId }) => !scaledEntryParticipantIds.includes(participantId)
    )
    .filter(
      (entry) =>
        (!stage || !entry.entryStage || entry.entryStage === stage) &&
        DIRECT_ENTRY_STATUSES.includes(entry.entryStatus)
    );

  const flightEntries = scaledEntries.concat(...unscaledEntries);
  const entriesCount = flightEntries.length;

  // default is SPLIT_LEVEL_BASED
  const chunkSize = Math.ceil(entriesCount / flightsCount);
  let splitEntries = chunkArray(flightEntries, chunkSize);

  if (splitMethod === SPLIT_WATERFALL) {
    splitEntries = chunkByNth(flightEntries, flightsCount);
  } else if (splitMethod === SPLIT_SHUTTLE) {
    splitEntries = chunkByNth(flightEntries, flightsCount, true);
  }

  function getDrawEntries(entriesChunk) {
    return (entriesChunk || [])
      .map(({ participantId, scaleValue }) => {
        const entry = eventEntries.find(
          (entry) => entry.participantId === participantId
        );
        if (scaleValue) entry.scaleValue = scaleValue;
        return entry;
      })
      .sort((a, b) => a.scaleValue - b.scaleValue)
      .map((entry, i) => {
        if (entry.scaleValue) entry.seedNumber = i + 1;
        return entry;
      });
  }

  const flights = generateRange(0, flightsCount).map((index) => {
    const flightNumber = index + 1;
    const flight = {
      flightNumber,
      drawId: uuids?.pop() || UUID(),
      drawEntries: getDrawEntries(splitEntries[index]),
      drawName:
        (drawNames?.length && drawNames[index]) ||
        `${drawNameRoot} ${flightNumber}`,
    };

    const matchUpValue = flightValues?.find(
      (value) => value.flightNumber === flightNumber
    )?.matchUpValue;

    // UNUSED: flight.matchUpValue is currently unused
    if (matchUpValue) flight.matchUpValue = matchUpValue;

    return flight;
  });

  const updatedFlightProfile = {
    scaleAttributes,
    splitMethod,
    flights,
  };

  if (attachFlightProfile) {
    const result = attachProfile({
      flightProfile: updatedFlightProfile,
      deleteExisting,
      event,
    });
    return {
      splitEntries: (getDevContext() && splitEntries) || undefined,
      ...result,
    };
  } else {
    return { flightProfile: updatedFlightProfile, ...SUCCESS };
  }
}

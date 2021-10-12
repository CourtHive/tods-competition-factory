import { attachFlightProfile as attachProfile } from '../governors/eventGovernor/attachFlightProfile';
import { getScaledEntries } from '../governors/eventGovernor/entries/getScaledEntries';
import { chunkArray, generateRange, chunkByNth, UUID } from '../../utilities';
import { getParticipantId } from '../../global/functions/extractors';
import { getFlightProfile } from '../getters/getFlightProfile';
import { getDevContext } from '../../global/globalState';

import { STRUCTURE_SELECTED_STATUSES } from '../../constants/entryStatusConstants';
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
 * @param {number} flightsCount - number of flights to create from existing entries
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
  flightsCount,
  splitMethod,
  uuids = [],
  event,
  stage,
}) {
  if (!event) return { error: MISSING_EVENT };
  const eventEntries = event.entries || [];

  const { flightProfile } = getFlightProfile({ event });
  if (flightProfile && attachFlightProfile && !deleteExisting)
    return { error: EXISTING_PROFILE };

  const { scaledEntries } = getScaledEntries({
    tournamentRecord,
    scaleAttributes,
    scaleSortMethod,
    sortDescending,
    event,
    stage,
  });

  const scaledEntryParticipantIds = scaledEntries.map(getParticipantId);
  const unscaledEntries = eventEntries
    .filter(
      ({ participantId }) => !scaledEntryParticipantIds.includes(participantId)
    )
    .filter(
      (entry) =>
        (!stage || !entry.entryStage || entry.entryStage === stage) &&
        STRUCTURE_SELECTED_STATUSES.includes(entry.entryStatus)
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
    return (entriesChunk || []).map(({ participantId }) =>
      eventEntries.find((entry) => entry.participantId === participantId)
    );
  }

  const flights = generateRange(0, flightsCount).map((index) => {
    const flight = {
      flightNumber: index + 1,
      drawId: uuids?.pop() || UUID(),
      drawEntries: getDrawEntries(splitEntries[index]),
      drawName:
        (drawNames?.length && drawNames[index]) ||
        `${drawNameRoot} ${index + 1}`,
    };
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

import { attachFlightProfile as attachProfile } from '../governors/eventGovernor/attachFlightProfile';
import { getScaledEntries } from '../governors/eventGovernor/entries/getScaledEntries';
import { getParticipantId } from '../../global/functions/extractors';
import { getDevContext } from '../../global/state/globalState';
import { getFlightProfile } from '../getters/getFlightProfile';
import {
  chunkArray,
  generateRange,
  chunkByNth,
  UUID,
  shuffleArray,
} from '../../utilities';

import { DIRECT_ENTRY_STATUSES } from '../../constants/entryStatusConstants';
import { FlightProfile, ScaleAttributes } from '../../types/factoryTypes';
import { SUCCESS } from '../../constants/resultConstants';
import {
  EXISTING_PROFILE,
  ErrorType,
  MISSING_EVENT,
} from '../../constants/errorConditionConstants';
import {
  SPLIT_SHUTTLE,
  SPLIT_WATERFALL,
} from '../../constants/flightConstants';
import {
  Entry,
  Event,
  StageTypeEnum,
  Tournament,
} from '../../types/tournamentFromSchema';

/**
 * @param {object} event - automatically retrieved by tournamentEngine given eventId
 * @param {string} eventId - unique identifier for event
 * @param {string} splitMethod - one of the supported methods for splitting entries
 * @param {object} scaleAttributes - { scaleName, scaleType, eventType }
 * @param {object[]} scaledEntries - pre-sorted entries
 * @param {function} scaleSortMethod - ignored if scaledEntries present
 * @param {boolean} sortDescending - ignored if scaledEntries present
 * @param {number} flightsCount - number of flights to create from existing entries
 * @param {object[]} flightValues - optional - [{ flightNumber: 1, matchUpValue: 1, flightNumber: 2, matchUpValue: 2 }]
 * @param {string[]} drawNames - array of names to be used when generating flights
 * @param {string} drawNameRoot - root word for generating flight names
 * @param {boolean} deleteExisting - if flightProfile exists then delete
 * @param {string} stage - OPTIONAL - only consider event entries matching stage
 */

type GenerateFlightProfileArgs = {
  scaleAttributes: ScaleAttributes;
  attachFlightProfile?: boolean;
  tournamentRecord: Tournament;
  deleteExisting?: boolean;
  sortDescending?: boolean;
  drawNameRoot?: string;
  scaleSortMethod?: any;
  stage?: StageTypeEnum;
  drawNames?: string[];
  scaledEntries?: any;
  flightsCount: number;
  splitMethod: string;
  uuids?: string[];
  event: Event;
};

export function generateFlightProfile(params: GenerateFlightProfileArgs): {
  flightProfile?: FlightProfile;
  splitEntries?: Entry[][];
  success?: boolean;
  error?: ErrorType;
} {
  const {
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
  } = params;
  if (!event) return { error: MISSING_EVENT };
  const eventEntries = event.entries || [];

  const { flightProfile } = getFlightProfile({ event });
  if (flightProfile && attachFlightProfile && !deleteExisting) {
    return { error: EXISTING_PROFILE };
  }

  const scaledEntries =
    params.scaledEntries ??
    getScaledEntries({
      tournamentRecord,
      scaleAttributes,
      scaleSortMethod,
      sortDescending,
      event,
      stage,
    }).scaledEntries;

  const scaledEntryParticipantIds = scaledEntries.map(getParticipantId);
  const unscaledEntries = shuffleArray(
    eventEntries
      .filter(
        ({ participantId }) =>
          !scaledEntryParticipantIds.includes(participantId)
      )
      .filter(
        (entry: Entry) =>
          (!stage || !entry.entryStage || entry.entryStage === stage) &&
          (!entry.entryStatus || // absence of entryStatus is equivalent to DIRECT_ACCEPTANCE
            DIRECT_ENTRY_STATUSES.includes(entry.entryStatus))
      )
  );

  const flightEntries = scaledEntries.concat(...unscaledEntries);
  const entriesCount = flightEntries.length;

  // default is SPLIT_LEVEL_BASED - Evenly chunk sorted entries
  const chunkSize = Math.ceil(entriesCount / flightsCount);
  let splitEntries = chunkArray(flightEntries, chunkSize);

  if (splitMethod === SPLIT_WATERFALL) {
    // e.g. 1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4
    splitEntries = chunkByNth(flightEntries, flightsCount);
  } else if (splitMethod === SPLIT_SHUTTLE) {
    // e.g. 1,2,3,4,4,3,2,1,1,2,3,4,4,3,2,1
    splitEntries = chunkByNth(flightEntries, flightsCount, true);
  }

  function getDrawEntries(entriesChunk) {
    return (entriesChunk || [])
      .map(({ participantId, scaleValue }) => {
        const entry = eventEntries.find(
          (entry: Entry) => entry.participantId === participantId
        );
        if (entry?.scaleValue && scaleValue) entry.scaleValue = scaleValue;
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
    return {
      flightNumber,
      drawId: uuids?.pop() || UUID(),
      drawEntries: getDrawEntries(splitEntries[index]),
      drawName:
        (drawNames?.length && drawNames[index]) ||
        `${drawNameRoot} ${flightNumber}`,
    };
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

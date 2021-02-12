import { UUID, UUIDS } from './utilities/UUID';
import { dateTime, dateRange } from './utilities/dateTime';
import { numericSort } from './utilities/sorting';
import { makeDeepCopy } from './utilities/makeDeepCopy';
import { nearestPowerOf2, powerOf2, isNumeric } from './utilities/math';
import {
  countValues,
  chunkArray,
  generateRange,
  instanceCount,
  intersection,
  randomPop,
  randomMember,
  shuffleArray,
  unique,
} from './utilities/arrays';

export const utilities = {
  UUID,
  UUIDS,
  isNumeric,
  dateTime,
  dateRange,
  intersection,
  numericSort,
  makeDeepCopy,
  nearestPowerOf2,
  powerOf2,
  countValues,
  chunkArray,
  generateRange,
  instanceCount,
  randomPop,
  randomMember,
  shuffleArray,
  unique,
};

export { scoreGovernor } from './drawEngine/governors/scoreGovernor';
export { fixtures } from './fixtures';

// START: Asynchronous and Synchronous engine exports
export { competitionEngine } from './competitionEngine/sync';
export { competitionEngineAsync } from './competitionEngine/async';
export { tournamentEngine } from './tournamentEngine/sync';
export { tournamentEngineAsync } from './tournamentEngine/async';
export { drawEngine } from './drawEngine/sync';
export { drawEngineAsync } from './drawEngine/async';
export { mocksEngine } from './mocksEngine';
// END: Asynchronous and Synchronous engine exports

// START: constants ---------------------------------------------------------------
export { participantRoles } from './constants/participantRoles';
export { participantTypes } from './constants/participantTypes';
export { factoryConstants } from './constants';

export { drawDefinitionConstants } from './constants/drawDefinitionConstants';
export {
  entryStatusConstants,
  EntryStatusEnum,
} from './constants/entryStatusConstants';
export { errorConditionConstants } from './constants/errorConditionConstants';
export { eventConstants } from './constants/eventConstants';
export { flightConstants } from './constants/flightConstants';
export { genderConstants } from './constants/genderConstants';
export { matchUpActionConstants } from './constants/matchUpActionConstants';
export { matchUpStatusConstants } from './constants/matchUpStatusConstants';
export { matchUpTypes } from './constants/matchUpTypes';
export {
  participantConstants,
  ParticipantTypeEnum,
  SignedInStatusEnum,
} from './constants/participantConstants';
export { penaltyConstants } from './constants/penaltyConstants';
export { policyConstants } from './constants/policyConstants';
export { positionActionConstants } from './constants/positionActionConstants';
export { resultConstants } from './constants/resultConstants';
export { scaleConstants } from './constants/scaleConstants';
export { surfaceConstants } from './constants/surfaceConstants';
export { timeItemConstants } from './constants/timeItemConstants';
export { venueConstants } from './constants/venueConstants';
// END: constants ---------------------------------------------------------------

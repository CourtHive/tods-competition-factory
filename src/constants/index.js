import { auditConstants } from './auditConstants';
import { drawDefinitionConstants } from './drawDefinitionConstants';
import { entryStatusConstants } from './entryStatusConstants';
import { errorConditionConstants } from './errorConditionConstants';
import { eventConstants } from './eventConstants';
import { extensionConstants } from './extensionConstants';
import { flightConstants } from './flightConstants';
import { genderConstants } from './genderConstants';
import { keyValueConstants } from '../matchUpEngine/governors/scoreGovernor/keyValueScore/constants';
import { matchUpActionConstants } from './matchUpActionConstants';
import { matchUpTypes } from './matchUpTypes';
import { participantConstants, participantTypes } from './participantConstants';
import { participantRoles } from './participantRoles';
import { penaltyConstants } from './penaltyConstants';
import { policyConstants } from './policyConstants';
import { positionActionConstants } from './positionActionConstants';
import { ratingConstants } from './ratingConstants';
import { requestConstants } from './requestConstants';
import { resultConstants } from './resultConstants';
import { scaleConstants } from './scaleConstants';
import { scheduleConstants } from './scheduleConstants';
import { sortingConstants } from './sortingConstants';
import { surfaceConstants } from './surfaceConstants';
import { tieFormatConstants } from './tieFormatConstants';
import { timeItemConstants } from './timeItemConstants';
import { topicConstants } from './topicConstants';
import { venueConstants } from './venueConstants';

import {
  activeMatchUpStatuses,
  completedMatchUpStatuses,
  directingMatchUpStatuses,
  matchUpStatusConstants,
  nonDirectingMatchUpStatuses,
  particicipantsRequiredMatchUpStatuses,
  recoveryTimeRequiredMatchUpStatuses,
  upcomingMatchUpStatuses,
  validMatchUpStatuses,
} from './matchUpStatusConstants';

export const factoryConstants = {
  activeMatchUpStatuses,
  auditConstants,
  completedMatchUpStatuses,
  directingMatchUpStatuses,
  drawDefinitionConstants,
  entryStatusConstants,
  errorConditionConstants,
  eventConstants,
  extensionConstants,
  flightConstants,
  genderConstants,
  keyValueConstants,
  matchUpActionConstants,
  matchUpStatusConstants,
  matchUpTypes,
  nonDirectingMatchUpStatuses,
  participantConstants,
  participantRoles,
  particicipantsRequiredMatchUpStatuses,
  participantTypes,
  penaltyConstants,
  policyConstants,
  positionActionConstants,
  ratingConstants,
  recoveryTimeRequiredMatchUpStatuses,
  requestConstants,
  resultConstants,
  scaleConstants,
  scheduleConstants,
  sortingConstants,
  surfaceConstants,
  tieFormatConstants,
  timeItemConstants,
  topicConstants,
  upcomingMatchUpStatuses,
  validMatchUpStatuses,
  venueConstants,
};

export default factoryConstants;

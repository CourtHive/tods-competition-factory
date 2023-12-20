import { addParticipant } from '../../../tournamentEngine/governors/participantGovernor/addParticipants';
import { bulkScheduleMatchUps } from '../scheduleGovernor/bulkScheduleMatchUps';
import { bulkMatchUpStatusUpdate, setMatchUpStatus } from './setMatchUpStatus';
import { courtGridRows } from '../../generators/courtGridRows';
import {
  getCompetitionParticipants,
  publicFindParticipant,
} from '../../getters/participantGetter';
import {
  getLinkedTournamentIds,
  linkTournaments,
  unlinkTournament,
  unlinkTournaments,
} from './tournamentLinks';

import {
  modifyPenalty,
  removePenalty,
} from '../../../mutate/participants/participantPenalties';
import { addPenalty, getCompetitionPenalties } from './participantPenalties';

import { orderCollectionDefinitions } from './orderCollectionDefinitions';
import { removeCollectionDefinition } from './removeCollectionDefinition';
import { removeCollectionGroup } from './removeCollectionGroup';
import { addCollectionGroup } from './addCollectionGroup';
import { modifyTieFormat } from './modifyTieFormat';
import { resetScorecard } from './resetScorecard';
import { resetTieFormat } from './resetTieFormat';
import { addExtension } from '../../../mutate/extensions/addExtension';
import { removeExtension } from '../../../mutate/extensions/removeExtension';
import { findExtension } from '../../../acquire/findExtension';
import { addEventExtension } from '../../../mutate/extensions/addRemoveExtensions';
import { modifyCollectionDefinition } from '../../../matchUpEngine/governors/tieFormatGovernor/modifyCollectionDefinition';
import { addCollectionDefinition } from '../../../mutate/tieFormat/addCollectionDefinition';

const competitionGovernor = {
  modifyCollectionDefinition,
  removeCollectionDefinition,
  orderCollectionDefinitions,
  addCollectionDefinition,
  removeCollectionGroup,
  addCollectionGroup,
  modifyTieFormat,
  resetScorecard,
  resetTieFormat,

  addExtension,
  findExtension,
  removeExtension,
  addEventExtension,

  linkTournaments,
  unlinkTournament,
  unlinkTournaments,
  getLinkedTournamentIds,

  getCompetitionParticipants,
  addParticipant,
  courtGridRows,

  setMatchUpStatus,
  bulkMatchUpStatusUpdate,

  bulkScheduleMatchUps,

  addPenalty, // test
  removePenalty, // test
  modifyPenalty, // test
  getCompetitionPenalties, // test
  findParticipant: publicFindParticipant,
};

export default competitionGovernor;

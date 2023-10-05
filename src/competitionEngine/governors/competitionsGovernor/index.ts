import { bulkScheduleMatchUps } from '../scheduleGovernor/bulkScheduleMatchUps';
import { bulkMatchUpStatusUpdate, setMatchUpStatus } from './setMatchUpStatus';
import { courtGridRows } from '../../generators/courtGridRows';
import { addDrawDefinition } from './addDrawDefinition';
import { addParticipant } from './addParticipant';
import {
  getCompetitionParticipants,
  publicFindParticipant,
  getParticipants,
} from '../../getters/participantGetter';
import {
  addEventExtension,
  addExtension,
  findExtension,
  removeExtension,
} from './competitionExtentions';
import {
  getLinkedTournamentIds,
  linkTournaments,
  unlinkTournament,
  unlinkTournaments,
} from './tournamentLinks';
import {
  addPenalty,
  removePenalty,
  modifyPenalty,
  getCompetitionPenalties,
} from './participantPenalties';

import { modifyCollectionDefinition } from './modifyCollectionDefinition';
import { orderCollectionDefinitions } from './orderCollectionDefinitions';
import { removeCollectionDefinition } from './removeCollectionDefinition';
import { addCollectionDefinition } from './addCollectionDefinition';
import { removeCollectionGroup } from './removeCollectionGroup';
import { addCollectionGroup } from './addCollectionGroup';
import { modifyTieFormat } from './modifyTieFormat';
import { resetScorecard } from './resetScorecard';
import { resetTieFormat } from './resetTieFormat';

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

  addDrawDefinition, // test
  getCompetitionParticipants,
  getParticipants,
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

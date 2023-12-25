import { addParticipant } from '../../../mutate/participants/addParticipants';
import { bulkScheduleMatchUps } from '../../../mutate/matchUps/schedule/bulkScheduleMatchUps';
import { courtGridRows } from '../../generators/scheduling/courtGridRows';
import { publicFindParticipant } from '../../../acquire/publicFindParticipant';
import { getCompetitionParticipants } from '../../../query/participants/getCompetitionParticipants';
import {
  linkTournaments,
  unlinkTournament,
  unlinkTournaments,
} from '../../../mutate/tournaments/tournamentLinks';

import {
  addPenalty,
  getCompetitionPenalties,
  modifyPenalty,
  removePenalty,
} from '../../../mutate/participants/penalties/participantPenalties';

import { addExtension } from '../../../mutate/extensions/addExtension';
import { removeExtension } from '../../../mutate/extensions/removeExtension';
import { findExtension } from '../../../acquire/findExtension';
import { addEventExtension } from '../../../mutate/extensions/addRemoveExtensions';
import { modifyCollectionDefinition } from '../../../matchUpEngine/governors/tieFormatGovernor/modifyCollectionDefinition';
import { addCollectionDefinition } from '../../../mutate/tieFormat/addCollectionDefinition';
import { orderCollectionDefinitions } from '../../../mutate/tieFormat/orderCollectionDefinitions';
import { removeCollectionDefinition } from '../../../mutate/tieFormat/removeCollectionDefinition';
import { removeCollectionGroup } from '../../../matchUpEngine/governors/tieFormatGovernor/removeCollectionGroup';
import { addCollectionGroup } from '../../../matchUpEngine/governors/tieFormatGovernor/addCollectionGroup';
import { modifyTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/modifyTieFormat';
import { resetTieFormat } from '../../../mutate/tieFormat/resetTieFormat';
import { resetScorecard } from '../../../mutate/matchUps/resetScorecard';
import { getLinkedTournamentIds } from '../../../query/tournaments/getLinkedTournamentIds';
import { bulkMatchUpStatusUpdate } from '../../../mutate/events/bulkMatchUpStatusUpdate';
import { setMatchUpStatus } from '../../../mutate/matchUps/matchUpStatus/setMatchUpStatus';

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

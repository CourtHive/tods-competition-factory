import { assignMatchUpSideParticipant } from '../../../mutate/matchUps/drawPositions/assignMatchUpSideParticipant';
import { toggleParticipantCheckInState } from '../../../mutate/matchUps/timeItems/toggleParticipantCheckInState';
import { replaceTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/replaceTieMatchUpParticipant';
import { assignTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/assignTieMatchUpParticipant';
import { removeTieMatchUpParticipantId } from '../../../mutate/matchUps/lineUps/removeTieMatchUpParticipant';
import { removeMatchUpSideParticipant } from '../../../mutate/matchUps/sides/removeMatchUpSideParticipant';
import { enableTieAutoCalc } from '../../../mutate/drawDefinitions/matchUpGovernor/enableTieAutoCalc';
import { removeDelegatedOutcome } from '../../../mutate/matchUps/extensions/removeDelegatedOutcome';
import { substituteParticipant } from '../../../mutate/drawDefinitions/substituteParticipant';
import { checkOutParticipant } from '../../../mutate/matchUps/timeItems/checkOutParticipant';
import { disableTieAutoCalc } from '../../../mutate/matchUps/extensions/disableTieAutoCalc';
import { setMatchUpFormat } from '../../../mutate/matchUps/matchUpFormat/setMatchUpFormat';
import { checkInParticipant } from '../../../mutate/matchUps/timeItems/checkInParticipant';
import { resetMatchUpLineUps } from '../../../mutate/matchUps/lineUps/resetMatchUpLineUps';
import { setMatchUpStatus } from '../../../mutate/matchUps/matchUpStatus/setMatchUpStatus';
import { bulkMatchUpStatusUpdate } from '../../../mutate/events/bulkMatchUpStatusUpdate';
import { setDelegatedOutcome } from '../../../mutate/drawDefinitions/setDelegatedOutcome';
import { updateTieMatchUpScore } from '../../../mutate/matchUps/score/tieMatchUpScore';
import { setOrderOfFinish } from '../../../mutate/drawDefinitions/setOrderOfFinish';
import { applyLineUps } from '../../../mutate/matchUps/lineUps/applyLineUps';
import { resetTieFormat } from '../../../mutate/tieFormat/resetTieFormat';
import { resetScorecard } from '../../../mutate/matchUps/resetScorecard';
import { publicFindMatchUp } from 'acquire/findMatchUp';

export const matchUpGovernor = {
  applyLineUps,
  assignMatchUpSideParticipant,
  assignTieMatchUpParticipantId,
  bulkMatchUpStatusUpdate,
  checkInParticipant,
  checkOutParticipant,
  disableTieAutoCalc,
  enableTieAutoCalc,
  findMatchUp: publicFindMatchUp,
  removeDelegatedOutcome,
  removeMatchUpSideParticipant,
  removeTieMatchUpParticipantId,
  replaceTieMatchUpParticipantId,
  resetMatchUpLineUps,
  resetScorecard,
  resetTieFormat, // perhaps this should not be public
  setDelegatedOutcome,
  setMatchUpFormat,
  setMatchUpStatus,
  setOrderOfFinish,
  substituteParticipant,
  toggleParticipantCheckInState,
  updateTieMatchUpScore,
};

export default matchUpGovernor;

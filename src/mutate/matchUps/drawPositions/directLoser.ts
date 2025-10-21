import { findStructure } from '@Acquire/findStructure';
import { decorateResult } from '@Functions/global/decorateResult';
import { pushGlobalLog } from '@Functions/global/globalLog';
import { assignSeed } from '@Mutate/drawDefinitions/entryGovernor/seedAssignment';
import { removeLineUpSubstitutions } from '@Mutate/drawDefinitions/removeLineUpSubstitutions';
import { assignDrawPositionBye } from '@Mutate/matchUps/drawPositions/assignDrawPositionBye';
import { assignDrawPosition } from '@Mutate/matchUps/drawPositions/positionAssignment';
import { modifyMatchUpNotice } from '@Mutate/notifications/drawNotifications';
import { structureAssignedDrawPositions } from '@Query/drawDefinition/positionsGetter';
import { checkScoreHasValue } from '@Query/matchUp/checkScoreHasValue';
import { getAllDrawMatchUps } from '@Query/matchUps/drawMatchUps';
import { getAllStructureMatchUps } from '@Query/matchUps/getAllStructureMatchUps';
import { numericSort } from '@Tools/sorting';
import { setMatchUpState } from '../matchUpStatus/setMatchUpState';

// constants
import { FIRST_MATCHUP } from '@Constants/drawDefinitionConstants';
import {
  DRAW_POSITION_OCCUPIED,
  INVALID_DRAW_POSITION,
  MISSING_MATCHUP,
  MISSING_PARTICIPANT_ID,
} from '@Constants/errorConditionConstants';
import { DEFAULTED, DOUBLE_WALKOVER, RETIRED, WALKOVER } from '@Constants/matchUpStatusConstants';
import { SUCCESS } from '@Constants/resultConstants';

/*
  FIRST_MATCH_LOSER_CONSOLATION linkCondition... check whether it is a participant's first 
*/
export function directLoser(params) {
  const {
    loserMatchUpDrawPositionIndex,
    sourceMatchUpStatusCodes,
    inContextDrawMatchUps,
    projectedWinningSide,
    propagateExitStatus,
    sourceMatchUpStatus,
    loserDrawPosition,
    tournamentRecord,
    loserTargetLink,
    drawDefinition,
    loserMatchUp,
    dualMatchUp,
    matchUpsMap,
    event,
  } = params;

  const stack = 'directLoser';
  const loserLinkCondition = loserTargetLink.linkCondition;
  const targetMatchUpDrawPositions = loserMatchUp.drawPositions || [];

  const fedDrawPositionFMLC =
    loserLinkCondition === FIRST_MATCHUP &&
    loserMatchUp.roundNumber === 2 &&
    Math.min(...targetMatchUpDrawPositions.filter(Boolean));

  const targetMatchUpDrawPosition = fedDrawPositionFMLC || targetMatchUpDrawPositions[loserMatchUpDrawPositionIndex];
  const loserBackdrawPosition = fedDrawPositionFMLC || targetMatchUpDrawPositions[1 - loserMatchUpDrawPositionIndex];

  const sourceStructureId = loserTargetLink.source.structureId;
  const { structure } = findStructure({
    structureId: sourceStructureId,
    drawDefinition,
  });
  const { matchUps: sourceMatchUps } = getAllStructureMatchUps({
    afterRecoveryTimes: false,
    inContext: true,
    drawDefinition,
    structure,
    event,
  });

  const drawPositionMatchUps = sourceMatchUps.filter((matchUp) => matchUp.drawPositions?.includes(loserDrawPosition));

  // in this calculation BYEs and WALKOVERs are not counted as wins
  // as well as DEFAULTED when there is no score component
  const loserDrawPositionWins = drawPositionMatchUps.filter((matchUp) => {
    const drawPositionSide = matchUp.sides.find((side) => side.drawPosition === loserDrawPosition);
    const unscoredOutcome =
      matchUp.matchUpStatus === WALKOVER || (matchUp.matchUpStatus === DEFAULTED && !checkScoreHasValue(matchUp));
    return drawPositionSide?.sideNumber === matchUp.winningSide && !unscoredOutcome;
  });

  const validForConsolation = loserLinkCondition === FIRST_MATCHUP && loserDrawPositionWins.length === 0;

  const { positionAssignments: sourcePositionAssignments } = structureAssignedDrawPositions({
    structureId: sourceStructureId,
    drawDefinition,
  });

  const relevantAssignment = sourcePositionAssignments?.find(
    (assignment) => assignment.drawPosition === loserDrawPosition,
  );
  const loserParticipantId = relevantAssignment?.participantId;

  const targetStructureId = loserTargetLink.target.structureId;
  const { positionAssignments: targetPositionAssignments } = structureAssignedDrawPositions({
    structureId: targetStructureId,
    drawDefinition,
  });

  const targetMatchUpPositionAssignments = targetPositionAssignments?.filter(({ drawPosition }) =>
    targetMatchUpDrawPositions.includes(drawPosition),
  );

  const loserAlreadyDirected = targetMatchUpPositionAssignments?.some(
    (assignment) => assignment.participantId && loserParticipantId && assignment.participantId === loserParticipantId,
  );

  const validExitToPropagate =
    propagateExitStatus && [RETIRED, WALKOVER, DEFAULTED].includes(sourceMatchUpStatus || '');

  pushGlobalLog({
    matchUpStatus: sourceMatchUpStatus,
    matchUpId: loserMatchUp?.matchUpId,
    loserAlreadyDirected,
    validExitToPropagate,
    sourceStructureId,
    targetStructureId,
    loserDrawPosition,
    color: 'brightred',
    method: stack,
  });

  if (loserAlreadyDirected) {
    return { ...SUCCESS, stack };
  }

  const unfilledTargetMatchUpDrawPositions = targetMatchUpPositionAssignments
    ?.filter((assignment) => {
      const inTarget = targetMatchUpDrawPositions.includes(assignment.drawPosition);
      const unfilled = !assignment.participantId && !assignment.bye && !assignment.qualifier;
      return inTarget && unfilled;
    })
    .map((assignment) => assignment.drawPosition);

  const targetDrawPositionIsUnfilled = unfilledTargetMatchUpDrawPositions?.includes(targetMatchUpDrawPosition);
  const isFeedRound = loserTargetLink.target.roundNumber > 1 && unfilledTargetMatchUpDrawPositions?.length;
  const isFirstRoundValidDrawPosition = loserTargetLink.target.roundNumber === 1 && targetDrawPositionIsUnfilled;

  pushGlobalLog({
    matchUpStatus: sourceMatchUpStatus,
    matchUpId: loserMatchUp?.matchUpId,
    isFirstRoundValidDrawPosition,
    validExitToPropagate,
    color: 'brightred',
    method: stack,
    isFeedRound,
  });

  if (fedDrawPositionFMLC) {
    const result = loserLinkFedFMLC();
    if (result.error) return decorateResult({ result, stack });
  } else if (isFirstRoundValidDrawPosition) {
    const result = asssignLoserDrawPosition();
    if (result.error) return decorateResult({ result, stack });
  } else if (loserParticipantId && isFeedRound) {
    // if target.roundNumber > 1 then it is a feed round and should always take the lower drawPosition
    unfilledTargetMatchUpDrawPositions.sort(numericSort);
    const fedDrawPosition = unfilledTargetMatchUpDrawPositions[0];
    const result = assignDrawPosition({
      participantId: loserParticipantId,
      structureId: targetStructureId,
      drawPosition: fedDrawPosition,
      inContextDrawMatchUps,
      sourceMatchUpStatus,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
      event,
    });
    if (result.error) return decorateResult({ result, stack });
    // if validExitToPropagate is true get the matchUpId of the targetMatchUp and set its status to the sourceMatchUpStatus
    if (!result.error && validExitToPropagate && propagateExitStatus) return progressExitStatus();
  } else {
    const error = !targetDrawPositionIsUnfilled ? DRAW_POSITION_OCCUPIED : INVALID_DRAW_POSITION;
    return decorateResult({
      context: { loserDrawPosition, loserTargetLink, targetDrawPositionIsUnfilled },
      result: { error },
      stack,
    });
  }

  if (structure?.seedAssignments && structure.structureId !== targetStructureId) {
    const seedAssignment = structure.seedAssignments.find(({ participantId }) => participantId === loserParticipantId);
    const participantId = seedAssignment?.participantId;
    if (seedAssignment && participantId) {
      assignSeed({
        eventId: loserMatchUp?.eventId,
        structureId: targetStructureId,
        ...seedAssignment,
        tournamentRecord,
        drawDefinition,
        participantId,
      });
    }
  }

  if (dualMatchUp && projectedWinningSide) {
    // propagated lineUp
    const side = dualMatchUp.sides?.find((side) => side.sideNumber === 3 - projectedWinningSide);
    if (side?.lineUp) {
      const { roundNumber, eventId } = loserMatchUp;
      const { roundPosition } = dualMatchUp;
      // for matchUps fed to different structures, sideNumber is always 1 when roundNumber > 1 (fed position)
      // when roundNumber === 1 then it is even/odd calculated as remainder of roundPositon % 2 + 1
      const targetSideNumber = roundNumber === 1 ? 2 - (roundPosition % 2) : 1;

      const targetMatchUp = matchUpsMap?.drawMatchUps?.find(({ matchUpId }) => matchUpId === loserMatchUp.matchUpId);

      const updatedSides = [1, 2].map((sideNumber) => {
        const existingSide = targetMatchUp.sides?.find((side) => side.sideNumber === sideNumber) || {};
        return { ...existingSide, sideNumber };
      });

      targetMatchUp.sides = updatedSides;
      const targetSide = targetMatchUp.sides.find((side) => side.sideNumber === targetSideNumber);

      // attach to appropriate side of winnerMatchUp
      if (targetSide) {
        targetSide.lineUp = removeLineUpSubstitutions({ lineUp: side.lineUp });

        modifyMatchUpNotice({
          tournamentId: tournamentRecord?.tournamentId,
          matchUp: targetMatchUp,
          context: stack,
          drawDefinition,
          eventId,
        });
      }
    }
  }

  return { ...SUCCESS, stack };

  function loserLinkFedFMLC() {
    const stack = 'loserLinkFedFMLC';
    if (validForConsolation) {
      return decorateResult({ result: asssignLoserDrawPosition(), stack });
    } else {
      return decorateResult({ result: assignLoserPositionBye(), stack });
    }
  }

  function assignLoserPositionBye() {
    const result = assignDrawPositionBye({
      drawPosition: loserBackdrawPosition,
      structureId: targetStructureId,
      tournamentRecord,
      drawDefinition,
      event,
    });
    return decorateResult({ result, stack: 'assignLoserPositionBye' });
  }

  function asssignLoserDrawPosition() {
    const result = loserParticipantId
      ? assignDrawPosition({
          drawPosition: targetMatchUpDrawPosition,
          participantId: loserParticipantId,
          structureId: targetStructureId,
          inContextDrawMatchUps,
          sourceMatchUpStatus,
          tournamentRecord,
          drawDefinition,
          matchUpsMap,
          event,
        })
      : { error: MISSING_PARTICIPANT_ID };

    // if propagateExitStatus is true get the matchUpId of the targetMatchUp and set its status to the sourceMatchUpStatus
    if (!result.error && validExitToPropagate && propagateExitStatus) return progressExitStatus();

    return decorateResult({ result, stack: 'assignLoserDrawPosition' });
  }

  function progressExitStatus() {
    const stack = 'progressExitStatus';

    pushGlobalLog({
      matchUpId: loserMatchUp?.matchUpId,
      matchUpStatus: sourceMatchUpStatus,
      color: 'magenta',
      method: stack,
    });

    // RETIRED should not be propagated as an exit status
    const carryOverMatchUpStatus =
      ([WALKOVER, DEFAULTED].includes(sourceMatchUpStatus) && sourceMatchUpStatus) || WALKOVER;
    //get the updated in context match ups so we have all the sides info
    const inContextMatchUps = getAllDrawMatchUps({
      inContext: true,
      drawDefinition,
      matchUpsMap,
    })?.matchUps;
    let loserMatchUpStatus = carryOverMatchUpStatus;
    //find the updated loser match up
    const updatedLoserMatchUp = inContextMatchUps?.find((m) => m.matchUpId === loserMatchUp?.matchUpId);
    if (updatedLoserMatchUp?.matchUpId && loserMatchUpStatus) {
      let winningSide: number | undefined = undefined;
      //get rid of the double walkover special status codes
      //and replace them with simple string ones
      //it's a bit of a broad check but I think only double WO will set status codes as objects
      const statusCodes: string[] =
        updatedLoserMatchUp.matchUpStatusCodes?.map((sc) => (typeof sc === 'string' ? sc : 'WO')) ?? [];
      //find the loser participant side in the loser match up
      const loserParticipantSide = updatedLoserMatchUp.sides?.find((s) => s.participantId === loserParticipantId);
      //set the original status code to the correct side in the loser match
      if (loserParticipantSide?.sideNumber) {
        //find out how many assigned participants are already in the loser match up
        const participantsCount = updatedLoserMatchUp?.sides?.reduce((count, current) => {
          return current?.participantId ? count + 1 : count;
        }, 0);

        //if only one participant we need to bring over the status code and
        //set it as the only one, and assign the empty side as the winner.
        //We also consider outcomes from a double walkover in the main draw, which
        //will not bring over a participant but it will bring over the status code.
        //So we make sure there is only one participant and no existing status codes, otherwise
        //it should be set as a double walkover.
        if (participantsCount === 1 && statusCodes.length === 0) {
          winningSide = loserParticipantSide.sideNumber === 1 ? 2 : 1;
          //set the original status code from the original status codes
          //this is flawed a bit, or at least the TDesk ui, as even if there are two participants
          //for a WO/DEFAULT, the status code is always the first element.
          statusCodes[0] = sourceMatchUpStatusCodes[0];
        } else {
          //there was already a participant in the loser matchup
          //if the loser match is not already a WO or DEFAULT
          if (![WALKOVER, DEFAULTED].includes(loserMatchUp.matchUpStatus)) {
            //let's set the opponent as the winner
            winningSide = loserParticipantSide.sideNumber === 1 ? 2 : 1;
          } else {
            //both participants are either WO or DEFAULT

            //workaround for status codes
            const currentStatusCode = statusCodes[0];
            //set the original status code to the correct participant in the loser match up
            statusCodes[loserParticipantSide.sideNumber - 1] = sourceMatchUpStatusCodes[0];
            const otherSide = loserParticipantSide.sideNumber === 1 ? 2 : 1;
            statusCodes[otherSide - 1] = currentStatusCode;

            loserMatchUpStatus = DOUBLE_WALKOVER;
            winningSide = undefined;
          }
        }
      }

      const result = setMatchUpState({
        matchUpStatus: loserMatchUpStatus,
        matchUpId: loserMatchUp.matchUpId,
        matchUpStatusCodes: statusCodes,
        allowChangePropagation: true,
        allowSingleParticipantWO: true,
        propagateExitStatus: false,
        tournamentRecord,
        drawDefinition,
        winningSide,
        event,
      });
      return decorateResult({ result, stack });
    }

    return decorateResult({ result: { error: MISSING_MATCHUP }, stack });
  }
}

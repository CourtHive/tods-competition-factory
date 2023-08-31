import { removeLineUpSubstitutions } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/removeLineUpSubstitutions';
import { assignDrawPositionBye } from '../positionGovernor/byePositioning/assignDrawPositionBye';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { assignDrawPosition } from '../positionGovernor/positionAssignment';
import { decorateResult } from '../../../global/functions/decorateResult';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { assignSeed } from '../entryGovernor/seedAssignment';
import { findStructure } from '../../getters/findStructure';
import { numericSort } from '../../../utilities';

import {
  INVALID_DRAW_POSITION,
  MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';
import { DEFAULTED, WALKOVER } from '../../../constants/matchUpStatusConstants';
import { FIRST_MATCHUP } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/*
  FIRST_MATCH_LOSER_CONSOLATION linkCondition... check whether it is a participant's first 
*/
export function directLoser(params) {
  const {
    loserMatchUpDrawPositionIndex,
    inContextDrawMatchUps,
    projectedWinningSide,
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

  const targetMatchUpDrawPosition =
    fedDrawPositionFMLC ||
    targetMatchUpDrawPositions[loserMatchUpDrawPositionIndex];
  const loserBackdrawPosition =
    fedDrawPositionFMLC ||
    targetMatchUpDrawPositions[1 - loserMatchUpDrawPositionIndex];

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

  const drawPositionMatchUps = sourceMatchUps.filter(
    (matchUp) => matchUp.drawPositions?.includes(loserDrawPosition)
  );

  // in this calculation BYEs and WALKOVERs are not counted as wins
  // as well as DEFAULTED when there is no score component
  const loserDrawPositionWins = drawPositionMatchUps.filter((matchUp) => {
    const drawPositionSide = matchUp.sides.find(
      (side) => side.drawPosition === loserDrawPosition
    );
    const unscoredOutcome =
      matchUp.matchUpStatus === WALKOVER ||
      (matchUp.matchUpStatus === DEFAULTED && !scoreHasValue(matchUp));
    return (
      drawPositionSide?.sideNumber === matchUp.winningSide && !unscoredOutcome
    );
  });

  const validForConsolation =
    loserLinkCondition === FIRST_MATCHUP && loserDrawPositionWins.length === 0;

  const { positionAssignments: sourcePositionAssignments } =
    structureAssignedDrawPositions({
      structureId: sourceStructureId,
      drawDefinition,
    });

  const relevantAssignment = sourcePositionAssignments?.find(
    (assignment) => assignment.drawPosition === loserDrawPosition
  );
  const loserParticipantId = relevantAssignment?.participantId;

  const targetStructureId = loserTargetLink.target.structureId;
  const { positionAssignments: targetPositionAssignments } =
    structureAssignedDrawPositions({
      structureId: targetStructureId,
      drawDefinition,
    });

  const targetMatchUpPositionAssignments = targetPositionAssignments?.filter(
    ({ drawPosition }) => targetMatchUpDrawPositions.includes(drawPosition)
  );

  const loserAlreadyDirected = targetMatchUpPositionAssignments?.some(
    (assignment) => assignment.participantId === loserParticipantId
  );

  if (loserAlreadyDirected) {
    return { ...SUCCESS };
  }

  const unfilledTargetMatchUpDrawPositions = targetMatchUpPositionAssignments
    ?.filter((assignment) => {
      const inTarget = targetMatchUpDrawPositions.includes(
        assignment.drawPosition
      );
      const unfilled =
        !assignment.participantId && !assignment.bye && !assignment.qualifier;
      return inTarget && unfilled;
    })
    .map((assignment) => assignment.drawPosition);

  const targetDrawPositionIsUnfilled =
    unfilledTargetMatchUpDrawPositions?.includes(targetMatchUpDrawPosition);

  const isFeedRound =
    loserTargetLink.target.roundNumber > 1 &&
    unfilledTargetMatchUpDrawPositions?.length;

  const isFirstRoundValidDrawPosition =
    loserTargetLink.target.roundNumber === 1 && targetDrawPositionIsUnfilled;

  if (fedDrawPositionFMLC) {
    const result = loserLinkFedFMLC();
    if (result.error) return decorateResult({ result, stack });
  } else if (isFirstRoundValidDrawPosition) {
    const result = asssignLoserDrawPosition();
    if (result.error) return decorateResult({ result, stack });
  } else if (loserParticipantId && isFeedRound) {
    // if target.roundNumber > 1 then it is a feed round and should always take the lower drawPosition
    const fedDrawPosition =
      unfilledTargetMatchUpDrawPositions.sort(numericSort)[0];
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
  } else {
    return decorateResult({
      result: { error: INVALID_DRAW_POSITION },
      context: { loserDrawPosition, loserTargetLink },
      stack,
    });
  }

  if (
    structure?.seedAssignments &&
    structure.structureId !== targetStructureId
  ) {
    const seedAssignment = structure.seedAssignments.find(
      ({ participantId }) => participantId === loserParticipantId
    );
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
    const side = dualMatchUp.sides?.find(
      (side) => side.sideNumber === 3 - projectedWinningSide
    );
    if (side?.lineUp) {
      const { roundNumber, eventId } = loserMatchUp;
      const { roundPosition } = dualMatchUp;
      // for matchUps fed to different structures, sideNumber is always 1 when roundNumber > 1 (fed position)
      // when roundNumber === 1 then it is even/odd calculated as remainder of roundPositon % 2 + 1
      const targetSideNumber = roundNumber === 1 ? 2 - (roundPosition % 2) : 1;

      const targetMatchUp = matchUpsMap?.drawMatchUps?.find(
        ({ matchUpId }) => matchUpId === loserMatchUp.matchUpId
      );

      const updatedSides = [1, 2].map((sideNumber) => {
        const existingSide =
          targetMatchUp.sides?.find((side) => side.sideNumber === sideNumber) ||
          {};
        return { ...existingSide, sideNumber };
      });

      targetMatchUp.sides = updatedSides;
      const targetSide = targetMatchUp.sides.find(
        (side) => side.sideNumber === targetSideNumber
      );

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

  return { ...SUCCESS };

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

    return decorateResult({ result, stack: 'assignLoserDrawPosition' });
  }
}

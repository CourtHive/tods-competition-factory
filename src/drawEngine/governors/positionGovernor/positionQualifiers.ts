import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getQualifiersCount } from '../../getters/getQualifiersCount';
import { generateRange, randomPop } from '../../../utilities';
import { findStructure } from '../../getters/findStructure';
import { ensureInt } from '../../../utilities/ensureInt';

import { CONSOLATION } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_STAGE,
  NO_DRAW_POSITIONS_AVAILABLE_FOR_QUALIFIERS,
} from '../../../constants/errorConditionConstants';

export function positionQualifiers(params) {
  const structure = params.structure ?? findStructure(params).structure;

  const stack = 'positionQualifiers';
  const qualifierDrawPositions: number[] = [];

  if (structure.stage === CONSOLATION) {
    return decorateResult({ result: { error: INVALID_STAGE }, stack });
  }

  const {
    unplacedRoundQualifierCounts,
    positionAssignments,
    roundDrawPositions,
  } = getQualifiersData(params);

  for (const roundNumber of Object.keys(unplacedRoundQualifierCounts)) {
    const unfilledDrawPositions = positionAssignments
      ?.filter((assignment) => {
        return (
          roundDrawPositions[roundNumber].includes(assignment.drawPosition) &&
          !assignment.participantId &&
          !assignment.qualifier &&
          !assignment.bye
        );
      })
      .map((assignment) => assignment.drawPosition);

    if (
      unplacedRoundQualifierCounts[roundNumber] > (unfilledDrawPositions || 0)
    )
      return decorateResult({
        result: { error: NO_DRAW_POSITIONS_AVAILABLE_FOR_QUALIFIERS },
        context: { unfilledDrawPositions },
        stack,
      });

    generateRange(0, unplacedRoundQualifierCounts[roundNumber]).forEach(() => {
      const drawPosition = randomPop(unfilledDrawPositions);
      qualifierDrawPositions.push(drawPosition);
      positionAssignments?.forEach((assignment) => {
        if (assignment.drawPosition === drawPosition) {
          assignment.qualifier = true;
          delete assignment.participantId;
          delete assignment.bye;
        }
      });
    });
  }

  return { ...SUCCESS, qualifierDrawPositions };
}

export function getQualifiersData({ drawDefinition, structure, structureId }) {
  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);

  const { positionAssignments } = structureAssignedDrawPositions({ structure });

  const { stage, stageSequence } = structure;

  const { qualifiersCount, roundQualifiersCounts } = getQualifiersCount({
    drawDefinition,
    stageSequence,
    structureId,
    stage,
  });

  // now figure out which drawPositions are in which rounds
  const trn = roundQualifiersCounts ? Object.keys(roundQualifiersCounts) : [];
  const targetRoundNumbers = trn.map((n) => ensureInt(n));
  const { matchUps } = getAllStructureMatchUps({ structure });
  const { roundProfile } = getRoundMatchUps({ matchUps });
  const roundDrawPositions = Object.assign(
    {},
    ...targetRoundNumbers
      .filter((roundNumber) => roundProfile?.[roundNumber])
      .map((roundNumber) => ({
        [roundNumber]:
          roundProfile?.[roundNumber]?.drawPositions?.filter(Boolean) ?? [],
      }))
  );

  const assignedQualifierPositions = positionAssignments
    ?.filter((assignment) => assignment.qualifier)
    .map((assignment) => assignment.drawPosition);

  const unplacedQualifiersCount =
    qualifiersCount - (assignedQualifierPositions?.length ?? 0);
  const placedQualifiersCount = assignedQualifierPositions?.length;

  const unplacedRoundQualifierCounts = Object.assign(
    {},
    ...targetRoundNumbers.map((roundNumber) => {
      const assignedQualifierPositions = positionAssignments
        ?.filter(
          (assignment) =>
            assignment.qualifier &&
            roundDrawPositions[roundNumber]?.drawPositions?.includes(
              assignment.drawPosition
            )
        )
        .map((assignment) => assignment.drawPosition);
      return {
        [roundNumber]:
          (roundQualifiersCounts?.[roundNumber] ?? 0) -
          (assignedQualifierPositions?.length ?? 0),
      };
    })
  );

  return {
    unplacedRoundQualifierCounts,
    unplacedQualifiersCount,
    placedQualifiersCount,
    roundQualifiersCounts,
    positionAssignments,
    roundDrawPositions,
    qualifiersCount,
  };
}

import { getStructureSeedAssignments } from '../../../../query/structure/getStructureSeedAssignments';
import { getAllStructureMatchUps } from '../../../../query/matchUps/getAllStructureMatchUps';
import { getStructurePositionedSeeds } from '../../../../query/structure/getStructurePositionedSeeds';
import { structureAssignedDrawPositions } from '../../../../query/drawDefinition/positionsGetter';
import { getPairedDrawPosition } from '../../../../query/drawDefinition/getPairedDrawPosition';
import { getNumericSeedValue } from '../../../../query/drawDefinition/getNumericSeedValue';
import { chunkArray, generateRange } from '../../../../utilities';
import { verifyDrawHierarchy } from './verifyDrawHierarchy';
import { findStructure } from '../../../../acquire/findStructure';
import { expect } from 'vitest';

import { STRUCTURE_NOT_FOUND } from '../../../../constants/errorConditionConstants';

export function verifyStructure(params) {
  const {
    expectedPositionsAssignedCount,
    expectedQualifierAssignments,
    expectedRoundMatchUpsCounts,
    expectedSeedValuesWithBye,
    expectedByeAssignments,
    expectedSeedsWithByes,
    hierarchyVerification,
    drawDefinition,
    expectedSeeds,
    structureId,
  } = params;
  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });

  const positionsAssignedCount = positionAssignments?.reduce(
    (count, candidate) => {
      return (
        count +
        (candidate.participantId || candidate.bye || candidate.qualifier
          ? 1
          : 0)
      );
    },
    0
  );

  if (expectedPositionsAssignedCount !== undefined) {
    expect(positionsAssignedCount).toEqual(expectedPositionsAssignedCount);
  }

  const byeAssignedDrawPositions = positionAssignments
    ?.filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  const qualifierAssignedDrawPositions = positionAssignments
    ?.filter((assignment) => assignment.qualifier)
    .map((assignment) => assignment.drawPosition);

  if (expectedByeAssignments !== undefined) {
    expect(byeAssignedDrawPositions?.length).toEqual(expectedByeAssignments);
  }

  expect(
    expectedQualifierAssignments && qualifierAssignedDrawPositions?.length
  ).toEqual(expectedQualifierAssignments);

  const seededParticipantIds = seedAssignments
    ?.map((assignment) => assignment.participantId)
    .filter(Boolean);
  const seedAssignedDrawPositions = positionAssignments
    ?.filter(
      (assignment) => seededParticipantIds?.includes(assignment.participantId)
    )
    .map((assignment) => assignment.drawPosition);
  if (expectedSeeds !== undefined)
    expect(seedAssignedDrawPositions?.length).toEqual(expectedSeeds);

  const { matchUps, roundMatchUps } = getAllStructureMatchUps({
    afterRecoveryTimes: false,
    inContext: true,
    structure,
  });
  if (hierarchyVerification)
    verifyDrawHierarchy({ matchUps, hierarchyVerification });
  if (expectedRoundMatchUpsCounts) {
    expectedRoundMatchUpsCounts.forEach((expectation, index) => {
      const roundNumber = index + 1;
      const roundMatchUpsCount = roundMatchUps[roundNumber]?.length || 0;
      expect(roundMatchUpsCount).toEqual(expectation);
    });
  }

  const pairedDrawPositions = matchUps
    .filter((matchUp) => matchUp.roundNumber === 1)
    .map((matchUp) => matchUp.drawPositions);

  const seedPairedDrawPositions = seedAssignedDrawPositions
    ?.map((drawPosition) => {
      const { pairedDrawPosition } = getPairedDrawPosition({
        matchUps,
        drawPosition,
        roundNumber: 1,
      });
      return pairedDrawPosition;
    })
    .filter(Boolean);

  const seedPairedDrawPositionsWithBye = seedPairedDrawPositions?.filter(
    (drawPosition: any) => byeAssignedDrawPositions?.includes(drawPosition)
  );
  if (expectedSeedsWithByes !== undefined) {
    expect(seedPairedDrawPositionsWithBye?.length).toEqual(
      expectedSeedsWithByes
    );
  }

  const positionedSeeds = getStructurePositionedSeeds({
    drawDefinition,
    structure,
  });
  const seedDrawPositionsWithBye = seedPairedDrawPositionsWithBye?.map(
    (drawPosition: any) => {
      const { pairedDrawPosition } = getPairedDrawPosition({
        roundNumber: 1,
        drawPosition,
        matchUps,
      });
      return pairedDrawPosition;
    }
  );

  const seedValuesOfSeedsWithBye: any = positionedSeeds
    ?.filter(
      (assignment: any) =>
        seedDrawPositionsWithBye?.includes(assignment.drawPosition)
    )
    .map((assignment: any) => getNumericSeedValue(assignment.seedValue))
    .sort((a, b) => (a || 0) - (b || 0));

  if (expectedSeedValuesWithBye !== undefined) {
    expect(expectedSeedValuesWithBye).toMatchObject(seedValuesOfSeedsWithBye);
  }

  const drawSize = pairedDrawPositions.length;
  const { filteredQuarters } = verifyByeDistribution({
    drawSize,
    byeAssignedDrawPositions,
  });

  return { byeAssignedDrawPositions, filteredQuarters };
}

function verifyByeDistribution({ drawSize, byeAssignedDrawPositions }) {
  const quarterSize = Math.ceil(drawSize / 4);
  const quarters = chunkArray(generateRange(1, drawSize + 1), quarterSize);
  const filteredQuarters = quarters.map((quarter) =>
    quarter.filter((drawPosition) =>
      byeAssignedDrawPositions.includes(drawPosition)
    )
  );
  const quarterLengths = filteredQuarters.map(
    (filteredQuarter) => filteredQuarter.length
  );
  const maxLength = Math.max(...quarterLengths);
  const minLength = Math.min(...quarterLengths);
  const lengthDifference = maxLength - minLength;
  expect(lengthDifference).toBeLessThanOrEqual(1);
  return { filteredQuarters };
}

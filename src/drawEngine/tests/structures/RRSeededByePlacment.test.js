import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { unique } from '../../../utilities';

import POLICY_SEEDING_BYES from '../../../fixtures/policies/POLICY_SEEDING_BYES';
import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { expect } from 'vitest';

const scenario = [
  {
    seedNumbersWithByes: [1, 2],
    participantsCount: 62,
    expectedByesCount: 2,
    seedsCount: 4,
    drawSize: 64,
  },
  {
    seedNumbersWithByes: [1, 2, 3],
    participantsCount: 61,
    expectedByesCount: 3,
    seedsCount: 4,
    drawSize: 64,
  },
  {
    policyDefinitions: POLICY_SEEDING_BYES,
    participantsCount: 62,
    expectedByesCount: 2,
    seedsCount: 4,
    drawSize: 64,
  },
];

it.each(scenario)(
  'will place BYEs in RR Groups with seeds in seed order',
  (scenario) => {
    const {
      expectedByesCount,
      policyDefinitions,
      participantsCount,
      seedsCount,
      drawSize,
    } = scenario;
    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      policyDefinitions,
      drawProfiles: [
        {
          participantsCount,
          drawType: ROUND_ROBIN,
          seedsCount,
          drawSize,
        },
      ],
    });

    tournamentEngine.setState(tournamentRecord);

    const { drawDefinition } = tournamentEngine.getEvent({ drawId });
    const structure = drawDefinition.structures[0];
    const assignedSeedNumbersCount = structure.seedAssignments.filter(
      ({ participantId }) => participantId
    ).length;
    expect(assignedSeedNumbersCount).toEqual(seedsCount);
    const structureId = structure.structureId;
    const { positionAssignments } = tournamentEngine.getPositionAssignments({
      drawDefinition,
      structureId,
    });
    const assignedPositionsCount = positionAssignments.filter(
      ({ participantId, bye }) => participantId || bye
    ).length;
    expect(assignedPositionsCount).toEqual(drawSize);

    const { matchUps } = tournamentEngine.allTournamentMatchUps();

    const structureMatchUps = matchUps.reduce((structures, matchUp) => {
      const { structureId } = matchUp;
      if (!structures[structureId]) structures[structureId] = [];
      structures[structureId].push(matchUp);
      return structures;
    }, {});

    const groupedMatchUps = Object.values(structureMatchUps);

    const structureIdsWithByes = groupedMatchUps
      .filter((matchUps) =>
        matchUps.some(({ matchUpStatus }) => matchUpStatus === BYE)
      )
      .map((matchUps) => matchUps[0].structureId);
    const structureIdsWithSeeds = groupedMatchUps
      .filter((matchUps) =>
        matchUps.some(({ sides }) => sides.some(({ seedNumber }) => seedNumber))
      )
      .map((matchUps) => matchUps[0].structureId);

    const seedNumbersWithByes = unique(
      structureIdsWithByes
        .map((structureId) =>
          structureMatchUps[structureId]
            .map(
              ({ sides }) =>
                sides.find(({ seedNumber }) => seedNumber)?.seedNumber
            )
            .filter(Boolean)
        )
        .flat()
    );

    expect(structureIdsWithByes.length).toEqual(expectedByesCount);

    const allByeStructuresHaveSeeds = structureIdsWithByes.every(
      (structureId) => structureIdsWithSeeds.includes(structureId)
    );

    if (scenario.seedNumbersWithByes) {
      expect(allByeStructuresHaveSeeds).toEqual(true);
      expect(seedNumbersWithByes).toEqual(scenario.seedNumbersWithByes);
      expect(seedNumbersWithByes.length).toEqual(expectedByesCount);
    } else {
      expect(seedNumbersWithByes.length).not.toEqual(expectedByesCount);
    }
  }
);

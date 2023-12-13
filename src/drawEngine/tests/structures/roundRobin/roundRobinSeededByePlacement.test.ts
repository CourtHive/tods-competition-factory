import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import { unique } from '../../../../utilities';
import { expect, it } from 'vitest';

import POLICY_SEEDING_BYES from '../../../../fixtures/policies/POLICY_SEEDING_BYES';
import { ROUND_ROBIN } from '../../../../constants/drawDefinitionConstants';
import { BYE } from '../../../../constants/matchUpStatusConstants';
import { SEEDING } from '../../../../constants/scaleConstants';
import { SINGLES } from '../../../../constants/eventConstants';

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
      tournamentName: 'Seed Order BYEs',
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
    if (assignedPositionsCount !== drawSize) {
      console.log({ drawSize, assignedPositionsCount });
    } else {
      expect(assignedPositionsCount).toEqual(drawSize);
    }

    const { matchUps } = tournamentEngine.allTournamentMatchUps();

    const structureMatchUps = matchUps.reduce((structures, matchUp) => {
      const { structureId } = matchUp;
      if (!structures[structureId]) structures[structureId] = [];
      structures[structureId].push(matchUp);
      return structures;
    }, {});

    const groupedMatchUps: any[] = Object.values(structureMatchUps);

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

    if (structureIdsWithByes.length !== expectedByesCount) {
      console.log(seedNumbersWithByes);
    } else {
      expect(structureIdsWithByes.length).toEqual(expectedByesCount);
    }

    const allByeStructuresHaveSeeds = structureIdsWithByes.every(
      (structureId) => structureIdsWithSeeds.includes(structureId)
    );

    if (scenario.seedNumbersWithByes) {
      expect(allByeStructuresHaveSeeds).toEqual(true);
      expect(seedNumbersWithByes).toEqual(scenario.seedNumbersWithByes);
      expect(seedNumbersWithByes.length).toEqual(expectedByesCount);
    } else {
      if (seedNumbersWithByes.length === expectedByesCount) {
        console.log('seeds were randomly placed with BYEs');
      } else {
        expect(seedNumbersWithByes.length).not.toEqual(expectedByesCount);
      }
    }
  }
);

const iterativeByePositions: any[] = [];

it.each([1, 2, 3, 4, 5])(
  'can generate ROUND_ROBIN draw which ignores seeded bye placement',
  (iteration) => {
    if (iteration === 5) {
      const uniqueByePositioning = unique(iterativeByePositions);
      expect(uniqueByePositioning.length).toBeGreaterThanOrEqual(1);
    } else {
      const policyDefinitions = POLICY_SEEDING_BYES;
      const ageCategoryCode = 'U18';

      const {
        tournamentRecord,
        eventIds: [eventId],
      } = mocksEngine.generateTournamentRecord({
        eventProfiles: [
          {
            eventName: 'RR Ignore Seeded Byes',
            category: { ageCategoryCode },
          },
        ],
        participantsProfile: { participantsCount: 61 },
        policyDefinitions,
      });

      // reset necessary here to flush previous state
      tournamentEngine.reset().setState(tournamentRecord);

      const { participants } = tournamentEngine.getParticipants();
      const participantIds = participants.map((p) => p.participantId);
      let result = tournamentEngine.addEventEntries({
        participantIds,
        eventId,
      });
      expect(result.success).toEqual(true);

      const scaleValues = [1, 2, 3, 3, 5, 5, 5, 5];
      scaleValues.forEach((scaleValue, index) => {
        const scaleItem = {
          scaleValue,
          scaleName: ageCategoryCode,
          scaleType: SEEDING,
          eventType: SINGLES,
          scaleDate: '2020-06-06',
        };
        const participantId = participantIds[index];
        const result = tournamentEngine.setParticipantScaleItem({
          participantId,
          scaleItem,
        });
        expect(result.success).toEqual(true);
      });

      const seedsCount = 2;
      const drawSize = 64;
      const { drawDefinition } = tournamentEngine.generateDrawDefinition({
        drawType: ROUND_ROBIN,
        policyDefinitions,
        seedsCount,
        drawSize,
        eventId,
      });

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

      if (assignedPositionsCount !== drawSize) {
        console.log({ assignedPositionsCount, seedsCount, drawSize });
        // situation where attempt was made to place two BYES in same RR Bracket, or one participant was not placed
      } else {
        expect(assignedPositionsCount).toEqual(drawSize);

        const byePositionsCount = positionAssignments.filter(
          ({ bye }) => bye
        ).length;
        expect(byePositionsCount).toEqual(3);

        result = tournamentEngine.addDrawDefinition({
          drawDefinition,
          eventId,
        });
        expect(result.success).toEqual(true);

        const { matchUps } = tournamentEngine.allTournamentMatchUps();
        expect(matchUps.length).toEqual(96);

        const byePositions = positionAssignments
          .filter(({ bye }) => bye)
          .map(({ drawPosition }) => drawPosition)
          .join('|');

        iterativeByePositions.push(byePositions);
      }
    }
    console.log({ iterativeByePositions });
  }
);

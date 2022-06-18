import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { unique } from '../../../utilities';

import POLICY_SEEDING_BYES from '../../../fixtures/policies/POLICY_SEEDING_BYES';
import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';

const scenario = [
  {
    seedNumbersWithByes: [1, 2],
    participantsCount: 62,
    seedsCount: 4,
    drawSize: 64,
  },
  /*
  {
    seedNumbersWithByes: [1, 2, 3],
    participantsCount: 61,
    seedsCount: 4,
    drawSize: 64,
  },
  */
  {
    policyDefinitions: POLICY_SEEDING_BYES,
    seedNumbersWithByes: [1, 2],
    participantsCount: 62,
    seedsCount: 4,
    drawSize: 64,
  },
];

it.each(scenario)(
  'will place BYEs in RR Groups with seeds in seed order',
  (scenario) => {
    const { policyDefinitions, participantsCount, seedsCount, drawSize } =
      scenario;
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
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
    console.log(tournamentRecord.extensions?.[0]);

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

    const byeStructuresHaveSeeds = structureIdsWithByes.every((structureId) =>
      structureIdsWithSeeds.includes(structureId)
    );
    expect(byeStructuresHaveSeeds).toEqual(true);

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

    expect(seedNumbersWithByes).toEqual(scenario.seedNumbersWithByes);
  }
);

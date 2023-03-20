import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import {
  COMPLETED,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';

const scenarios = [
  {
    secondRoundDrawPositions: [2],
    secondRoundMatchUpsCount: 4,
    qualifyingRoundNumber: 2,
    matchUpsCount: 12,
    drawSize: 16,
  },
  {
    secondRoundDrawPositions: [2],
    secondRoundMatchUpsCount: 4,
    qualifyingPositions: 4,
    matchUpsCount: 12,
    drawSize: 16,
  },
  {
    secondRoundDrawPositions: [2],
    secondRoundMatchUpsCount: 4,
    qualifyingRoundNumber: 4,
    matchUpsCount: 15,
    drawSize: 16,
  },
  {
    secondRoundDrawPositions: [2],
    secondRoundMatchUpsCount: 4,
    qualifyingPositions: 1,
    matchUpsCount: 15,
    drawSize: 16,
  },
  {
    secondRoundMatchUpsCount: 0,
    qualifyingRoundNumber: 1,
    matchUpsCount: 8,
    drawSize: 16,
  },
];

it.each(scenarios)(
  'can qualify specified number of participants',
  (scenario) => {
    let result = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          ignoreDefaults: true,
          qualifyingProfiles: [{ structureProfiles: [scenario] }],
        },
      ],
    });

    let {
      tournamentRecord,
      drawIds: [drawId],
    } = result;

    tournamentEngine.setState(tournamentRecord);
    let { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
    expect(drawDefinition.entries.length).toEqual(scenario.drawSize);
    expect(event.entries.length).toEqual(scenario.drawSize);
    expect(drawDefinition.links[0].source.roundNumber).not.toBeUndefined;

    let { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
    expect(matchUps.length).toEqual(scenario.matchUpsCount);

    let matchUpId = matchUps[0].matchUpId;
    let outcome = mocksEngine.generateOutcomeFromScoreString({
      matchUpStatus: COMPLETED,
      scoreString: '6-1 6-1',
      winningSide: 2,
    }).outcome;

    result = tournamentEngine.setMatchUpStatus({
      matchUpId,
      outcome,
      drawId,
    });
    expect(result.success).toEqual(true);

    matchUps = tournamentEngine.allDrawMatchUps({ drawId }).matchUps;

    const completedMatchUps = matchUps.filter(
      ({ matchUpStatus }) => matchUpStatus === COMPLETED
    );

    expect(completedMatchUps.length).toEqual(1);

    let secondRoundMatchUps = matchUps.filter(
      ({ roundNumber }) => roundNumber === 2
    );
    expect(secondRoundMatchUps.length).toEqual(
      scenario.secondRoundMatchUpsCount
    );

    if (scenario.secondRoundMatchUpsCount) {
      let secondRoundDrawPositions = secondRoundMatchUps
        .map(({ drawPositions }) => drawPositions)
        .flat();
      expect(secondRoundDrawPositions).toEqual(
        scenario.secondRoundDrawPositions
      );

      ({ outcome } = mocksEngine.generateOutcomeFromScoreString({
        matchUpStatus: TO_BE_PLAYED,
        winningSide: undefined,
      }));
      result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);

      secondRoundMatchUps = matchUps.filter(
        ({ roundNumber }) => roundNumber === 2
      );
      secondRoundDrawPositions = secondRoundMatchUps
        .map(({ drawPositions }) => drawPositions)
        .flat()
        .filter(Boolean);
      expect(secondRoundDrawPositions).toEqual([]);
    }
  }
);

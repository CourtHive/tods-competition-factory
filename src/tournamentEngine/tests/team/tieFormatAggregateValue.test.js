import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES } from '../../../constants/matchUpTypes';
import { TEAM } from '../../../constants/eventConstants';
import {
  COMPLETED,
  IN_PROGRESS,
} from '../../../constants/matchUpStatusConstants';

const tieFormats = {
  Shuffle: {
    collectionDefinitions: [
      {
        collectionId: 'cid1',
        collectionName: 'Round 1',
        matchUpCount: 3,
        matchUpFormat: 'SET1-S:T20',
        matchUpType: DOUBLES,
        scoreValue: 1,
      },
      {
        collectionId: 'cid2',
        collectionName: 'Round 2',
        matchUpCount: 3,
        matchUpFormat: 'SET1-S:T20',
        matchUpType: DOUBLES,
        scoreValue: 1,
      },
      {
        collectionId: 'cid3',
        collectionName: 'Round 3',
        matchUpCount: 3,
        matchUpFormat: 'SET1-S:T20',
        matchUpType: DOUBLES,
        scoreValue: 1,
      },
    ],
    winCriteria: {
      aggregateValue: true,
    },
  },
  Mixup: {
    collectionDefinitions: [
      {
        collectionId: 'cid1',
        collectionName: 'Round 1',
        matchUpCount: 3,
        matchUpFormat: 'SET3-S:TB10',
        matchUpType: DOUBLES,
        setValue: 1,
      },
      {
        collectionId: 'cid2',
        collectionName: 'Round 2',
        matchUpCount: 3,
        matchUpFormat: 'SET1-S:T20',
        matchUpType: DOUBLES,
        scoreValue: 1,
      },
      {
        collectionId: 'cid3',
        collectionName: 'Round 3',
        matchUpCount: 3,
        matchUpFormat: 'SET1-S:T20',
        matchUpType: DOUBLES,
        scoreValue: 1,
      },
    ],
    winCriteria: {
      aggregateValue: true,
    },
  },
  collectionAggregate: {
    collectionDefinitions: [
      {
        collectionId: 'cid1',
        collectionName: 'Round 1',
        matchUpCount: 3,
        matchUpFormat: 'SET1-S:T20',
        matchUpType: DOUBLES,
        collectionValue: 1,
        winCriteria: {
          aggregateValue: true,
        },
      },
      {
        collectionId: 'cid2',
        collectionName: 'Round 2',
        matchUpCount: 3,
        matchUpFormat: 'SET1-S:T20',
        matchUpType: DOUBLES,
        scoreValue: 1,
      },
      {
        collectionId: 'cid3',
        collectionName: 'Round 3',
        matchUpCount: 3,
        matchUpFormat: 'SET1-S:T20',
        matchUpType: DOUBLES,
        scoreValue: 1,
      },
    ],
    winCriteria: {
      aggregateValue: true,
    },
  },
};

const scenarios = [
  {
    tieFormat: tieFormats.Shuffle,
    outcome: {
      score: { sets: [{ side1Score: 2, side2Score: 1 }] },
      winningSide: 1,
    },
    collectionValues: {
      cid1: { complete: 3 },
      cid2: { complete: 3 },
      cid3: { complete: 3 },
    },
    scoreGoal: {
      scoreStringSide1: '18-9',
      scoreStringSide2: '9-18',
      sets: [{ side1Score: 18, side2Score: 9 }],
    },
    matchUpStatusGoal: COMPLETED,
    secondRoundDrawPositions: [1, 3],
  },
  {
    tieFormat: tieFormats.Shuffle,
    outcome: {
      score: { sets: [{ side1Score: 2, side2Score: 1 }] },
      winningSide: 1,
    },
    collectionValues: {
      cid1: { complete: 2 },
      cid2: { complete: 3 },
      cid3: { complete: 3 },
    },
    scoreGoal: {
      scoreStringSide1: '16-8',
      scoreStringSide2: '8-16',
      sets: [{ side1Score: 16, side2Score: 8 }],
    },
    matchUpStatusGoal: IN_PROGRESS,
    secondRoundDrawPositions: undefined,
  },
  {
    tieFormat: tieFormats.Mixup,
    outcome: {
      score: { sets: [{ side1Score: 2, side2Score: 1 }] },
      winningSide: 1,
    },
    collectionValues: {
      cid1: {
        complete: 3,
        outcome: {
          score: {
            sets: [
              {
                setNumber: 1,
                side1TiebreakScore: 1,
                side2TiebreakScore: 10,
                winningSide: 2,
              },
              {
                setNumber: 2,
                side1TiebreakScore: 1,
                side2TiebreakScore: 10,
                winningSide: 2,
              },
            ],
          },
          winningSide: 2,
        },
      },
      cid2: { complete: 3 },
      cid3: { complete: 3 },
    },
    scoreGoal: {
      scoreStringSide1: '12-12',
      scoreStringSide2: '12-12',
      sets: [{ side1Score: 12, side2Score: 12 }],
    },
    matchUpStatusGoal: IN_PROGRESS,
    secondRoundDrawPositions: undefined,
  },
  {
    tieFormat: tieFormats.collectionAggregate,
    outcome: {
      score: { sets: [{ side1Score: 2, side2Score: 1 }] },
      winningSide: 1,
    },
    collectionValues: {
      cid1: { complete: 3 },
      cid2: { complete: 3 },
      cid3: { complete: 3 },
    },
    scoreGoal: {
      scoreStringSide1: '13-6',
      scoreStringSide2: '6-13',
      sets: [{ side1Score: 13, side2Score: 6 }],
    },
    matchUpStatusGoal: COMPLETED,
    secondRoundDrawPositions: [1, 3],
  },
];

test.each(scenarios)(
  'tieFormat scoreValue works with winCriteria: aggregateValue',
  ({
    secondRoundDrawPositions,
    matchUpStatusGoal,
    collectionValues,
    scoreGoal,
    tieFormat,
    outcome,
  }) => {
    const {
      tournamentRecord,
      drawIds: [drawId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [
        {
          eventType: TEAM,
          drawSize: 4,
          tieFormat,
        },
      ],
    });

    tournamentEngine.setState(tournamentRecord);

    let { matchUps: firstRoundDualMatchUps } =
      tournamentEngine.allTournamentMatchUps({
        matchUpFilters: {
          matchUpTypes: [TEAM],
          roundNumbers: [1],
        },
      });

    expect(firstRoundDualMatchUps.length).toEqual(2);

    // for all first round dualMatchUps complete all doubles matchUps
    firstRoundDualMatchUps.forEach((dualMatchUp) => {
      const completed = {};
      dualMatchUp.tieMatchUps.forEach((tieMatchUp) => {
        const { matchUpId, collectionId } = tieMatchUp;
        if (!completed[collectionId]) completed[collectionId] = 0;

        if (
          collectionValues[collectionId]?.complete === completed[collectionId]
        ) {
          return;
        }

        let result = tournamentEngine.setMatchUpStatus({
          outcome: collectionValues[collectionId]?.outcome || outcome,
          matchUpId,
          drawId,
        });
        expect(result.success).toEqual(true);
        completed[collectionId] += 1;
      });
    });

    ({ matchUps: firstRoundDualMatchUps } =
      tournamentEngine.allTournamentMatchUps({
        matchUpFilters: {
          matchUpTypes: [TEAM],
          roundNumbers: [1],
        },
      }));

    firstRoundDualMatchUps.forEach((dualMatchUp) => {
      const { winningSide, matchUpStatus, score, tieFormat } = dualMatchUp;
      expect(tieFormat.winCriteria.aggregateValue).toEqual(true);
      expect(matchUpStatus).toEqual(matchUpStatusGoal);
      if (matchUpStatusGoal === COMPLETED) {
        expect(winningSide).toEqual(1);
      }
      expect(score).toEqual(scoreGoal);
    });

    const {
      matchUps: [secondRoundDualMatchUp],
    } = tournamentEngine.allTournamentMatchUps({
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [2],
      },
    });
    expect(secondRoundDualMatchUp.drawPositions).toEqual(
      secondRoundDrawPositions
    );
  }
);

import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { setDevContext } from '../../../global/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import {
  COMPLETED,
  IN_PROGRESS,
} from '../../../constants/matchUpStatusConstants';

const getMatchUp = (id, inContext) => {
  const {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpIds: [id] },
    inContext,
  });
  return matchUp;
};

const scenarios = [
  { drawSize: 2, singlesCount: 1, doublesCount: 0, valueGoal: 1 },
  { drawSize: 2, singlesCount: 3, doublesCount: 0, valueGoal: 2 },
  { drawSize: 4, singlesCount: 1, doublesCount: 0, valueGoal: 1 },
  { drawSize: 4, singlesCount: 3, doublesCount: 0, valueGoal: 2 },
  { drawSize: 8, singlesCount: 3, doublesCount: 0, valueGoal: 2 },
];

it.each(scenarios)('can advance teamParticipants', (scenario) => {
  const { tournamentRecord, valueGoal } = generateTeamTournament(scenario);
  expect(valueGoal).toEqual(scenario.valueGoal);

  tournamentEngine.setState(tournamentRecord);

  let { matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
    });

  // generate outcome to be applied to each first round singles matchUp
  let { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: COMPLETED,
    scoreString: '6-1 6-1',
    winningSide: 1,
  });

  processOutcome({ dualMatchUps: firstRoundDualMatchUps, outcome, valueGoal });

  let { matchUps: secondRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [2] },
    });

  // check that all second round matchUps have two advanced positions
  if (secondRoundDualMatchUps.length) {
    secondRoundDualMatchUps.forEach((dualMatchUp) => {
      expect(dualMatchUp.drawPositions.length).toEqual(2);
    });
  }

  setDevContext({ tieMatchUps: true });

  // remove outcomes
  processOutcome({ dualMatchUps: firstRoundDualMatchUps, outcome: toBePlayed });

  ({ matchUps: secondRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [2] },
    }));

  // check that all second round matchUps have two advanced positions
  if (secondRoundDualMatchUps.length) {
    secondRoundDualMatchUps.forEach((dualMatchUp) => {
      expect(dualMatchUp.drawPositions.filter(Boolean).length).toEqual(0);
    });
  }
});

function processOutcome({ dualMatchUps, outcome, valueGoal }) {
  dualMatchUps.forEach((dualMatchUp) => {
    const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === SINGLES
    );
    const { drawId } = dualMatchUp;
    singlesMatchUps.forEach((singlesMatchUp, i) => {
      const { matchUpId } = singlesMatchUp;
      let result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
      const updatedDualMatchUp = getMatchUp(dualMatchUp.matchUpId);
      const { score, winningSide, matchUpStatus } = updatedDualMatchUp;
      if (valueGoal) {
        expect(score.sets[0].side1Score).toEqual(i + 1);
        if (i + 1 >= valueGoal) {
          expect(winningSide).toEqual(1);
          expect(matchUpStatus).toEqual(COMPLETED);
        } else {
          expect(matchUpStatus).toEqual(IN_PROGRESS);
        }
      }
    });
  });
}

function generateTeamTournament({
  drawSize = 8,
  doublesCount = 1,
  singlesCount = 2,
} = {}) {
  const valueGoal = Math.ceil((doublesCount + singlesCount) / 2);
  const tieFormat = {
    winCriteria: { valueGoal },
    collectionDefinitions: [
      {
        collectionId: 'doublesCollectionId',
        collectionName: 'Doubles',
        matchUpType: DOUBLES,
        matchUpCount: doublesCount,
        matchUpFormat: 'SET3-S:6/TB7-F:TB10',
        matchUpValue: 1,
      },
      {
        collectionId: 'singlesCollectionId',
        collectionName: 'Singles',
        matchUpType: SINGLES,
        matchUpCount: singlesCount,
        matchUpFormat: 'SET3-S:6/TB7',
        matchUpValue: 1,
      },
    ],
  };

  const eventProfiles = [
    {
      eventType: TEAM,
      eventName: 'Test Team Event',
      tieFormat,
      drawProfiles: [
        {
          drawSize,
          tieFormat,
          drawName: 'Main Draw',
        },
      ],
    },
  ];

  const {
    eventIds: [eventId],
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ eventProfiles });

  return { drawId, eventId, tournamentRecord, valueGoal };
}

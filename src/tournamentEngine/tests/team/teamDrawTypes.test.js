import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';

import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { TEAM } from '../../../constants/eventConstants';
import {
  COMPASS,
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  OLYMPIC,
  PLAY_OFF,
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';
import {
  COMPLETED,
  IN_PROGRESS,
} from '../../../constants/matchUpStatusConstants';

// reusable
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
  { drawType: SINGLE_ELIMINATION, matchUpsCount: 7 },
  { drawType: FIRST_MATCH_LOSER_CONSOLATION, matchUpsCount: 12 },
  { drawType: COMPASS, matchUpsCount: 12 },
  { drawType: OLYMPIC, matchUpsCount: 12 },
  { drawType: FEED_IN_CHAMPIONSHIP, matchUpsCount: 13 },
  { drawType: ROUND_ROBIN, matchUpsCount: 12 },
];

it.each(scenarios)(
  'can generate all drawTypes for eventType: TEAM',
  (scenario) => {
    const { drawType, matchUpsCount } = scenario;
    let {
      tournamentRecord,
      drawIds: [drawId],
      eventIds: [eventId],
    } = mocksEngine.generateTournamentRecord({
      drawProfiles: [{ eventType: TEAM, drawSize: 8, drawType }],
    });
    tournamentEngine.setState(tournamentRecord);
    const { matchUps } = tournamentEngine.allTournamentMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
    });
    expect(matchUps.length).toEqual(matchUpsCount);
    matchUps.forEach((matchUp) => {
      expect(matchUp.tieFormat).not.toBeUndefined();
      expect(matchUp.tieMatchUps.length).toEqual(9);
    });

    const { drawDefinition, event } = tournamentEngine.getEvent({ drawId });
    expect(event.tieFormat).not.toBeUndefined();
    expect(drawDefinition.tieFormat).toBeUndefined();

    const valueGoal = event.tieFormat.winCriteria.valueGoal;

    const { eventData } = tournamentEngine.getEventData({ eventId });
    eventData.drawsData[0].structures[0].roundMatchUps[1].forEach(
      (dualMatchUp) => expect(dualMatchUp.tieFormat).not.toBeUndefined()
    );

    // generate outcome to be applied to each first round singles matchUp
    const { outcome } = mocksEngine.generateOutcomeFromScoreString({
      matchUpStatus: COMPLETED,
      scoreString: '6-1 6-1',
      winningSide: 1,
    });

    let { matchUps: firstRoundDualMatchUps } =
      tournamentEngine.allTournamentMatchUps({
        matchUpFilters: { matchUpTypes: [TEAM], roundNumbers: [1] },
      });

    firstRoundDualMatchUps.forEach((dualMatchUp) =>
      expect(dualMatchUp.tieFormat).not.toBeUndefined()
    );

    // for all first round dualMatchUps complete all singles/doubles matchUps
    firstRoundDualMatchUps.forEach((dualMatchUp) => {
      const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
        ({ matchUpType }) => matchUpType === SINGLES
      );
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
        expect(score.sets[0].side1Score).toEqual(i + 1);
        if (i + 1 >= valueGoal) {
          expect(winningSide).toEqual(1);
          expect(matchUpStatus).toEqual(COMPLETED);
        } else {
          expect(matchUpStatus).toEqual(IN_PROGRESS);
        }
      });

      const singlesMatchUpCount = singlesMatchUps.length;

      const doublesMatchUps = dualMatchUp.tieMatchUps.filter(
        ({ matchUpType }) => matchUpType === DOUBLES
      );
      doublesMatchUps.forEach((doublesMatchUp, i) => {
        const { matchUpId } = doublesMatchUp;
        let result = tournamentEngine.setMatchUpStatus({
          matchUpId,
          outcome,
          drawId,
        });
        expect(result.success).toEqual(true);
        const updatedDualMatchUp = getMatchUp(dualMatchUp.matchUpId);
        const { score, winningSide, matchUpStatus } = updatedDualMatchUp;
        expect(score.sets[0].side1Score).toEqual(singlesMatchUpCount + i + 1);
        if (singlesMatchUpCount + i + 1 >= valueGoal) {
          expect(winningSide).toEqual(1);
          expect(matchUpStatus).toEqual(COMPLETED);
        } else {
          expect(matchUpStatus).toEqual(IN_PROGRESS);
        }
      });
    });
  }
);

it('generates playoff structures for TEAM events and propagates tieFormat', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { eventType: TEAM, drawSize: 8, drawType: SINGLE_ELIMINATION },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.getEvent({ drawId });

  let result = tournamentEngine.addPlayoffStructures({
    playoffStructureNameBase: '3-4 Playoff',
    playoffPositions: [3, 4],
    structureId,
    drawId,
  });
  expect(result.success).toEqual(true);

  const {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [PLAY_OFF] },
    matchUpFilters: { matchUpTypes: [TEAM] },
  });
  expect(matchUp.tieFormat).not.toBeUndefined();
  expect(matchUp.tieMatchUps.length).toEqual(9);

  const { matchUp: foundMatchUp } = tournamentEngine.findMatchUp({
    ...matchUp,
    inContext: true,
  });
  expect(foundMatchUp.tieFormat).not.toBeUndefined();
});

import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { DOMINANT_DUO } from '../../../constants/tieFormatConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { TEAM } from '../../../constants/eventConstants';
import {
  MAIN,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

test('changing scores after playoffs generated in team round robin with playoffs', () => {
  const structureOptions = {
    playoffGroups: [
      { finishingPositions: [1], structureName: 'Gold Flight' },
      { finishingPositions: [2], structureName: 'Silver Flight' },
    ],
  };
  const mockProfile = {
    drawProfiles: [
      {
        drawType: ROUND_ROBIN_WITH_PLAYOFF,
        tieFormatName: DOMINANT_DUO,
        structureOptions,
        eventType: TEAM,
        drawSize: 8,
      },
    ],
  };

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const mainStageMatchUps = tournamentEngine.allTournamentMatchUps({
    contextFilters: { stages: [MAIN] },
    matchUpFilters: { matchUpTypes: [TEAM] },
  }).matchUps;

  expect(mainStageMatchUps.length).toEqual(12);

  let { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: COMPLETED,
    scoreString: '6-1 6-1',
    winningSide: 1,
  });

  mainStageMatchUps.forEach((dualMatchUp) => {
    const singlesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === SINGLES
    );
    singlesMatchUps.forEach((singlesMatchUp) => {
      const { matchUpId } = singlesMatchUp;
      let result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });
    const doublesMatchUps = dualMatchUp.tieMatchUps.filter(
      ({ matchUpType }) => matchUpType === DOUBLES
    );
    doublesMatchUps.forEach((doublesMatchUp) => {
      const { matchUpId } = doublesMatchUp;
      let result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });
  });

  const mainStructureId = mainStageMatchUps[0].structureId;
  expect(mainStageMatchUps[0].tieFormat.tieFormatName).toEqual(DOMINANT_DUO);

  let result = tournamentEngine.automatedPlayoffPositioning({
    structureId: mainStructureId,
    drawId,
  });

  expect(result.success).toEqual(true);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const doublesMatchUpId = mainStageMatchUps[0].tieMatchUps.find(
    (m) => m.matchUpType === DOUBLES
  ).matchUpId;

  const doublesMatchUp = matchUps.find((m) => m.matchUpId === doublesMatchUpId);

  console.log(doublesMatchUp);

  outcome = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: COMPLETED,
    scoreString: '6-1 6-1',
    winningSide: 2,
  }).outcome;

  result = tournamentEngine.setMatchUpStatus({
    matchUpId: doublesMatchUp.matchUpId,
    outcome,
    drawId,
  });

  console.log(result);
});

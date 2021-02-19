import { generateOutcomeFromScoreString } from '../../../mocksEngine/generators/generateOutcomeFromScoreString';
import { intersection } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { ELIMINATION } from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { FEMALE } from '../../../constants/genderConstants';
import {
  COMPLETED,
  TO_BE_PLAYED,
} from '../../../constants/matchUpStatusConstants';
import { INDIVIDUAL } from '../../../constants/participantTypes';
import {
  END,
  PENALTY,
  REFEREE,
  SCHEDULE,
  SCORE,
  START,
  STATUS,
} from '../../../constants/matchUpActionConstants';

it('can return valid actions for matchUps', () => {
  const participantsProfile = {
    participantsCount: 16,
    participantType: INDIVIDUAL,
    sex: FEMALE,
  };
  const drawProfiles = [
    {
      drawSize: 16,
      eventType: SINGLES,
      participantsCount: 14,
      drawType: ELIMINATION,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });

  let matchUp = matchUps[0];
  expect(matchUp.matchUpStatus).toEqual(COMPLETED);
  let { validActions } = tournamentEngine.matchUpActions(matchUp);
  let actionTypes = validActions.map((action) => action.type);
  let overlap = intersection(actionTypes, [
    REFEREE,
    PENALTY,
    SCORE,
    START,
    END,
  ]);
  expect(overlap.length).toEqual(5);

  matchUp = matchUps[1];
  expect(matchUp.matchUpStatus).toEqual(TO_BE_PLAYED);
  ({ validActions } = tournamentEngine.matchUpActions(matchUp));
  actionTypes = validActions.map((action) => action.type);
  expect(actionTypes.includes(SCHEDULE)).toEqual(true);
  expect(actionTypes.includes(STATUS)).toEqual(true);

  matchUp = matchUps[10];
  expect(matchUp.matchUpStatus).toEqual(TO_BE_PLAYED);
  ({ validActions } = tournamentEngine.matchUpActions(matchUp));
  actionTypes = validActions.map((action) => action.type);
  expect(actionTypes.includes(SCHEDULE)).toEqual(true);
  expect(actionTypes.includes(REFEREE)).toEqual(true);
  expect(actionTypes.includes(STATUS)).toEqual(false);
});

it.only('can score a matchUp using params provided in validActions', () => {
  const drawProfiles = [
    {
      drawSize: 32,
      participantsCount: 30,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });

  let drawPosition = 3;
  let targetMatchUp = matchUps.find(
    (matchUp) =>
      matchUp.drawPositions.includes(drawPosition) && matchUp.roundNumber === 1
  );
  let { validActions } = tournamentEngine.matchUpActions(targetMatchUp);
  let scoreAction = validActions.find(({ type }) => type === SCORE);
  const { method, payload } = scoreAction;

  const { outcome } = generateOutcomeFromScoreString({
    scoreString: '6-1 6-1',
    winningSide: 2,
  });

  Object.assign(payload, { outcome });

  tournamentEngine.devContext(true);
  let result = tournamentEngine[method](payload);
  expect(result.success).toEqual(true);
  expect(result.matchUp.winningSide).toEqual(2);
});

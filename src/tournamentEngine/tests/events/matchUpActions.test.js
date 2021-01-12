import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';
import { intersection } from '../../../utilities';

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

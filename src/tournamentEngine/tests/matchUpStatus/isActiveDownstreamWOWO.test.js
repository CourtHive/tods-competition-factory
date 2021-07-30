import { SCORE } from '../../../constants/matchUpActionConstants';
import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

const getTarget = ({ matchUps, roundNumber, roundPosition }) =>
  matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === roundNumber &&
      matchUp.roundPosition === roundPosition
  );

it('can recognize when double WO/WO propagated WO/WO is active downstream', () => {
  const drawSize = 16;
  const drawProfiles = [
    {
      drawSize,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          matchUpStatus: DOUBLE_WALKOVER,
        },
        {
          roundNumber: 1,
          roundPosition: 2,
          matchUpStatus: DOUBLE_WALKOVER,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          matchUpStatus: DOUBLE_WALKOVER,
        },
      ],
    },
  ];

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    completeAllMatchUps: true,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const { completedMatchUps } = tournamentEngine.tournamentMatchUps();
  expect(completedMatchUps.length).toEqual(drawSize - 1);

  let matchUp = getTarget({
    matchUps: completedMatchUps,
    roundNumber: 1,
    roundPosition: 3,
  });
  expect(matchUp.matchUpStatus).toEqual(DOUBLE_WALKOVER);

  // TODO: DOUBLE_WALKOVER status is a comppleted status, but may NOT be readyToScore if isActiveDownstream
  // currently the boolean is set only based on matchUpStatus without lookahead to see if isActiveDownstream
  // ... which would be processor intensive (unless scoped only to WOWO)
  // console.log(matchUp.readyToScore);

  let { validActions } = tournamentEngine.matchUpActions(matchUp);
  let types = validActions.reduce(
    (types, action) =>
      types.includes(action.type) ? types : types.concat(action.type),
    []
  );
  expect(types.includes(SCORE)).toEqual(false);

  matchUp = getTarget({
    matchUps: completedMatchUps,
    roundNumber: 1,
    roundPosition: 1,
  });
  expect(matchUp.matchUpStatus).toEqual(DOUBLE_WALKOVER);

  ({ validActions } = tournamentEngine.matchUpActions(matchUp));
  types = validActions.reduce(
    (types, action) =>
      types.includes(action.type) ? types : types.concat(action.type),
    []
  );
  expect(types.includes(SCORE)).toEqual(false);
});

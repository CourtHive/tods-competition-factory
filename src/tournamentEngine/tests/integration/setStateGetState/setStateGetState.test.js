import { validDrawPositions } from '../../../../drawEngine/governors/matchUpGovernor/validDrawPositions';
import drawEngine from '../../../../drawEngine/sync';
import tournamentEngine from '../../../sync';

import { mutation } from './mutation.payload';
import { tournament } from './tournament';

it('can recognize invalid matchUps', () => {
  tournamentEngine.setState(tournament);
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  let result = validDrawPositions({ matchUps });
  expect(result).toEqual(true);

  expect(mutation.tournamentId).toEqual(tournament.tournamentId);

  mutation.executionQueue.forEach((queueItem) => {
    const { method, params } = queueItem;
    const result = tournamentEngine[method](params);
    expect(result.success).toEqual(true);
  });

  const { drawDefinition } = mutation.executionQueue[0].params;
  drawEngine.setState(drawDefinition);
  const state = drawEngine.devContext(true).getState(drawDefinition);
  expect(state).not.toEqual(drawDefinition);
  const { matchUps: drawMatchUps } = drawEngine.allDrawMatchUps();
  result = validDrawPositions({ matchUps: drawMatchUps });
  expect(result).toEqual(true);

  const { matchUps: postExecutionMatchUps } =
    tournamentEngine.allTournamentMatchUps();

  result = validDrawPositions({
    matchUps: postExecutionMatchUps,
    devContextext: false,
  });
  expect(result).toEqual(true);
});

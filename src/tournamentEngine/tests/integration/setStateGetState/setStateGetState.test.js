import fs from 'fs';
import tournamentEngine from '../../..';
import drawEngine from '../../../../drawEngine';
import { validDrawPositions } from '../../../../drawEngine/tests/primitives/validDrawPositions';

import { tournament } from './tournament';
import { mutation } from './mutation.payload';

it.skip('can load a tournament', () => {
  tournamentEngine.setState(tournament);
  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  let result = validDrawPositions({ matchUps, devContextext: true });
  expect(result).toEqual(true);

  expect(mutation.tournamentId).toEqual(tournament.tournamentId);

  mutation.executionQueue.forEach(queueItem => {
    const { method, params } = queueItem;
    const result = tournamentEngine[method](params);
    expect(result.success).toEqual(true);
  });

  const { drawDefinition } = mutation.executionQueue[0].params;
  drawEngine.setState(drawDefinition);
  const { matchUps: drawMatchUps } = drawEngine.allDrawMatchUps();
  result = validDrawPositions({ matchUps, devContextext: true });
  expect(result).toEqual(true);

  const {
    matchUps: postExecutionMatchUps,
  } = tournamentEngine.allTournamentMatchUps();
  result = validDrawPositions({
    matchUps: postExecutionMatchUps,
    devContextext: false,
  });
  console.log({ result });
});

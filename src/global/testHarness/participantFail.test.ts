import { tournamentEngine } from '../..';
import { expect, it } from 'vitest';
import fs from 'fs';

import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';

it('hydrated tieMatchUps can be processed successfully', () => {
  const tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/participantFail.tods.json',
    'utf-8'
  );

  const { tournamentRecord } = JSON.parse(tournamentRecordJSON);

  tournamentEngine.setState(tournamentRecord);

  let result = tournamentEngine.getParticipants();
  expect(result.participants.length);

  result = tournamentEngine.getParticipants({ inContext: true });
  expect(result.participants.length);

  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES, DOUBLES] },
  });

  for (const matchUp of matchUps) {
    expect(matchUp.drawPositions).not.toBeUndefined();
    expect(matchUp.sides[0].lineUp).toBeUndefined();
  }
});

import tournamentEngine from '../../tournamentEngine/sync';
import { expect, it } from 'vitest';
import fs from 'fs';

it('can can determine scorecard winner using tallyDirectives', () => {
  const tournamentRecordJSON = fs.readFileSync(
    './src/matchUpEngine/tests/tieFormatTallyDirectives.tods.json',
    'utf-8'
  );
  const tournamentRecord = JSON.parse(tournamentRecordJSON);
  let result = tournamentEngine
    // .devContext({ tally: true })
    .setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const {
    matchUps: [matchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: { matchUpTypes: ['TEAM'] },
  });

  const { matchUpId, drawId, tieFormat, winningSide } = matchUp;
  expect(tieFormat.winCriteria.tallyDirectives).toEqual(true);
  expect(winningSide).toBeUndefined();

  result = tournamentEngine.updateTieMatchUpScore({ matchUpId, drawId });
  expect(result.winningSide).toEqual(1);
});

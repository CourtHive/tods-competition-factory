import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { expect, test } from 'vitest';
import drawEngine from '../../sync';

import {
  COMPASS,
  CURTIS_CONSOLATION,
  // ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

test('can recreate an exitProfile for a COMPASS draw', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, drawType: COMPASS }],
  });

  tournamentEngine.setState(tournamentRecord);
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { exitProfiles } = drawEngine
    .setState(drawDefinition)
    .getExitProfiles({ drawDefinition });
  expect(Object.values(exitProfiles)).toEqual([
    ['0'],
    ['0-1'],
    ['0-1-1'],
    ['0-1-1-1'],
    ['0-1-2'],
    ['0-2'],
    ['0-2-1'],
    ['0-3'],
  ]);
});

test('can recreate an exitProfile for a CURTIS_CONSOLATION draw', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 64, drawType: CURTIS_CONSOLATION }],
  });

  tournamentEngine.setState(tournamentRecord);
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { exitProfiles } = drawEngine
    .setState(drawDefinition)
    .getExitProfiles({ drawDefinition });
  expect(Object.values(exitProfiles)).toEqual([
    ['0'],
    ['0-1', '0-2'],
    ['0-3', '0-4'],
    ['0-5'],
  ]);
});

// IMPLEMENT:  not yet sorted
/*
test.only('can recreate an exitProfile for a ROUND_ROBIN_WITH_PLAYOFF draw', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 64, drawType: ROUND_ROBIN_WITH_PLAYOFF }],
  });

  tournamentEngine.setState(tournamentRecord);
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { exitProfiles } = drawEngine
    .setState(drawDefinition)
    .getExitProfiles({ drawDefinition });
  console.log(Object.values(exitProfiles));
});

test.skip('can recreate an exitProfile for a DOUBLE_ELIMINATION draw', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 24, drawType: DOUBLE_ELIMINATION }],
  });

  tournamentEngine.setState(tournamentRecord);
  const { drawDefinition } = tournamentEngine.getEvent({ drawId });
  const { exitProfiles } = drawEngine.getExitProfiles({ drawDefinition });
  console.log(Object.values(exitProfiles));
});
*/

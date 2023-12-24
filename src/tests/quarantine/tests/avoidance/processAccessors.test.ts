import { processAccessors } from '../../../../query/drawDefinition/processAccessors';
import { expect, it } from 'vitest';

it('can procsess nested keys', () => {
  const participant = {
    teams: [
      {
        participantName: 'Team 1',
      },
    ],
    participantName: 'Italo Stewart',
  };
  const result = processAccessors({
    accessors: ['teams', 'participantName'],
    value: participant,
  });
  expect(result).toEqual(['Team 1']);
});

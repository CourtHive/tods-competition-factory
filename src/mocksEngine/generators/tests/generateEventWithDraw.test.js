import { mocksEngine } from '../../..';

it('can generate an event with draw independent of a tournamentRecord', () => {
  const drawSize = 32;
  const drawProfile = { drawSize };
  const { drawDefinition, event, success } = mocksEngine.generateEventWithDraw({
    drawProfile,
  });
  expect(success).toEqual(true);
  expect(event.entries.length).toEqual(drawSize);
  expect(drawDefinition.entries.length).toEqual(drawSize);
});

import { DRAW_DEFINITION_NOT_FOUND, EVENT_NOT_FOUND, MISSING_EVENT } from '../../../constants/errorConditionConstants';
import { mocksEngine } from '../../../assemblies/engines/mock';
import { tournamentEngine } from '../../engines/syncEngine';
import { expect, it } from 'vitest';

it('should return the publish state of all events', () => {
  mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { eventId: 'e1', drawId: 'e1-d1', drawSize: 4 },
      { eventId: 'e2', drawId: 'e2-d1', drawSize: 4 },
      { eventId: 'e3', drawId: 'e3-d1', drawSize: 4 },
    ],
    eventProfiles: [
      {
        drawProfiles: [
          { drawId: 'e4-d1', drawSize: 4 },
          { drawId: 'e4-d2', drawSize: 4 },
        ],
        eventId: 'e4',
      },
    ],
    setState: true,
  });

  let publishState = tournamentEngine.getPublishState().publishState;
  expect(publishState).toEqual({
    e1: { status: { published: false } },
    e2: { status: { published: false } },
    e3: { status: { published: false } },
    e4: { status: { published: false } },
  });

  let pubResult = tournamentEngine.publishEvent({ eventId: 'e1' });
  expect(pubResult.success).toEqual(true);

  publishState = tournamentEngine.getPublishState().publishState;
  expect(publishState.e1.status.published).toEqual(true);
  expect(publishState.e2.status.published).toEqual(false);

  publishState = tournamentEngine.getPublishState({ eventId: 'e1' }).publishState;
  expect(publishState.status.published).toEqual(true);
  expect(publishState.status.publishedDrawIds.includes('e1-d1')).toEqual(true);
  expect(publishState.status.drawDetails['e1-d1'].publishingDetail.published).toEqual(true);

  let stateResult = tournamentEngine.getPublishState({ eventId: 'e5' });
  expect(stateResult.error).toEqual(EVENT_NOT_FOUND);
  expect(stateResult.publishState).toBeUndefined();

  // test publishing a draw that is already published
  pubResult = tournamentEngine.publishEvent({ eventId: 'e1' });
  expect(pubResult.success).toEqual(true);

  // test publishing a draw that doesn't exist
  pubResult = tournamentEngine.publishEvent({ eventId: 'e5' });
  expect(pubResult.error).toEqual(EVENT_NOT_FOUND);

  pubResult = tournamentEngine.publishEvent({ eventId: 'e3' });
  expect(pubResult.success).toEqual(true);

  pubResult = tournamentEngine.unPublishEvent({ eventId: 'e1' });
  expect(pubResult.success).toEqual(true);

  publishState = tournamentEngine.getPublishState().publishState;
  expect(publishState.e1.status.published).toEqual(false);
  expect(publishState.e2.status.published).toEqual(false);
  expect(publishState.e3.status.published).toEqual(true);

  publishState = tournamentEngine.getPublishState({ eventId: 'e4' }).publishState;
  expect(publishState.status.published).toEqual(false);

  // not yet published
  publishState = tournamentEngine.devContext(true).getPublishState({ eventId: 'e4', drawId: 'e4-d1' }).publishState;
  expect(publishState.status.published).toEqual(false);

  // drawId not found
  stateResult = publishState = tournamentEngine.getPublishState({ eventId: 'e4', drawId: 'e4-d3' });
  expect(stateResult.error).toEqual(DRAW_DEFINITION_NOT_FOUND);

  // missing eventId - drawDefinition not reolved when drawId is in an array
  pubResult = tournamentEngine.publishEvent({ drawIdsToAdd: ['e4-d1'] });
  expect(pubResult.error).toEqual(MISSING_EVENT);

  pubResult = tournamentEngine.publishEvent({ eventId: 'e4', drawIdsToAdd: ['e4-d1'] });
  expect(pubResult.success).toEqual(true);

  publishState = tournamentEngine.getPublishState({ drawId: 'e4-d1' }).publishState;
  expect(publishState.status.published).toEqual(true);

  publishState = tournamentEngine.getPublishState({ eventId: 'e4' }).publishState;
  expect(publishState.status.published).toEqual(true);
  expect(publishState.status.publishedDrawIds).toEqual(['e4-d1']);
  expect(publishState.status.drawDetails['e4-d2']).toEqual({ publishingDetail: { published: false } });
  expect(publishState.status.drawDetails['e4-d1']).toEqual({ publishingDetail: { published: true } });

  pubResult = tournamentEngine.publishEvent({ eventId: 'e4', drawIdsToRemove: ['e4-d1'] });
  expect(pubResult.success).toEqual(true);

  publishState = tournamentEngine.getPublishState({ eventId: 'e4' }).publishState;
  expect(publishState.status.published).toEqual(false);
});

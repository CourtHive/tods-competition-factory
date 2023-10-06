import syncGlobalState from '../../global/state/syncGlobalState';
import competitionEngine from '../../competitionEngine/sync';
import mocksEngine from '../../mocksEngine';
import { expect, it, test } from 'vitest';
import tournamentEngine from '../sync';
import {
  setStateProvider,
  setSubscriptions,
} from '../../global/state/globalState';

import { DELETED_DRAW_IDS } from '../../constants/topicConstants';

it('can set state provider', () => {
  let result: any = setStateProvider(syncGlobalState);
  expect(result.success).toEqual(true);

  try {
    result = setStateProvider();
  } catch (err) {
    expect(err).not.toBeUndefined();
  }
  try {
    result = setStateProvider({});
  } catch (err) {
    expect(err).not.toBeUndefined();
  }

  const allParticipants: any[] = [];

  const subscriptions = {
    addParticipants: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ participants }) => {
          allParticipants.push(...participants);
        });
      }
    },
  };

  result = setSubscriptions({ subscriptions });
  expect(result.success).toEqual(true);

  const { tournamentId } = tournamentEngine.newTournamentRecord();
  const participant = {
    participantRole: 'COMPETITOR',
    participantType: 'INDIVIDUAL',
    person: {
      standardFamilyName: 'Family',
      standardGivenName: 'Given',
    },
  };

  result = tournamentEngine.setState();
  expect(result.error).not.toBeUndefined();

  result = tournamentEngine.setState({});
  expect(result.error).not.toBeUndefined();

  result = competitionEngine.removeTournamentRecord();
  expect(result.error).not.toBeUndefined();

  tournamentEngine.addParticipant({ participant });
  expect(allParticipants.length).toEqual(1);

  competitionEngine.removeTournamentRecord(tournamentId);
});

test('state provider implementation of handleCaughtError', () => {
  let tournamentRecordsCount = 0;
  const errorInstances: any[] = [];

  function handleCaughtError({ engineName, methodName, params, err }) {
    let error;
    if (typeof err === 'string') {
      error = err.toUpperCase();
    } else if (err instanceof Error) {
      error = err.message;
    }

    const tournamentId = syncGlobalState.getTournamentId();
    const tournamentRecord = syncGlobalState.getTournamentRecord(tournamentId);
    if (tournamentRecord?.tournamentId === tournamentId)
      tournamentRecordsCount += 1;
    errorInstances.push({
      tournamentId,
      engineName,
      methodName,
      params: Object.keys(params),
      error,
    });
  }

  function addNotice({ topic }) {
    if (topic === DELETED_DRAW_IDS)
      throw new Error('Global state provider error');
  }

  const result: any = setStateProvider({
    ...syncGlobalState,
    handleCaughtError,
    addNotice,
  });
  expect(result.success).toEqual(true);

  expect(tournamentRecordsCount).toEqual(0);
  expect(errorInstances.length).toEqual(0);

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    tournamentAttributes: { tournamentId: 'tournamentId' },
    drawProfiles: [{ drawSize: 4 }],
  });
  tournamentEngine.setState(tournamentRecord);

  tournamentEngine.deleteDrawDefinitions({ drawIds: [drawId] });

  expect(tournamentRecordsCount).toEqual(1);
  expect(errorInstances).toEqual([
    {
      tournamentId: 'tournamentId',
      engineName: 'tournamentEngine',
      methodName: 'deleteDrawDefinitions',
      params: ['drawIds'],
      error: 'Global state provider error',
    },
  ]);
});

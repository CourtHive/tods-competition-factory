import { generateTournamentRecord } from '../../../data/fileSystem/generateTournamentRecord';
import { removeTournamentRecords } from '../../../data/fileSystem/removeTournamentRecords';
import { factoryConstants } from '../../../../../constants/';
import { TEST } from '../../../common/constants/test';
import { executionQueue } from './executionQueue';

describe('executionQueue', () => {
  it('can generate a tournamentRecord', async () => {
    // FIRST: remove any existing tournamentRecord with this tournamentId
    let result: any = await removeTournamentRecords({ tournamentId: TEST });
    expect(result.success).toEqual(true);

    // SECOND: generate a tournamentRecord with this tournamentId and persist to storage
    result = generateTournamentRecord({
      tournamentAttributes: { tournamentId: TEST },
      drawProfiles: [{ drawSize: 16 }],
    });
    expect(result.success).toEqual(true);

    // THIRD: execute a directive on the tournamentRecord
    result = await executionQueue({
      executionQueue: [
        {
          params: {
            startDate: '2024-01-01',
            endDate: '2024-01-02',
            tournamentId: TEST,
          },
          method: 'setTournamentDates',
        },
      ],
      tournamentIds: [TEST, 'test2'],
    });
    expect(result.success).toEqual(true);

    // FOURTH: attempt to execute a directive on a tournamentRecord that does not exist
    result = await executionQueue({
      executionQueue: [{ method: 'setTournamentDates', params: { tournamentId: TEST } }],
      tournamentIds: ['doesNotExist'],
    });
    expect(result.error).toEqual(factoryConstants.errorConditionConstants.MISSING_TOURNAMENT_RECORD);
  });
});

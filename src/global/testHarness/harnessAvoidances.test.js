import tournamentEngine from '../../tournamentEngine/sync';
import { timeKeeper } from '../state/globalState';
import { test } from 'vitest';
import fs from 'fs';

test.skip('benchmark drawGeneration times', () => {
  const tournamentRecordJSON = fs.readFileSync(
    './src/global/testHarness/avoidancesTournament.tods.json',
    'utf-8'
  );

  const tournamentRecord = JSON.parse(tournamentRecordJSON);
  tournamentEngine.setState(tournamentRecord);

  const eventId = 'E9F2D1DF-736D-45A6-8ED7-42F044C6B80E';
  const drawDefinitionValues = {};
  timeKeeper('start', 'withAvoidances');
  let result = tournamentEngine.generateDrawDefinition(drawDefinitionValues);
  timeKeeper('stop', 'withAvoidances');
  console.log(timeKeeper('report', 'allTimers'));
  result = timeKeeper('reset', 'allTimers');

  tournamentEngine.removeEventExtension({ eventId, name: 'appliedPolicies' });
  timeKeeper('start', 'noAvoidances');
  result = tournamentEngine.generateDrawDefinition(drawDefinitionValues);
  timeKeeper('stop', 'noAvoidances');
  console.log(timeKeeper('report', 'allTimers'));
  if (result.error) console.log({ result });
});

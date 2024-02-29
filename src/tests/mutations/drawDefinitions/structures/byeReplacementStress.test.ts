import { generateRange } from '@Tools/arrays';
import { replacementTest } from './byeReplacementStressTest';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it, test } from 'vitest';
import fs from 'fs';
import { popGlobalLog, printGlobalLog, purgeGlobalLog, pushGlobalLog } from '@Functions/global/globalLog';

import { POSITION_ACTIONS } from '@Constants/extensionConstants';
import {
  COMPASS,
  CURTIS_CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  MODIFIED_FEED_IN_CHAMPIONSHIP,
  ROUND_ROBIN,
} from '@Constants/drawDefinitionConstants';

it('can run stress tests when JEST_STRESS=true', () => {
  if (!process.env.JEST_STRESS) {
    ['brightyellow', 'brightgreen', 'brightmagenta', 'brightblue'].forEach((color) => {
      pushGlobalLog(
        {
          color,
          keyColors: {
            stage: 'brightcyan',
          },
          stage: 'MAIN',
          method: 'Global Log Tests',
        },
        true,
      );
    });
    pushGlobalLog('logTest', true);
    const result = popGlobalLog();
    expect(result.method).toEqual('logTest');
    printGlobalLog(true);
    purgeGlobalLog();
  }
});

// skipped in normal testing, only used for stress testing
test.skip.each([
  [8, COMPASS, [5, 6, 3, 1]],
  [8, ROUND_ROBIN, [5, 6, 3, 1]],
  [8, CURTIS_CONSOLATION, [5, 6, 3, 1]],
  [8, FEED_IN_CHAMPIONSHIP, [5, 6, 3, 1]],
  [8, MODIFIED_FEED_IN_CHAMPIONSHIP, [5, 6, 3, 1]],
  [8, FIRST_MATCH_LOSER_CONSOLATION, [5, 6, 3, 1]],
])('pass specific bye replacement scenarios', (drawSize, drawType, positionsToReplaceWithBye) => {
  pushGlobalLog(
    {
      color: 'brightyellow',
      method: 'Begin replacementTest',
    },
    true,
  );
  const result = replacementTest({
    positionsToReplaceWithBye,
    devMode: true,
    drawType,
    drawSize,
  });
  if (!result.success) {
    printGlobalLog(true);
  } else {
    purgeGlobalLog();
  }
});

/*
PASSED ...
[ 8, 4, FEED_IN_CHAMPIONSHIP, 50],
[16, 8, FEED_IN_CHAMPIONSHIP, 50],
[16, 0, FEED_IN_CHAMPIONSHIP, 100],
[32, 0, FEED_IN_CHAMPIONSHIP, 100],
[32, 0, MODIFIED_FEED_IN_CHAMPIONSHIP, 100],
[32, 0, CURTIS_CONSOLATION, 100],
[ 8, 4, CURTIS_CONSOLATION, 100],
[32, 0, ROUND_ROBIN, 100],
[16, 8, COMPASS, 100],
[32, 16, COMPASS, 50],
[32, 0, COMPASS, 100],
[64, 0, COMPASS, 10],
[ 8, 0, FMLC, 100],
[16, 0, FMLC, 100],
[32, 0, FMLC, 100],
[64, 0, FMLC, 10],
[ 8, 4, FIRST_MATCH_LOSER_CONSOLATION, 100],
[16, 8, FIRST_MATCH_LOSER_CONSOLATION, 50],
[16, 8, ROUND_ROBIN, 50],
*/

// test used in development utilizing positionActions extension to identify problem areas
test.each([
  [8, 4, FEED_IN_CHAMPIONSHIP, 50],
  [16, 8, FEED_IN_CHAMPIONSHIP, 50],
])(
  'can randomize drawPositions, randomize replacements, and complete drawType',
  (drawSize, byeLimit, drawType, iterations) => {
    if (process.env.JEST_STRESS !== 'true') {
      return;
    }

    const positionActionErrorScenarios: any[] = [];
    generateRange(0, iterations).forEach(() => {
      const result = replacementTest({
        drawType,
        drawSize,
        devMode: true,
        byeLimit,
      });
      if (!result.success) {
        const { tournamentRecord } = tournamentEngine.getTournament();
        const { drawId } = tournamentRecord.events[0].drawDefinitions[0];
        const { extension: positionActions } = tournamentEngine.findExtension({
          name: POSITION_ACTIONS,
          discover: ['drawDefinition'],
          drawId,
        });
        positionActionErrorScenarios.push({
          positionActions,
          drawType,
          drawSize,
        });
      }
    });

    console.log({ drawSize, byeLimit, drawType, iterations });
    if (positionActionErrorScenarios.length) {
      console.log(`#### ERRORS ####`);
      console.log(`${positionActionErrorScenarios.length} of ${iterations} failed`);
      const fileName = `positionActions_${drawSize}_${drawType}.json`;
      const dirPath = './scratch/';
      if (fs.existsSync(dirPath)) {
        const output = `${dirPath}${fileName}`;
        fs.writeFileSync(output, JSON.stringify(positionActionErrorScenarios, undefined, 1));
      }
    }
  },
);

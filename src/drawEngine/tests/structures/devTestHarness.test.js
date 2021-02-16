import tournamentEngine from '../../../tournamentEngine/sync';
import { replacementTest } from './byeReplacementStressTest';
import { generateRange } from '../../../utilities';
import fs from 'fs';
import {
  printGlobalLog,
  purgeGlobalLog,
  pushGlobalLog,
} from '../../../global/globalLog';

import {
  COMPASS,
  // CURTIS_CONSOLATION,
  // FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  // MODIFIED_FEED_IN_CHAMPIONSHIP,
  ROUND_ROBIN,
} from '../../../constants/drawDefinitionConstants';

/*
PASSED: FEED_IN_CHAMPIONSHIP 16 * 100
PASSED: FEED_IN_CHAMPIONSHIP 32 * 100
PASSED: MODIFIED_FEED_IN_CHAMPIONSHIP 32 * 100
PASSED: CURTIS_CONSOLATION 32 * 100
PASSED: ROUND_ROBIN 32 * 100
PASSED: COMPASS 32 * 100
PASSED: COMPASS 64 * 10
PASSED: FMLC 8 * 100
PASSED: FMLC 16 * 100
PASSED: FMLC 32 * 100
PASSED: FMLC 64 * 10
*/

it('can run stress tests when JEST_STRESS=true', () => {
  if (process.env.JEST_STRESS !== true) {
    console.log('JEST_STRESS=false');
  }
});

test.each([
  [8, COMPASS, [5, 6, 3, 1]],
  [8, COMPASS, [5, 6]],
])(
  'pass specific bye replaceent scenarios',
  (drawSize, drawType, positionsToReplaceWithBye) => {
    pushGlobalLog(
      {
        color: 'brightyellow',
        method: 'Begin replacementTest',
      },
      true
    );
    tournamentEngine.devContext(true);
    let result = replacementTest({
      drawType,
      drawSize,
      positionsToReplaceWithBye,
      devMode: true,
    });
    if (!result.success) {
      printGlobalLog(true);
    } else {
      purgeGlobalLog();
    }
  }
);

// test used in development utilizing positionActions extension to identify problem areas
test.skip.each([
  [16, 8, FIRST_MATCH_LOSER_CONSOLATION, 20],
  [16, 8, ROUND_ROBIN, 20],
])(
  'can randomize drawPositions, randomize replacements, and complete drawType',
  (drawSize, byeLimit, drawType, iterations) => {
    if (!process.env.JEST_STRESS) {
      return;
    }

    const positionActionErrorScenarios = [];
    generateRange(0, iterations).forEach(() => {
      const result = replacementTest({
        drawType,
        drawSize,
        devMode: true,
        byeLimit,
      });
      if (!result.success) {
        const { tournamentRecord } = tournamentEngine.getState();
        const { drawId } = tournamentRecord.events[0].drawDefinitions[0];
        const {
          extension: positionActions,
        } = tournamentEngine.findDrawDefinitionExtension({
          drawId,
          name: 'positionActions',
        });
        positionActionErrorScenarios.push({
          positionActions,
          drawType,
          drawSize,
        });
      }
    });

    if (positionActionErrorScenarios.length) {
      console.log(`#### ERRORS ####`);
      console.log(
        `${positionActionErrorScenarios.length} of ${iterations} failed`
      );
      const fileName = `positionActions_${drawSize}_${drawType}.json`;
      const dirPath = './scratch/';
      if (fs.existsSync(dirPath)) {
        const output = `${dirPath}${fileName}`;
        fs.writeFileSync(
          output,
          JSON.stringify(positionActionErrorScenarios, undefined, 1)
        );
      }
    }
  }
);

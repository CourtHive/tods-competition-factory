import tournamentEngine from '../../../tournamentEngine/sync';
import { replacementTest } from './byeReplacementStressTest';
import { generateRange } from '../../../utilities';
import fs from 'fs';

import {
  // COMPASS,
  // CURTIS_CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  // MODIFIED_FEED_IN_CHAMPIONSHIP,
  // ROUND_ROBIN,
} from '../../../constants/drawDefinitionConstants';

// only to be run when stress testing
it.skip('can perform iterations of specified draw type (dev harness)', () => {
  // successfully run with 100 iterations
  const iterations = 100;
  const drawType = FEED_IN_CHAMPIONSHIP;
  const drawSize = 32;
  generateRange(0, iterations).forEach((index) => {
    const result = replacementTest({ drawType, drawSize });
    if (iterations > 1)
      console.log(`${drawType} iteration: ${index + 1}`, { result });
    expect(result.success).toEqual(true);
  });
});

// test used in development utilizing positionActions extension to identify problem areas
it('can randomize drawPositions, randomize replacements, and complete drawType', () => {
  const iterations = 200;
  const positionActionErrorScenarios = [];
  const drawType = FIRST_MATCH_LOSER_CONSOLATION;
  const drawSize = 16;
  const byeLimit = 8;
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
});

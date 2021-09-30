import tournamentEngine from '../../sync';

import {
  ROUND_ROBIN,
  SINGLE_ELIMINATION,
} from '../../../constants/drawDefinitionConstants';

it.each([SINGLE_ELIMINATION, ROUND_ROBIN])(
  'can generate a tournament with events and draws',
  (drawType) => {
    const values = {
      drawType,
    };
    let result = tournamentEngine.generateDrawDefinition(values);
    expect(result.success).toEqual(true);
  }
);

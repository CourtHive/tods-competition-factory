import tieFormatDefaults from '../../generators/tieFormatDefaults';
import { validateLineUp } from '../../governors/eventGovernor/drawDefinitions/validateTeamLineUp';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { DOUBLES } from '../../../constants/matchUpTypes';

const tieFormat = tieFormatDefaults();
const collectionId = tieFormat.collectionDefinitions[0].collectionId;

// prettier-ignore
const scenarios = [
  // valid
  { lineUp: [], tieFormat, expectation: true },
  { lineUp: [{ participantId: 'someId', collectionAssignments: [] }], tieFormat, expectation: true, },
  { lineUp: [{ participantId: 'someId', collectionAssignments: [ { collectionPosition: 5, collectionId }, ], }], tieFormat, expectation: true },

  // invalid
  { lineUp: undefined, tieFormat, expectation: false },
  { lineUp: [''], tieFormat, expectation: false },
  { lineUp: [{}], tieFormat, expectation: false },
  { lineUp: [{ participantId: [] }], tieFormat, expectation: false },
  { lineUp: [{ participantId: '' }], tieFormat, expectation: false },
  { lineUp: [{ participantId: 'someId' }], tieFormat, expectation: false },
  { lineUp: [{ participantId: 'someId', collectionAssignments: '' }], tieFormat, expectation: false, },
  { lineUp: [{ participantId: 'someId', collectionAssignments: [''] }], tieFormat, expectation: false, },
  { lineUp: [{ participantId: 'someId', collectionAssignments: [{}] }], tieFormat, expectation: false, },
  { lineUp: [{ participantId: 'someId', collectionAssignments: [{ collectionPosition: '5' }] }], tieFormat, expectation: false, },
  { lineUp: [{ participantId: 'someId', collectionAssignments: [{ collectionPosition: 5 }] }], tieFormat, expectation: false, },
  { lineUp: [{ participantId: 'someId', collectionAssignments: [{ collectionPosition: 5, collectionId: '' }] }], tieFormat, expectation: false, },
  { lineUp: [{ participantId: 'someId', collectionAssignments: [{ collectionPosition: 5, collectionId: 'someId' }] }], tieFormat, expectation: false, },
  {
    lineUp: [
      { participantId: 'someId', collectionAssignments: [{ collectionPosition: 1, collectionId }] },
      { participantId: 'someId', collectionAssignments: [{ collectionPosition: 2, collectionId }] },
    ],
    tieFormat,
    expectation: false,
  },
];

it.each(scenarios)('can validate a lineUp', (scenario) => {
  const validation = validateLineUp(scenario);
  expect(validation.valid).toEqual(scenario.expectation);
  if (!validation.valid) {
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.error).toEqual(INVALID_VALUES);
  }
});

test('various tieFormat defaults', () => {
  let format = tieFormatDefaults({ namedFormat: 'COLLEGE7' });
  expect(format.winCriteria.valueGoal).toEqual(4);
  let doubles = format.collectionDefinitions.find(
    ({ matchUpType }) => matchUpType === DOUBLES
  );
  expect(doubles.collectionValue).toEqual(1);
  expect(doubles.matchUpValue).toBeUndefined();

  format = tieFormatDefaults({ namedFormat: 'COLLEGE9' });
  expect(format.winCriteria.valueGoal).toEqual(5);
  doubles = format.collectionDefinitions.find(
    ({ matchUpType }) => matchUpType === DOUBLES
  );
  expect(doubles.matchUpValue).toEqual(1);
  expect(doubles.collectionValue).toBeUndefined();
});

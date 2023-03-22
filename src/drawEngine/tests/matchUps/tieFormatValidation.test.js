import { validateTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/tieFormatUtilities';
import tieFormatDefaults from '../../../tournamentEngine/generators/tieFormatDefaults';
import { expect, it, test } from 'vitest';
import {
  fixtures,
  mocksEngine,
  scoreGovernor,
  tournamentEngine,
} from '../../..';

import { TEAM_DOUBLES_3_AGGREGATION } from '../../../constants/tieFormatConstants';
import { INVALID_TIE_FORMAT } from '../../../constants/errorConditionConstants';
import { FORMAT_STANDARD } from '../../../fixtures/scoring/matchUpFormats';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { tieFormats } from '../../../fixtures/scoring/tieFormats';
import { TEAM } from '../../../constants/eventConstants';

const matchUpFormat = FORMAT_STANDARD;

// prettier-ignore
const errorConditions = [
  undefined,
  { tieFormat: '' },
  { tieFormat: {} },
  { tieFormat: { winCriteria: 1 } },
  { tieFormat: { collectionDefinitions: '' } },
  { tieFormat: { winCriteria: {}, collectionDefinitions: [] } },
  { tieFormat: { winCriteria: { valueGoal: '' }, collectionDefinitions: [] } },
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [''] } },
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 1 }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id' }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1 }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, matchUpValue: 'a' }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValue: 'a' }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValueProfile: 'a' }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValueProfile: [] }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValueProfile: [''] }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValueProfile: [{}] }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValueProfile: [{ value: 1 }] }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValueProfile: [{ collectionPosition: 1 }] }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValueProfile: [{ value: 1, collectionPosition: '' }] }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValueProfile: [{ value: 1, collectionPosition: 2 }] }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 2, matchUpType: SINGLES, collectionValueProfile: [{ value: 1, collectionPosition: 2 }] }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [
    { collectionId: 'id', matchUpCount: 2, matchUpType: SINGLES, collectionValueProfile: [{ value: 1, collectionPosition: 2 }, { value: 1, collectionPosition: 2 }] }
  ]}},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, matchUpValue: 1, collectionGroupNumber: 'a' }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpFormat: 'invalidFormat', matchUpType: SINGLES, matchUpValue: 1 }] }},
];

it.each(errorConditions)('can validate tieFormats', (errorCondition) => {
  let result = validateTieFormat(errorCondition);
  expect(result.error).toEqual(INVALID_TIE_FORMAT);
  expect(result.context.errors.length).toEqual(1);
});

// prettier-ignore
const successConditions = [
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [] } },
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, matchUpValue: 1 }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValue: 1 }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValueProfile: [{ value: 1, collectionPosition: 1 }] }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, matchUpValue: 1, collectionGroupNumber: 1 }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpFormat, matchUpType: SINGLES, matchUpValue: 1 }] }},
];

it('validates fixture tieFormats', () => {
  const tieFormat = tieFormatDefaults({
    namedFormat: TEAM_DOUBLES_3_AGGREGATION,
  });
  expect(tieFormat.winCriteria.aggregateValue).toEqual(true);
  const result = validateTieFormat({ tieFormat });
  expect(result.valid).toEqual(true);
});

it.each(successConditions)('can validate tieFormats', (errorCondition) => {
  let result = validateTieFormat(errorCondition);
  expect(result.valid).toEqual(true);
  expect(result.errors.length).toEqual(0);
});

test('various tieFormat defaults', () => {
  let format = tieFormatDefaults({ namedFormat: 'COLLEGE_DEFAULT' });
  expect(format.winCriteria.valueGoal).toEqual(4);
  let result = validateTieFormat({ tieFormat: format });
  expect(result.valid).toEqual(true);

  let doubles = format.collectionDefinitions.find(
    ({ matchUpType }) => matchUpType === DOUBLES
  );
  expect(doubles.collectionValue).toEqual(1);
  expect(doubles.matchUpValue).toBeUndefined();
  expect(scoreGovernor.isValidMatchUpFormat(doubles.matchUpFormat)).toEqual(
    true
  );
  let singles = format.collectionDefinitions.find(
    ({ matchUpType }) => matchUpType === DOUBLES
  );
  expect(scoreGovernor.isValidMatchUpFormat(singles.matchUpFormat)).toEqual(
    true
  );

  format = tieFormatDefaults({ namedFormat: 'COLLEGE_JUCO' });
  expect(format.winCriteria.valueGoal).toEqual(5);
  result = validateTieFormat({ tieFormat: format });
  expect(result.valid).toEqual(true);

  doubles = format.collectionDefinitions.find(
    ({ matchUpType }) => matchUpType === DOUBLES
  );
  expect(doubles.matchUpValue).toEqual(1);
  expect(scoreGovernor.isValidMatchUpFormat(doubles.matchUpFormat)).toEqual(
    true
  );
  singles = format.collectionDefinitions.find(
    ({ matchUpType }) => matchUpType === DOUBLES
  );
  expect(scoreGovernor.isValidMatchUpFormat(singles.matchUpFormat)).toEqual(
    true
  );

  format = tieFormatDefaults({ namedFormat: 'COLLEGE_D3' });
  expect(format.winCriteria.valueGoal).toEqual(5);
  result = validateTieFormat({ tieFormat: format });
  expect(result.valid).toEqual(true);

  doubles = format.collectionDefinitions.find(
    ({ matchUpType }) => matchUpType === DOUBLES
  );
  expect(doubles.matchUpValue).toEqual(1);
  expect(doubles.collectionValue).toBeUndefined();
  expect(scoreGovernor.isValidMatchUpFormat(doubles.matchUpFormat)).toEqual(
    true
  );
  singles = format.collectionDefinitions.find(
    ({ matchUpType }) => matchUpType === DOUBLES
  );
  expect(scoreGovernor.isValidMatchUpFormat(singles.matchUpFormat)).toEqual(
    true
  );
});

it('can validate tieFormat fixtures', () => {
  let result = validateTieFormat({
    tieFormat: fixtures.tieFormats.USTA_SECTION_BATTLE,
    checkCollectionIds: false,
  });
  expect(result.valid).toEqual(true);

  result = validateTieFormat({
    tieFormat: fixtures.tieFormats.COLLEGE_D3,
    checkCollectionIds: false,
  });
  expect(result.valid).toEqual(true);

  result = validateTieFormat({
    tieFormat: fixtures.tieFormats.COLLEGE_DEFAULT,
    checkCollectionIds: false,
  });
  expect(result.valid).toEqual(true);

  result = validateTieFormat({
    tieFormat: fixtures.tieFormats.COLLEGE_JUCO,
    checkCollectionIds: false,
  });
  expect(result.valid).toEqual(true);
});

it('can use tieFormatName to generate TEAM events', () => {
  const {
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 2, eventType: TEAM, tieFormatName: 'COLLEGE_D3' },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const { event } = tournamentEngine.getEvent({ eventId });
  expect(event.tieFormat.winCriteria).toEqual(
    tieFormats.COLLEGE_D3.winCriteria
  );
  expect(event.tieFormat.tieFormatName).toEqual(
    tieFormats.COLLEGE_D3.tieFormatName
  );
});

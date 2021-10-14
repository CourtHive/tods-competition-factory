import { validateTieFormat } from '../../governors/matchUpGovernor/tieFormatUtilities';

import { INVALID_TIE_FORMAT } from '../../../constants/errorConditionConstants';
import { SINGLES } from '../../../constants/matchUpTypes';

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
];

it.each(errorConditions)('can validate tieFormats', (errorCondition) => {
  let result = validateTieFormat(errorCondition);
  expect(result.error).toEqual(INVALID_TIE_FORMAT);
  expect(result.errors.length).toEqual(1);
});

// prettier-ignore
const successConditions = [
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [] } },
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, matchUpValue: 1 }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValue: 1 }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, collectionValueProfile: [{ value: 1, collectionPosition: 1 }] }] }},
  { tieFormat: { winCriteria: { valueGoal: 1 }, collectionDefinitions: [{ collectionId: 'id', matchUpCount: 1, matchUpType: SINGLES, matchUpValue: 1, collectionGroupNumber: 1 }] }},
];

it.each(successConditions)('can validate tieFormats', (errorCondition) => {
  let result = validateTieFormat(errorCondition);
  expect(result.valid).toEqual(true);
  expect(result.errors.length).toEqual(0);
});

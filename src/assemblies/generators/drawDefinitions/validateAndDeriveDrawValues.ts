import { getAllowedDrawTypes, getAppliedPolicies } from '../../governors/queryGovernor';
import { ResultType, decorateResult } from '../../../global/functions/decorateResult';
import { checkValidEntries } from '../../../validators/checkValidEntries';
import { getDrawTypeCoercion } from './getDrawTypeCoercion';
import { getCoercedDrawType } from './getCoercedDrawType';
import { makeDeepCopy, nextPowerOf2 } from '../../tools';
import { ensureInt } from '../../../tools/ensureInt';

import { POLICY_TYPE_MATCHUP_ACTIONS, POLICY_TYPE_SEEDING } from '../../../constants/policyConstants';
import { INVALID_DRAW_TYPE, MISSING_DRAW_SIZE } from '../../../constants/errorConditionConstants';
import POLICY_SEEDING_DEFAULT from '../../../fixtures/policies/POLICY_SEEDING_DEFAULT';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  AD_HOC,
  DOUBLE_ELIMINATION,
  FEED_IN,
  MAIN,
  ROUND_ROBIN,
  ROUND_ROBIN_WITH_PLAYOFF,
} from '../../../constants/drawDefinitionConstants';

export function validateAndDeriveDrawValues(params): ResultType & {
  policyDefinitions?: PolicyDefinitions;
  appliedPolicies?: PolicyDefinitions;
  enforceGender?: boolean;
  seedingProfile?: string;
  drawSize?: number;
  drawType?: string;
} {
  const stack = 'validateAndDeriveDrawValues';
  const { appliedPolicies, policyDefinitions } = getPolicies(params);
  const enforceGender = getEnforceGender({ ...params, policyDefinitions, appliedPolicies });
  const consideredEntries = getConsideredEntries(params);

  const entriesAreValid = checkEntriesAreValid({ ...params, appliedPolicies });
  if (entriesAreValid?.error) return decorateResult({ result: entriesAreValid, stack });

  const drawSize = getDerivedDrawSize({ ...params, consideredEntries });
  const drawTypeResult = getDrawType({ ...params, appliedPolicies, policyDefinitions, drawSize });
  if (drawTypeResult.error) return decorateResult({ result: drawTypeResult, stack });
  const drawType = drawTypeResult.drawType;

  if (isNaN(drawSize) && drawType !== AD_HOC) {
    return decorateResult({
      result: { error: MISSING_DRAW_SIZE },
      stack,
    });
  }

  const seedingPolicy = policyDefinitions?.[POLICY_TYPE_SEEDING] ?? appliedPolicies?.[POLICY_TYPE_SEEDING];
  const seedingProfile =
    params.seedingProfile ?? seedingPolicy?.seedingProfile?.drawTypes?.[drawType] ?? seedingPolicy?.seedingProfile;

  // extend policyDefinitions only if a seedingProfile was specified in params
  if (params.seedingProfile) {
    if (!policyDefinitions[POLICY_TYPE_SEEDING]) {
      policyDefinitions[POLICY_TYPE_SEEDING] = {
        ...POLICY_SEEDING_DEFAULT[POLICY_TYPE_SEEDING],
      };
    }
    policyDefinitions[POLICY_TYPE_SEEDING].seedingProfile = seedingProfile;
  }

  const drawTypeAllowed = checkDrawTypeIsAllowed({ ...params, drawType });
  if (drawTypeAllowed?.error) return decorateResult({ result: drawTypeAllowed, stack });

  return { drawSize, drawType, enforceGender, seedingProfile, appliedPolicies, policyDefinitions };
}

function getDrawType(params) {
  const { policyDefinitions, appliedPolicies, enforceMinimumDrawSize = true, drawSize } = params;
  const drawTypeCoercion =
    params.drawTypeCoercion ??
    getDrawTypeCoercion({
      drawType: params.drawType,
      policyDefinitions,
      appliedPolicies,
    });

  const coercedDrawType = getCoercedDrawType({
    drawType: params.drawType,
    enforceMinimumDrawSize,
    drawTypeCoercion,
    drawSize,
  });
  if (coercedDrawType.error) return coercedDrawType;
  return { drawType: coercedDrawType.drawType };
}

function getConsideredEntries({ considerEventEntries = true, drawEntries, eventEntries, qualifyingOnly }) {
  return ((qualifyingOnly && []) || drawEntries || (considerEventEntries ? eventEntries : [])).filter(
    ({ entryStage }) => !entryStage || entryStage === MAIN,
  );
}

function getPolicies(params) {
  const { tournamentRecord, event } = params;
  const appliedPolicies =
    getAppliedPolicies({
      tournamentRecord,
      event,
    }).appliedPolicies ?? {};

  const policyDefinitions = makeDeepCopy(params.policyDefinitions ?? {}, false, true);
  return { appliedPolicies, policyDefinitions };
}

function getEnforceGender({ enforceGender, policyDefinitions, appliedPolicies }) {
  return (
    enforceGender ??
    policyDefinitions?.[POLICY_TYPE_MATCHUP_ACTIONS]?.participants?.enforceGender ??
    appliedPolicies?.[POLICY_TYPE_MATCHUP_ACTIONS]?.participants?.enforceGender
  );
}

function checkEntriesAreValid(params) {
  const { consideredEntries, appliedPolicies, policyDefinitions, enforceGender, participantMap, participants, event } =
    params;
  // entries participantTypes must correspond with eventType
  // this is only possible if the event is provided
  return (
    event &&
    participants &&
    checkValidEntries({
      consideredEntries,
      policyDefinitions,
      appliedPolicies,
      participantMap,
      enforceGender,
      participants,
      event,
    })
  );
}

function getDerivedDrawSize(params) {
  const derivedDrawSize =
    !params.drawSize &&
    params.consideredEntries.length &&
    ![AD_HOC, DOUBLE_ELIMINATION, FEED_IN, ROUND_ROBIN, ROUND_ROBIN_WITH_PLAYOFF].includes(params.drawType ?? '') &&
    nextPowerOf2(params.consideredEntries.length);

  // coersion of drawSize and seedsCount to integers
  return derivedDrawSize || (params.drawSize && ensureInt(params.drawSize)) || false; // required for isNaN check
}

function checkDrawTypeIsAllowed(params) {
  const { tournamentRecord, event, ignoreAllowedDrawTypes, drawType } = params;
  const allowedDrawTypes =
    !ignoreAllowedDrawTypes &&
    tournamentRecord &&
    getAllowedDrawTypes({
      tournamentRecord,
      categoryType: event?.category?.categoryType,
      categoryName: event?.category?.categoryName,
    });
  if (allowedDrawTypes?.length && !allowedDrawTypes.includes(drawType)) {
    return { error: INVALID_DRAW_TYPE };
  }

  return { ...SUCCESS };
}

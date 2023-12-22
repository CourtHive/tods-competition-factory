import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { addExtension } from '../addExtension';
import { removeExtension } from '../removeExtension';

import { APPLIED_POLICIES } from '../../../constants/extensionConstants';
import { TournamentRecords } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  POLICY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentTypes';

type RemovePolicyArgs = {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  tournamentId?: string;
  policyType: string;
  event?: Event;
};
export function removePolicy(params: RemovePolicyArgs) {
  const checkParams = checkRequiredParameters(params, [
    {
      policyType: true,
      _anyOf: {
        tournamentRecords: true,
        tournamentRecord: true,
        drawDefinition: true,
        event: true,
      },
    },
  ]);
  if (checkParams.error) return checkParams;
  let policyRemoved;

  const element =
    params.drawDefinition ??
    params.event ??
    ((params.tournamentId || !params.tournamentRecords) &&
      params.tournamentRecord);
  if (element) {
    return policyDeletion(params, element);
  } else if (params.tournamentRecords) {
    const tournamentIds = Object.keys(params.tournamentRecords);
    if (!tournamentIds.length) return { error: MISSING_TOURNAMENT_RECORD };
    for (const tournamentId of tournamentIds) {
      const tournamentRecord = params.tournamentRecords[tournamentId];
      const result = policyDeletion(params, tournamentRecord);
      if (result.error) return result;
      policyRemoved = true;
    }
  } else {
    return { error: MISSING_TOURNAMENT_RECORD };
  }

  return policyRemoved ? { ...SUCCESS } : { error: POLICY_NOT_FOUND };
}

function policyDeletion(params, element) {
  const appliedPolicies = getAppliedPolicies(params).appliedPolicies ?? {};
  if (appliedPolicies[params.policyType]) {
    delete appliedPolicies[params.policyType];

    if (Object.keys(appliedPolicies).length) {
      const extension = { name: APPLIED_POLICIES, value: appliedPolicies };
      addExtension({ element, extension });
    } else {
      removeExtension({ element, name: APPLIED_POLICIES });
    }
    return { ...SUCCESS };
  }

  return { error: POLICY_NOT_FOUND };
}

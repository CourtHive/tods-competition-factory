import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { addExtension } from '../addExtension';

import { EXISTING_POLICY_TYPE } from '../../../constants/errorConditionConstants';
import { APPLIED_POLICIES } from '../../../constants/extensionConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentTypes';
import {
  PolicyDefinitions,
  TournamentRecords,
} from '../../../types/factoryTypes';

type AttachPoliciesArgs = {
  tournamentRecords?: TournamentRecords;
  policyDefinitions: PolicyDefinitions;
  drawDefinition?: DrawDefinition;
  tournamentRecord?: Tournament;
  allowReplacement?: boolean;
  tournamentId?: string;
  event?: Event;
};

export function attachPolicies(params: AttachPoliciesArgs): ResultType {
  const checkParams = checkRequiredParameters(params, [
    {
      _anyOf: {
        tournamentRecords: true,
        tournamentRecord: true,
        drawDefinition: true,
        event: true,
      },
      policyDefinitions: true,
    },
  ]);
  if (checkParams.error) return checkParams;

  const element =
    params.drawDefinition ??
    params.event ??
    (params.tournamentId && params.tournamentRecord);

  if (element) {
    const result = policyAttachement(params, element);
    if (result.error) return result;
    if (params.drawDefinition) {
      modifyDrawNotice({
        drawDefinition: params.drawDefinition,
        tournamentId: params.tournamentId,
      });
    }
  } else if (params.tournamentRecords) {
    for (const tournamentRecord of Object.values(params.tournamentRecords)) {
      policyAttachement(params, tournamentRecord);
    }
  }

  return { ...SUCCESS };
}

function policyAttachement(params, element) {
  const appliedPolicies = getAppliedPolicies(params).appliedPolicies ?? {};
  if (!element.extensions) element.extensions = [];
  let policiesApplied = 0;

  Object.keys(params.policyDefinitions).forEach((policyType) => {
    if (!appliedPolicies[policyType] || params.allowReplacement) {
      appliedPolicies[policyType] = params.policyDefinitions[policyType];
      policiesApplied++;
    }
  });

  if (policiesApplied) {
    const extension = { name: APPLIED_POLICIES, value: appliedPolicies };
    return addExtension({ element, extension });
  }

  return { error: EXISTING_POLICY_TYPE };
}

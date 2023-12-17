import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { addExtension } from '../addExtension';

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
  event?: Event;
};

export function attachPolicies(params: AttachPoliciesArgs): ResultType {
  const checkParams = checkRequiredParameters(params, [
    {
      _oneOf: {
        tournamentRecords: true,
        tournamentRecord: true,
        drawDefinition: true,
        event: true,
      },
      policyDefinitions: true,
    },
  ]);
  if (checkParams.error) return checkParams;

  if (params.tournamentRecords) {
    for (const tournamentRecord of Object.values(params.tournamentRecords)) {
      policyAttachement(params, tournamentRecord);
    }
  } else {
    const element =
      params.tournamentRecord ?? params.drawDefinition ?? params.event;
    policyAttachement(params, element);
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
    addExtension({ element, extension });
  }
}

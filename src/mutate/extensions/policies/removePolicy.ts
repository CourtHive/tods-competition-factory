import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { addExtension } from '../addExtension';
import { removeExtension } from '../removeExtension';

import { APPLIED_POLICIES } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TournamentRecords } from '../../../types/factoryTypes';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentTypes';

type RemovePolicyArgs = {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  event?: Event;
  policyType: string;
};
export function removePolicy(params: RemovePolicyArgs) {
  const checkParams = checkRequiredParameters(params, [
    {
      policyType: true,
      _oneOf: {
        tournamentRecords: true,
        tournamentRecord: true,
        drawDefinition: true,
        event: true,
      },
    },
  ]);
  if (checkParams.error) return checkParams;

  if (params.tournamentRecords) {
    for (const tournamentRecord of Object.values(params.tournamentRecords)) {
      policyDeletion(params, tournamentRecord);
    }
  } else {
    const element =
      params.tournamentRecord ?? params.drawDefinition ?? params.event;
    policyDeletion(params, element);
  }

  return { ...SUCCESS };
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
  }
}

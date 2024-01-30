import { isValidExtension } from '../../validators/isValidExtension';
import { decorateResult } from '../../functions/global/decorateResult';

import { SUCCESS } from '@Constants/resultConstants';
import { ErrorType, INVALID_VALUES, MISSING_VALUE } from '@Constants/errorConditionConstants';

import { TournamentRecords } from '../../types/factoryTypes';
import { Extension } from '../../types/tournamentTypes';

type AddExtensionArgs = {
  tournamentRecords?: TournamentRecords;
  activeTournamentId?: string;
  creationTime?: boolean;
  tournamentId?: string;
  extension: Extension;
  discover?: boolean;
  element?: any;
};

export function addExtension(params?: AddExtensionArgs): {
  success?: boolean;
  error?: ErrorType;
} {
  if (typeof params !== 'object') return { error: MISSING_VALUE };
  const stack = 'addExtension';

  if (params?.element && typeof params.element !== 'object')
    return decorateResult({ result: { error: INVALID_VALUES }, stack });

  if (!isValidExtension({ extension: params.extension }))
    return decorateResult({
      result: { error: INVALID_VALUES, info: 'invalid extension' },
      stack,
    });

  if (!params.element) {
    if (params.discover && !params.tournamentId && params.tournamentRecords) {
      for (const tournamentRecord of Object.values(params.tournamentRecords)) {
        const result = addExtension({
          extension: params.extension,
          element: tournamentRecord,
        });
        if (result.error) return decorateResult({ result, stack });
      }
      return { ...SUCCESS };
    } else {
      return decorateResult({ result: { error: MISSING_VALUE }, stack });
    }
  }

  if (!params.element.extensions) params.element.extensions = [];

  const creationTime = params?.creationTime ?? true;

  if (creationTime) {
    const createdAt = new Date().toISOString();
    Object.assign(params.extension, { createdAt });
  }

  const existingExtension = params.element.extensions.find(({ name }) => name === params.extension.name);
  if (existingExtension) {
    existingExtension.value = params.extension.value;
  } else if (params.extension.value) {
    params.element.extensions.push(params.extension);
  }

  return { ...SUCCESS };
}

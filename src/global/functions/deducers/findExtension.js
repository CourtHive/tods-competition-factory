import {
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function findExtension({ element, name }) {
  if (!element || !name) return { error: MISSING_VALUE };
  if (!Array.isArray(element.extensions)) return { error: NOT_FOUND };

  const extension = element.extensions.find(
    (extension) => extension?.name === name
  );
  if (!extension) return { error: NOT_FOUND };

  return { extension };
}

import { ResultType, decorateResult } from '../global/functions/decorateResult';
import { MISSING_VALUE, NOT_FOUND } from '../constants/errorConditionConstants';
import { Extension } from '../types/tournamentTypes';

const stack = 'extensionQueries';

type FindExtensionType = {
  params?: { [key: string]: any };
  discover?: boolean | string[];
  element: any;
  name: string;
};

type ExtensionResult = ResultType & {
  extension?: Extension;
};

export function findExtension({
  discover, // boolean or array of keys to discover extensions on specified params
  element,
  name,
  ...params
}: FindExtensionType): ExtensionResult {
  if (!element || !name) {
    if (discover && params) {
      const attr = Object.keys(params)
        .filter(
          (key) =>
            typeof discover === 'boolean' ||
            (Array.isArray(discover) && discover.includes(key))
        )
        .find((key) => {
          if (!Array.isArray(params[key].extensions)) return false;
          return params[key].extensions.find(
            (extension) => extension?.name === name
          );
        });
      const extension =
        attr &&
        params[attr].extensions.find((extension) => extension?.name === name);
      const info = !extension ? NOT_FOUND : undefined;

      return { extension, info };
    }
    return decorateResult({ result: { error: MISSING_VALUE }, stack });
  }

  if (!Array.isArray(element.extensions)) return { info: 'no extensions' };

  const extension = element.extensions.find(
    (extension) => extension?.name === name
  );

  const info = !extension ? NOT_FOUND : undefined;

  return { extension, info };
}

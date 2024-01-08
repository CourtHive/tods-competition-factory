import { governors } from '../../../../../assemblies/governors';
import { askEngine } from '../../../../..';

const methods = {
  ...governors.reportGovernor,
  ...governors.queryGovernor,
};

askEngine.importMethods(methods);

export const queryEngine = askEngine;
export default askEngine;

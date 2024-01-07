import { governors, askEngine } from 'tods-competition-factory';

const methods = {
  ...governors.reportGovernor,
  ...governors.queryGovernor
};

askEngine.importMethods(methods);

export const queryEngine = askEngine;
export default askEngine;

import * as queryGovernor from '../../../assemblies/governors/queryGovernor';
import ask from '../../../assemblies/engines/ask';

ask.importMethods(queryGovernor, true, 1);

export const queryEngine = ask;
export default ask;

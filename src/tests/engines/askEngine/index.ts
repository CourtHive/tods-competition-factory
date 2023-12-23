import queryGovernor from '../../../tournamentEngine/governors/queryGovernor';
import ask from '../../../assemblies/engines/ask';

const methods = {
  ...queryGovernor,
};

ask.importMethods(methods);

export const askEngine = ask;
export default ask;

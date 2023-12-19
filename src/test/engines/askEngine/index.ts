import queryGovernor from '../../../tournamentEngine/governors/queryGovernor';
import askEngine from '../../../assemblies/engines/ask';

const methods = {
  ...queryGovernor,
};

askEngine.importMethods(methods);

export default askEngine;

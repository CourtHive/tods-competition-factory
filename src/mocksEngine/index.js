import mocksGovernor from './governors/mocksGovernor';

export const mocksEngine = (async function () {
  const fx = {
    version: () => {
      return '@VERSION@';
    },
  };

  await importGovernors([mocksGovernor]);

  return fx;

  // enable Middleware
  async function engineInvoke(fx, params) {
    return await fx({ ...params });
  }

  async function importGovernors(governors) {
    for (const governor of governors) {
      const governorMethods = Object.keys(governor);
      for (const governorMethod of governorMethods) {
        fx[governorMethods] = async (params) => {
          try {
            const engineResult = await engineInvoke(
              governor[governorMethods],
              params
            );
            return engineResult;
          } catch (err) {
            console.log('%c ERROR', 'color: orange', { err });
          }
        };
      }
    }
  }
})();

export default mocksEngine;

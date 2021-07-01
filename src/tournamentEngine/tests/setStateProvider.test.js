import { setStateProvider } from '../../global/globalState';
import syncGlobalState from '../../global/syncGlobalState';

it('can set state provider', () => {
  let result = setStateProvider(syncGlobalState);
  expect(result.success).toEqual(true);

  try {
    result = setStateProvider();
  } catch (err) {
    expect(err).not.toBeUndefined();
  }
  try {
    result = setStateProvider({});
  } catch (err) {
    expect(err).not.toBeUndefined();
  }
});

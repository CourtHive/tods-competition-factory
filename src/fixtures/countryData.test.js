import { countries, flagIOC } from './countryData';

it('can convert ioc to iso and iso to flag characters', () => {
  const iocs = countries.map(({ ioc }) => ioc).filter((f) => f);
  iocs.forEach((ioc) => {
    expect(flagIOC(ioc)).not.toBeUndefined();
  });
});

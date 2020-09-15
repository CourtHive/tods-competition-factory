import { tournamentEngine } from '../../tournamentEngine';

import { categoryTypes } from '../../constants/categoryTypes';

it('can set tournament names', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result?.success).toEqual(true);

  const tournamentName = 'CourtHive Challenge';
  result = tournamentEngine.setTournamentName({ name: tournamentName });
  expect(result?.success).toEqual(true);

  let tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.name).toEqual(tournamentName);

  result = tournamentEngine.setTournamentName({ formalName: tournamentName });
  expect(result?.success).toEqual(true);

  tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.formalName).toBeUndefined();

  result = tournamentEngine.setTournamentName({ formalName: 'Formal Name' });
  expect(result?.success).toEqual(true);

  tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.formalName).toEqual('Formal Name');

  result = tournamentEngine.setTournamentName({
    promotionalName: tournamentName,
  });
  expect(result?.success).toEqual(true);

  tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.promotionalName).toBeUndefined();

  result = tournamentEngine.setTournamentName({
    formalName: 'Promotional Name',
  });
  expect(result?.success).toEqual(true);

  tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.formalName).toEqual('Promotional Name');
});

it('can set tournament categories', () => {
  let result = tournamentEngine.newTournamentRecord();
  expect(result?.success).toEqual(true);

  const categories = [
    {
      categoryName: 'U18',
      type: categoryTypes.AGE,
    },
    {
      categoryName: 'U16',
      type: categoryTypes.AGE,
    },
    {
      categoryName: 'WTN',
      type: categoryTypes.RATING,
    },
    {
      categoryName: 'FAILURE',
    },
  ];
  result = tournamentEngine.setTournamentCategories({ categories });
  expect(result?.success).toEqual(true);

  const tournamentRecord = tournamentEngine.getState();
  expect(tournamentRecord.tournamentCategories.length).toEqual(3);
});

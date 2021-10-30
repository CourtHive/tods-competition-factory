import { mocksEngine } from '../../..';

// prettier-ignore
const scenarios = [
  { category: { ageCategoryCode: 'U18' }, expectation: { year: '2003' } },
  { category: { ageCategoryCode: 'U16' }, expectation: { year: '2005' } },
  { category: { ageCategoryCode: '18U' }, expectation: { year: '2007' } },
];

test.each(scenarios)(
  'can generate partiicpants with category details',
  (scenario) => {
    const tournamentStartDate = '2022-01-01';
    const tournamentEndDate = '2022-01-04';

    const participantsProfile = {
      category: scenario.category,
      participantsCount: 1,
      tournamentStartDate,
      tournamentEndDate,
    };

    const {
      participants: [participant],
    } = mocksEngine.generateParticipants(participantsProfile);

    if (participant) {
      // console.log(participant);
    }
  }
);

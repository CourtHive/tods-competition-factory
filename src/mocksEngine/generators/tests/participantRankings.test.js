import mocksEngine from '../..';

const rankingsScenarios = [
  { category: { categoryName: 'U18' } },
  { category: { categoryName: '18U' } },
];

test.each(rankingsScenarios)(
  'it can generate rankings for participants',
  (scenario) => {
    const participantsProfile = {
      category: scenario.category,
      participantsCount: 1,
    };

    const {
      participants: [participant],
    } = mocksEngine.generateParticipants(participantsProfile);

    console.log(participant);
  }
);

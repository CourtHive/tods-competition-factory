import { mocksEngine } from '../../..';

import { AGE } from '../../../constants/eventConstants';

it('can generate partiicpants with category details', () => {
  const participantsProfile = {
    participantsCount: 1,
    category: {
      ageCategoryCode: 'U18',
      categoryName: 'U18',
      type: AGE,
    },
  };
  const {
    participants: [participant],
  } = mocksEngine.generateParticipants(participantsProfile);

  console.log(participant);
});

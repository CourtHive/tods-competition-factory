import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { POLICY_TYPE_AVOIDANCE } from '../../../constants/policyConstants';

it('properly handles qualifiers with avoidances', () => {
  const avoidancePolicy = {
    policyAttributes: [
      { key: 'individualParticipants.person.addresses.country' },
      { key: 'person.addresses.country' },
    ],
  };
  const policyDefinitions = { [POLICY_TYPE_AVOIDANCE]: avoidancePolicy };
  const drawProfiles = [
    {
      qualifiersCount: 8,
      drawSize: 64,
    },
  ];

  let result = mocksEngine.generateTournamentRecord({
    policyDefinitions,
    drawProfiles,
  });

  console.log(result);

  const {
    tournamentRecord,
    // eventIds: [eventId],
  } = result;

  tournamentEngine.setState(tournamentRecord);

  // const event = tournamentEngine.getEvent({ eventId }).event;
  console.log(tournamentRecord.extensions);
});

import { getAttributeGroupings } from '../../../drawEngine/getters/getAttributeGrouping';
import { fixtures, participantTypes } from '../../..';
import { generateParticipants } from '../../../mocksEngine/generators/generateParticipants';

const { PAIR } = participantTypes;

it('can generate groupings accurately', () => {
  const { participants } = generateParticipants({
    nationalityCodesCount: 10,
    addressProps: {
      citiesCount: 10,
      statesCount: 10,
      postalCodesCount: 10,
    },

    participantsCount: 32,
    participantType: PAIR,
    inContext: true,
  });

  const doublesParticipants = participants.filter(
    (participant) => participant.participantType === PAIR
  );

  const doublesParticipantsIds = doublesParticipants.map(
    (participant) => participant.participantId
  );

  const doublesParticipantsNationalityCodes = Object.assign(
    {},
    ...doublesParticipants.map((participant) => {
      const nationalityCodes = participant.individualParticipants.map(
        (individualParticipant) => {
          return individualParticipant.person.nationalityCode;
        }
      );
      return { [participant.participantId]: nationalityCodes };
    })
  );

  expect(Object.keys(doublesParticipantsNationalityCodes).length).toEqual(32);

  const policyAttributes =
    fixtures.policies.POLICY_AVOIDANCE_COUNTRY.avoidance.policyAttributes;
  const groupings = getAttributeGroupings({
    participants,
    policyAttributes,
    targetParticipantIds: doublesParticipantsIds,
  });

  Object.keys(groupings).forEach((nationalityCode) => {
    const groupingParticipantIds = groupings[nationalityCode];
    groupingParticipantIds.forEach((participantId) => {
      const includesNationalityCode =
        doublesParticipantsNationalityCodes[participantId].includes(
          nationalityCode
        );
      expect(includesNationalityCode).toEqual(true);
    });
  });
});

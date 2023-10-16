import { stringSort } from '../../../global/sorting/stringSort';
import mocksEngine from '../../../mocksEngine';
import { unique } from '../../../utilities';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { FEMALE, MALE, MIXED } from '../../../constants/genderConstants';
import { DOUBLES, SINGLES } from '../../../constants/eventConstants';

it('supports modifying event gender, name and eventType', () => {
  const drawSize = 16;

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      {
        drawProfiles: [{ drawSize, uniqueParticipants: true }],
        eventType: SINGLES,
        eventName: MIXED,
        eventId: MIXED,
        gender: MIXED,
      },
      {
        drawProfiles: [{ drawSize, uniqueParticipants: true }],
        eventType: SINGLES,
        eventName: FEMALE,
        eventId: FEMALE,
        gender: FEMALE,
      },
      {
        drawProfiles: [{ drawSize, uniqueParticipants: true }],
        eventType: SINGLES,
        eventName: MALE,
        eventId: MALE,
        gender: MALE,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const participants = tournamentEngine.getParticipants({
    withEvents: true,
  }).participants;

  const profiles = [
    {
      genderModification: { MIXED: true, MALE: false, FEMALE: false },
      genders: [FEMALE, MALE],
      eventId: MIXED,
    },
    {
      genderModification: { MIXED: true, MALE: true, FEMALE: false },
      genders: [MALE],
      eventId: MALE,
    },
    {
      genderModification: { MIXED: true, MALE: false, FEMALE: true },
      genders: [FEMALE],
      eventId: FEMALE,
    },
  ];

  profiles.forEach((profile) => {
    const event = tournamentEngine.getEvent(profile).event;
    const eventId = event.eventId;

    expect(event.eventName).toEqual(eventId);
    const enteredParticipantIds = event.entries.map(
      ({ participantId }) => participantId
    );
    const enteredParticipantGenders = unique(
      participants
        .filter(({ participantId }) =>
          enteredParticipantIds.includes(participantId)
        )
        .map(({ person }) => person.sex)
    ).sort(stringSort);

    expect(enteredParticipantGenders).toEqual(profile.genders);

    Object.keys(profile.genderModification).forEach((gender) => {
      const expectation = profile.genderModification[gender];
      const updatedEventName = `${eventId}-modified`;
      const result = tournamentEngine.modifyEvent({
        eventUpdates: { eventName: updatedEventName, gender },
        eventId,
      });
      expect(!!result.success).toEqual(expectation);
      const updatedEvent = tournamentEngine.getEvent(profile).event;
      expect(updatedEvent.eventName).toEqual(updatedEventName);
    });

    const result = tournamentEngine.modifyEvent({
      eventUpdates: { eventType: DOUBLES },
      eventId,
    });
    expect(result.error).not.toBeUndefined();
  });
});

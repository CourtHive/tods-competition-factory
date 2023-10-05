import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../sync';
import { expect, it } from 'vitest';

import { INVALID_TIE_FORMAT } from '../../../../constants/errorConditionConstants';
import { MALE } from '../../../../constants/genderConstants';
import { TEAM } from '../../../../constants/eventConstants';
import {
  DOMINANT_DUO,
  DOMINANT_DUO_MIXED,
} from '../../../../constants/tieFormatConstants';

it('will throw errors if gendered tieFormat not aligned with event gender', () => {
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    eventProfiles: [
      {
        drawProfiles: [{ drawSize: 16, generate: false }],
        eventType: TEAM,
        gender: MALE,
      },
    ],
  });

  const result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.gender).toEqual(MALE);

  const d1 = tournamentEngine.generateDrawDefinition({
    tieFormatName: DOMINANT_DUO,
    eventId,
  });
  expect(d1.success).toEqual(true);

  const d2 = tournamentEngine.generateDrawDefinition({
    tieFormatName: DOMINANT_DUO_MIXED,
    eventId,
  });
  expect(d2.error).toEqual(INVALID_TIE_FORMAT);
});

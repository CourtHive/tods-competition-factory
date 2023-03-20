import { getParticipantId } from '../../../global/functions/extractors';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { NO_STAGE_SPACE_AVAILABLE_FOR_ENTRY_STATUS } from '../../../constants/errorConditionConstants';
import { WILDCARD } from '../../../constants/entryStatusConstants';

it('generateDrawDefinition can ignoreStageSpace', () => {
  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 8, generate: false }],
  });

  tournamentEngine.setState(tournamentRecord);

  let { event } = tournamentEngine.getEvent({ eventId });
  const participantIds = event.entries.map(getParticipantId);

  let result = tournamentEngine.modifyEntriesStatus({
    entryStatus: WILDCARD,
    participantIds,
    eventId,
  });
  expect(result.success).toEqual(true);

  let {
    flightProfile: {
      flights: [flight],
    },
  } = tournamentEngine.getFlightProfile({ eventId });

  result = tournamentEngine.generateDrawDefinition(flight);
  expect(result.error).toEqual(NO_STAGE_SPACE_AVAILABLE_FOR_ENTRY_STATUS);

  result = tournamentEngine.generateDrawDefinition({
    ignoreStageSpace: true,
    ...flight,
  });
  expect(result.success).toEqual(true);
  expect(
    result.drawDefinition.structures[0].positionAssignments
      .map(getParticipantId)
      .filter(Boolean).length
  ).toEqual(8);

  // it is possible to generate a drawDefinition of all wildcards by using eventId directly
  // but no participants will be assigned to any positions
  result = tournamentEngine.generateDrawDefinition({ eventId });
  expect(result.drawDefinition).not.toBeUndefined();
  expect(result.success).toEqual(true);
  expect(
    result.drawDefinition.structures[0].positionAssignments
      .map(getParticipantId)
      .filter(Boolean).length
  ).toEqual(0);
});

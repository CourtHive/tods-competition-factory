import { getMatchUpContextIds } from '../../../query/matchUp/getMatchUpContextIds';
import { getMatchUpType } from '../../../query/matchUp/getMatchUpType';
import tournamentEngineAsync from '../../async';
import mocksEngine from '../../../mocksEngine';
import tournamentEngineSync from '../../../tests/engines/tournamentEngine';
import { expect, test } from 'vitest';

import { MISSING_VALUE } from '../../../constants/errorConditionConstants';
import { INDIVIDUAL } from '../../../constants/participantConstants';
import { SINGLES } from '../../../constants/matchUpTypes';

const asyncTournamentEngine = tournamentEngineAsync(true);

test.each([tournamentEngineSync, asyncTournamentEngine])(
  'can create flightProfile on addDrawDefinition',
  async (tournamentEngine) => {
    const { tournamentRecord } = mocksEngine.generateTournamentRecord();
    const eventName = 'Test Event';
    const event = { eventName, eventId: 'customId' };

    await tournamentEngine.setState(tournamentRecord);
    let result = await tournamentEngine.addEvent({ event });
    const { event: eventResult } = result;
    expect(result.success).toEqual(true);

    const { eventId } = eventResult;
    expect(eventId).toEqual('customId');

    const { participants } = await tournamentEngine.getParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });
    const participantIds = participants.map((p) => p.participantId);
    result = await tournamentEngine.addEventEntries({
      participantIds,
      eventId,
    });
    expect(result.success).toEqual(true);

    const { drawDefinition } = await tournamentEngine.generateDrawDefinition({
      eventId,
    });
    result = await tournamentEngine.addDrawDefinition({
      drawDefinition,
      eventId,
    });
    expect(result.success).toEqual(true);

    const { flightProfile } = await tournamentEngine.getFlightProfile({
      eventId,
    });
    expect(flightProfile.flights.length).toEqual(1);

    result = await tournamentEngine.tournamentMatchUps();
    const matchUp = result.upcomingMatchUps[0];
    let { matchUpType } = getMatchUpType({ matchUp });
    expect(matchUpType).toEqual(SINGLES);

    // now test that matchUpType can be inferred from only sides with participants
    ({ matchUpType } = getMatchUpType({
      matchUp: {
        sides: matchUp.sides,
      },
    }));
    expect(matchUpType).toEqual(SINGLES);

    result = getMatchUpContextIds({
      matchUps: result.upcomingMatchUps,
      matchUpId: matchUp.matchUpId,
    });
    expect(result.drawId).not.toBeUndefined();
    expect(result.eventId).not.toBeUndefined();
    expect(result.structureId).not.toBeUndefined();
    expect(result.tournamentId).not.toBeUndefined();

    result = await tournamentEngine.getEvent({ eventId });
    expect(result.event.eventId).toEqual('customId');

    result = await tournamentEngine.deleteEvents();
    expect(result.error).toEqual(MISSING_VALUE);

    result = await tournamentEngine.deleteEvents({ eventIds: [] });
    expect(result.success).toEqual(true);

    // successful because not found
    result = await tournamentEngine.deleteEvents({ eventIds: ['bogus'] });
    expect(result.success).toEqual(true);

    result = await tournamentEngine.deleteEvents({ eventIds: [eventId] });
    expect(result.success).toEqual(true);
  }
);

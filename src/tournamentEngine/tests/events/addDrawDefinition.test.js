import { getMatchUpType } from '../../../drawEngine/accessors/matchUpAccessor';
import drawEngine from '../../../drawEngine/sync';
import tournamentEngineAsync from '../../async';
import mocksEngine from '../../../mocksEngine';
import tournamentEngineSync from '../../sync';

import { INDIVIDUAL } from '../../../constants/participantTypes';
import { SINGLES } from '../../../constants/matchUpTypes';
import { MISSING_VALUE } from '../../../constants/errorConditionConstants';

const asyncTournamentEngine = tournamentEngineAsync(true);

test.each([tournamentEngineSync, asyncTournamentEngine])(
  'can create flightProfile on addDrawDefinition',
  async (tournamentEngine) => {
    const { tournamentRecord } = mocksEngine.generateTournamentRecord();
    const eventName = 'Test Event';
    const event = { eventName };

    await tournamentEngine.setState(tournamentRecord);
    let result = await tournamentEngine.addEvent({ event });
    let { event: eventResult } = result;
    expect(result.success).toEqual(true);

    const { eventId } = eventResult;

    const { tournamentParticipants } =
      await tournamentEngine.getTournamentParticipants({
        participantFilters: { participantTypes: [INDIVIDUAL] },
      });
    const participantIds = tournamentParticipants.map((p) => p.participantId);
    result = await tournamentEngine.addEventEntries({
      eventId,
      participantIds,
    });
    expect(result.success).toEqual(true);

    const { drawDefinition } = await tournamentEngine.generateDrawDefinition({
      eventId,
    });
    result = await tournamentEngine.addDrawDefinition({
      eventId,
      drawDefinition,
    });
    expect(result.success).toEqual(true);

    let { flightProfile } = await tournamentEngine.getFlightProfile({
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

    result = drawEngine.getMatchUpContextIds({
      matchUps: result.upcomingMatchUps,
      matchUpId: matchUp.matchUpId,
    });
    expect(result.drawId).not.toBeUndefined();
    expect(result.eventId).not.toBeUndefined();
    expect(result.structureId).not.toBeUndefined();
    expect(result.tournamentId).not.toBeUndefined();

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

import { participantScaleItem } from '../../accessors/participantScaleItem';
import { getParticipantId } from '../../../global/functions/extractors';
import { generateRange } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import { TEAM_PARTICIPANT } from '../../../constants/participantConstants';
import { SINGLES, TEAM_EVENT } from '../../../constants/eventConstants';
import { UNGROUPED } from '../../../constants/entryStatusConstants';
import { COMPETITOR } from '../../../constants/participantRoles';
import { RANKING } from '../../../constants/scaleConstants';
import {
  INVALID_PARTICIPANT_IDS,
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

const EVENT_NAME = 'Team Event';

it('can automatically assign participants to teams using individualParticipantIds and scaleAttributes', () => {
  let participantsCount = 100;

  const eventProfiles = [{ eventName: EVENT_NAME, eventType: TEAM_EVENT }];
  const participantsProfile = {
    scaledParticipantsCount: participantsCount,
    category: { categoryName: '18U' },
    rankingRange: [1, 100],
    participantsCount,
  };

  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile,
    eventProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const individualParticipantIds =
    tournamentRecord.participants.map(getParticipantId);

  let result = tournamentEngine.addEventEntries({
    participantIds: individualParticipantIds,
    eventId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);

  result = tournamentEngine.addEventEntries({
    participantIds: individualParticipantIds,
    entryStatus: UNGROUPED,
    eventId,
  });
  expect(result.success).toEqual(true);

  let { event } = tournamentEngine.getEvent({ eventId });
  expect(event.entries.length).toEqual(participantsCount);

  let teamParticipants = generateRange(0, 8).map((i) => ({
    participantName: `Team ${i + 1}`,
    participantType: TEAM_PARTICIPANT,
    participantRole: COMPETITOR,
  }));

  result = tournamentEngine.addParticipants({
    participants: teamParticipants,
  });
  expect(result.success).toEqual(true);

  const teamParticipantIds = teamParticipants.map(getParticipantId);

  result = tournamentEngine.addEventEntries({
    participantIds: teamParticipantIds,
    eventId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.scaledTeamAssignment({
    individualParticipantIds,
    teamParticipantIds,
  });
  expect(result.error).toEqual(MISSING_VALUE);

  result = tournamentEngine.scaledTeamAssignment({
    individualParticipantIds,
    teamParticipantIds,
    scaleAttributes: {},
  });
  expect(result.error).toEqual(INVALID_VALUES);

  const scaleAttributes = {
    scaleType: RANKING,
    eventType: SINGLES,
    scaleName: '18U',
  };
  result = tournamentEngine.scaledTeamAssignment({
    individualParticipantIds,
    teamParticipantIds,
    scaleAttributes,
  });

  teamParticipants = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [TEAM_PARTICIPANT] },
    withScaleValues: true,
    inContext: true,
  }).tournamentParticipants;

  const teamMemberCounts = teamParticipants.map(
    (teamParticipant) => teamParticipant.individualParticipants.length
  );
  expect(teamMemberCounts).toEqual([13, 13, 13, 13, 12, 12, 12, 12]);

  const teamScaleTotals = teamParticipants.map((teamParticipant) =>
    teamParticipant.individualParticipants
      .map(
        (participant) =>
          participantScaleItem({ participant, scaleAttributes }).scaleItem
            .scaleValue
      )
      .reduce((a, b) => (a || 0) + (b || 0))
  );
  // 100 participants with rankings 1-100 were distributed across 8 teams.
  // 4 teams received an additional team member, rankings 97, 98, 99, 100
  // all teams are balanced apart from the final four placements
  expect(teamScaleTotals).toEqual([679, 680, 681, 682, 582, 582, 582, 582]);

  event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(teamParticipants.length);
});

it('can automatically assign participants to teams using scaledParticipants', () => {
  let participantsCount = 100;

  const eventProfiles = [{ eventName: EVENT_NAME, eventType: TEAM_EVENT }];
  const participantsProfile = {
    scaledParticipantsCount: participantsCount,
    category: { categoryName: '18U' },
    rankingRange: [1, 100],
    participantsCount,
  };

  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile,
    eventProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const individualParticipants = tournamentRecord.participants;
  const individualParticipantIds = individualParticipants.map(getParticipantId);

  let result = tournamentEngine.addEventEntries({
    participantIds: individualParticipantIds,
    entryStatus: UNGROUPED,
    eventId,
  });
  expect(result.success).toEqual(true);

  let { event } = tournamentEngine.getEvent({ eventId });
  expect(event.entries.length).toEqual(participantsCount);

  let teamParticipants = generateRange(0, 8).map((i) => ({
    participantName: `Team ${i + 1}`,
    participantType: TEAM_PARTICIPANT,
    participantRole: COMPETITOR,
  }));

  result = tournamentEngine.addParticipants({
    participants: teamParticipants,
  });
  expect(result.success).toEqual(true);

  const scaleAttributes = {
    scaleType: RANKING,
    eventType: SINGLES,
    scaleName: '18U',
  };

  const scaledParticipants = individualParticipants.map((participant) => ({
    participantId: participant.participantId,
    scaleValue: participantScaleItem({ participant, scaleAttributes }).scaleItem
      .scaleValue,
  }));

  const teamParticipantIds = teamParticipants.map(getParticipantId);
  result = tournamentEngine.addEventEntries({
    participantIds: teamParticipantIds,
    eventId,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.scaledTeamAssignment({
    teamParticipantIds,
    scaledParticipants,
  });

  teamParticipants = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [TEAM_PARTICIPANT] },
    withScaleValues: true,
    inContext: true,
  }).tournamentParticipants;

  const teamMemberCounts = teamParticipants.map(
    (teamParticipant) => teamParticipant.individualParticipants.length
  );
  expect(teamMemberCounts).toEqual([13, 13, 13, 13, 12, 12, 12, 12]);

  const teamScaleTotals = teamParticipants.map((teamParticipant) =>
    teamParticipant.individualParticipants
      .map(
        (participant) =>
          participantScaleItem({ participant, scaleAttributes }).scaleItem
            .scaleValue
      )
      .reduce((a, b) => (a || 0) + (b || 0))
  );
  // 100 participants with rankings 1-100 were distributed across 8 teams.
  // 4 teams received an additional team member, rankings 97, 98, 99, 100
  // all teams are balanced apart from the final four placements
  expect(teamScaleTotals).toEqual([679, 680, 681, 682, 582, 582, 582, 582]);

  event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(teamParticipants.length);
});

it('will cleanup UNGROUPED participant entries if TEAM entry is added AFTER team assignments are made', () => {
  let participantsCount = 100;

  const eventProfiles = [{ eventName: EVENT_NAME, eventType: TEAM_EVENT }];
  const participantsProfile = {
    scaledParticipantsCount: participantsCount,
    category: { categoryName: '18U' },
    rankingRange: [1, 100],
    participantsCount,
  };

  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile,
    eventProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const individualParticipants = tournamentRecord.participants;
  const individualParticipantIds = individualParticipants.map(getParticipantId);

  let result = tournamentEngine.addEventEntries({
    participantIds: individualParticipantIds,
    entryStatus: UNGROUPED,
    eventId,
  });
  expect(result.success).toEqual(true);

  let { event } = tournamentEngine.getEvent({ eventId });
  expect(event.entries.length).toEqual(participantsCount);

  let teamParticipants = generateRange(0, 8).map((i) => ({
    participantName: `Team ${i + 1}`,
    participantType: TEAM_PARTICIPANT,
    participantRole: COMPETITOR,
  }));

  result = tournamentEngine.addParticipants({
    participants: teamParticipants,
  });
  expect(result.success).toEqual(true);

  const scaleAttributes = {
    scaleType: RANKING,
    eventType: SINGLES,
    scaleName: '18U',
  };

  const scaledParticipants = individualParticipants.map((participant) => ({
    participantId: participant.participantId,
    scaleValue: participantScaleItem({ participant, scaleAttributes }).scaleItem
      .scaleValue,
  }));

  const teamParticipantIds = teamParticipants.map(getParticipantId);
  result = tournamentEngine.scaledTeamAssignment({
    teamParticipantIds,
    scaledParticipants,
  });

  teamParticipants = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [TEAM_PARTICIPANT] },
    withScaleValues: true,
    inContext: true,
  }).tournamentParticipants;

  const teamMemberCounts = teamParticipants.map(
    (teamParticipant) => teamParticipant.individualParticipants.length
  );
  expect(teamMemberCounts).toEqual([13, 13, 13, 13, 12, 12, 12, 12]);

  const teamScaleTotals = teamParticipants.map((teamParticipant) =>
    teamParticipant.individualParticipants
      .map(
        (participant) =>
          participantScaleItem({ participant, scaleAttributes }).scaleItem
            .scaleValue
      )
      .reduce((a, b) => (a || 0) + (b || 0))
  );
  // 100 participants with rankings 1-100 were distributed across 8 teams.
  // 4 teams received an additional team member, rankings 97, 98, 99, 100
  // all teams are balanced apart from the final four placements
  expect(teamScaleTotals).toEqual([679, 680, 681, 682, 582, 582, 582, 582]);

  event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(participantsCount);

  result = tournamentEngine.addEventEntries({
    participantIds: teamParticipantIds,
    eventId,
  });
  expect(result.success).toEqual(true);

  event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(teamParticipants.length);
});

it('will generate teams for scaledTeamAssignment when given teamsCount', () => {
  let participantsCount = 100;

  const eventProfiles = [{ eventName: EVENT_NAME, eventType: TEAM_EVENT }];
  const participantsProfile = {
    scaledParticipantsCount: participantsCount,
    category: { categoryName: '18U' },
    rankingRange: [1, 100],
    participantsCount,
  };

  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile,
    eventProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const individualParticipants = tournamentRecord.participants;
  const individualParticipantIds = individualParticipants.map(getParticipantId);

  let result = tournamentEngine.addEventEntries({
    participantIds: individualParticipantIds,
    entryStatus: UNGROUPED,
    eventId,
  });
  expect(result.success).toEqual(true);

  let { event } = tournamentEngine.getEvent({ eventId });
  expect(event.entries.length).toEqual(participantsCount);

  const scaleAttributes = {
    scaleType: RANKING,
    eventType: SINGLES,
    scaleName: '18U',
  };

  const scaledParticipants = individualParticipants.map((participant) => ({
    participantId: participant.participantId,
    scaleValue: participantScaleItem({ participant, scaleAttributes }).scaleItem
      .scaleValue,
  }));

  result = tournamentEngine.scaledTeamAssignment({
    scaledParticipants,
    teamsCount: 8,
  });

  const teamParticipants = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [TEAM_PARTICIPANT] },
    withScaleValues: true,
    inContext: true,
  }).tournamentParticipants;

  const teamMemberCounts = teamParticipants.map(
    (teamParticipant) => teamParticipant.individualParticipants.length
  );
  expect(teamMemberCounts).toEqual([13, 13, 13, 13, 12, 12, 12, 12]);

  const teamScaleTotals = teamParticipants.map((teamParticipant) =>
    teamParticipant.individualParticipants
      .map(
        (participant) =>
          participantScaleItem({ participant, scaleAttributes }).scaleItem
            .scaleValue
      )
      .reduce((a, b) => (a || 0) + (b || 0))
  );
  // 100 participants with rankings 1-100 were distributed across 8 teams.
  // 4 teams received an additional team member, rankings 97, 98, 99, 100
  // all teams are balanced apart from the final four placements
  expect(teamScaleTotals).toEqual([679, 680, 681, 682, 582, 582, 582, 582]);

  /*
  event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(teamParticipants.length);
  */
});

it('can determine teams from DIRECT_ACCEPTANCE entries of a TEAM event', () => {
  let participantsCount = 100;

  const eventProfiles = [{ eventName: EVENT_NAME, eventType: TEAM_EVENT }];
  const participantsProfile = {
    scaledParticipantsCount: participantsCount,
    category: { categoryName: '18U' },
    rankingRange: [1, 100],
    participantsCount,
  };

  const {
    tournamentRecord,
    eventIds: [eventId],
  } = mocksEngine.generateTournamentRecord({
    participantsProfile,
    eventProfiles,
  });

  tournamentEngine.setState(tournamentRecord);

  const individualParticipantIds =
    tournamentRecord.participants.map(getParticipantId);

  let result = tournamentEngine.addEventEntries({
    participantIds: individualParticipantIds,
    eventId,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_IDS);

  result = tournamentEngine.addEventEntries({
    participantIds: individualParticipantIds,
    entryStatus: UNGROUPED,
    eventId,
  });
  expect(result.success).toEqual(true);

  let { event } = tournamentEngine.getEvent({ eventId });
  expect(event.entries.length).toEqual(participantsCount);

  let teamParticipants = generateRange(0, 8).map((i) => ({
    participantName: `Team ${i + 1}`,
    participantType: TEAM_PARTICIPANT,
    participantRole: COMPETITOR,
  }));

  result = tournamentEngine.addParticipants({
    participants: teamParticipants,
  });
  expect(result.success).toEqual(true);

  const teamParticipantIds = teamParticipants.map(getParticipantId);

  result = tournamentEngine.addEventEntries({
    participantIds: teamParticipantIds,
    eventId,
  });
  expect(result.success).toEqual(true);

  const scaleAttributes = {
    scaleType: RANKING,
    eventType: SINGLES,
    scaleName: '18U',
  };

  result = tournamentEngine.scaledTeamAssignment({
    individualParticipantIds,
    scaleAttributes,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.scaledTeamAssignment({
    individualParticipantIds,
    scaleAttributes,
    eventId,
  });

  teamParticipants = tournamentEngine.getTournamentParticipants({
    participantFilters: { participantTypes: [TEAM_PARTICIPANT] },
    withScaleValues: true,
    inContext: true,
  }).tournamentParticipants;

  const teamMemberCounts = teamParticipants.map(
    (teamParticipant) => teamParticipant.individualParticipants.length
  );
  expect(teamMemberCounts).toEqual([13, 13, 13, 13, 12, 12, 12, 12]);

  const teamScaleTotals = teamParticipants.map((teamParticipant) =>
    teamParticipant.individualParticipants
      .map(
        (participant) =>
          participantScaleItem({ participant, scaleAttributes }).scaleItem
            .scaleValue
      )
      .reduce((a, b) => (a || 0) + (b || 0))
  );
  // 100 participants with rankings 1-100 were distributed across 8 teams.
  // 4 teams received an additional team member, rankings 97, 98, 99, 100
  // all teams are balanced apart from the final four placements
  expect(teamScaleTotals).toEqual([679, 680, 681, 682, 582, 582, 582, 582]);

  event = tournamentEngine.getEvent({ eventId }).event;
  expect(event.entries.length).toEqual(teamParticipants.length);
});

import { generateRange } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { DOUBLES } from '../../../constants/eventConstants';
import {
  GROUP,
  INDIVIDUAL,
  PAIR,
  TEAM,
} from '../../../constants/participantTypes';

it('can generate TEAM events', () => {
  const personExtensions = [{ name: 'districtCode', value: 'Z' }];
  const nationalityCodesCount = 10;
  const participantsCount = 32;
  const participantsProfile = {
    participantType: PAIR,
    nationalityCodesCount,
    participantsCount,
    personExtensions,
  };

  let result = mocksEngine.generateTournamentRecord({
    participantsProfile,
    drawProfiles: [{ drawSize: participantsCount, eventType: DOUBLES }],
  });

  tournamentEngine.setState(result.tournamentRecord);

  const groupsToGenerate = 6;
  const participantsPerGroup = 10;
  const schoolResponsibility = 'school';

  result = tournamentEngine.generateTeamsFromParticipantAttribute({
    personAttribute: 'nationalityCode',
  });
  expect(result.success).toEqual(true);

  const { tournamentParticipants: individualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });
  expect(individualParticipants.length).toEqual(64);

  generateRange(0, groupsToGenerate).forEach((index) => {
    const individualParticipantIds = individualParticipants
      .slice(participantsPerGroup * index, participantsPerGroup * (index + 1))
      .map(({ participantId }) => participantId);

    result = tournamentEngine.createGroupParticipant({
      participantRoleResponsibilities: [schoolResponsibility],
      groupName: `School ${index + 1}`,
      individualParticipantIds,
    });
  });

  const { tournamentParticipants: groupTournamentParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [GROUP] },
    });
  expect(groupTournamentParticipants.length).toEqual(groupsToGenerate);

  expect(
    groupTournamentParticipants[0].individualParticipantIds.length
  ).toEqual(participantsPerGroup);

  const { tournamentParticipants: pairTournamentParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [PAIR] },
    });
  expect(pairTournamentParticipants.length).toEqual(participantsCount);

  const { tournamentParticipants: teamTournamentParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [TEAM] },
    });
  expect(teamTournamentParticipants.length).toEqual(10);

  let { tournamentParticipants: inContextIdividualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
      inContext: true,
    });

  expect(inContextIdividualParticipants[0].person.extensions).toEqual(
    personExtensions
  );

  ({ tournamentParticipants: inContextIdividualParticipants } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
      convertExtensions: true,
      inContext: true,

      withDraws: false,
      withEvents: false,
      withMatchUps: true,
      withStatistics: true,
    }));

  expect(inContextIdividualParticipants[0].person._districtCode).toEqual('Z');
  expect(
    inContextIdividualParticipants[0].matchUps[0].tournamentId
  ).not.toBeUndefined();

  const individualsInGroups = inContextIdividualParticipants.filter(
    (participant) => participant.groupParticipantIds.length
  );
  expect(individualsInGroups.length).toEqual(60);

  const individualsInTeams = inContextIdividualParticipants.filter(
    (participant) => participant.teamParticipantIds.length
  );
  expect(individualsInTeams.length).toEqual(64);
  const individualsInPairs = inContextIdividualParticipants.filter(
    (participant) => participant.pairParticipantIds.length
  );
  expect(individualsInPairs.length).toEqual(64);

  const { tournamentParticipants: participantsWithResponsibilities } =
    tournamentEngine.getTournamentParticipants({
      participantFilters: {
        participantRoleResponsibilities: [schoolResponsibility],
      },
    });

  expect(participantsWithResponsibilities.length).toEqual(groupsToGenerate);

  const responsibilityGroupNameMapping = Object.assign(
    {},
    ...participantsWithResponsibilities.map(
      ({ participantId, participantName }) => ({
        [participantId]: participantName,
      })
    )
  );

  individualsInGroups.forEach((participant) => {
    participant.groupParticipantIds.forEach((groupParticipantId) => {
      expect(
        responsibilityGroupNameMapping[groupParticipantId]
      ).not.toBeUndefined();
    });
  });
});

import mocksEngine from '../../../mocksEngine';
import { intersection } from '../../../utilities';
import tournamentEngine from '../../sync';

import { PAIR } from '../../../constants/participantTypes';
import { MALE } from '../../../constants/genderConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { AGE } from '../../../constants/eventConstants';

it('can add statistics to tournament participants', () => {
  const participantsProfile = {
    participantsCount: 200,
    participantType: PAIR,
    sex: MALE,
  };
  const drawProfiles = [
    {
      drawSize: 32,
      eventType: DOUBLES,
      participantsCount: 30,
      category: {
        ageCategoryCode: 'U18',
        categoryName: 'U18',
        type: AGE,
      },
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-1 6-3',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          scoreString: '6-1 6-4',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 2,
          scoreString: '6-2 6-2',
          winningSide: 1, // participant who won this match won 2 matches in this draw
        },
      ],
    },
    {
      drawSize: 32,
      eventType: SINGLES,
      participantsCount: 30,
      category: {
        ageCategoryCode: 'U18',
        categoryName: 'U18',
        type: AGE,
      },
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 3,
          scoreString: '6-1 6-3',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 4,
          scoreString: '6-1 6-4',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 2,
          scoreString: '6-2 6-2',
          winningSide: 1, // participant who won this match won 2 matches in this draw
        },
      ],
    },
  ];
  let { tournamentRecord, eventIds } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  let extension = {
    name: 'ustaSection',
    value: { code: 65 },
  };
  tournamentEngine.addTournamentExtension({ extension });
  extension = {
    name: 'ustaDistrict',
    value: { code: 17 },
  };
  tournamentEngine.addTournamentExtension({ extension });
  extension = {
    name: 'ustaDivision',
    value: { code: 'X(50,60,70-80)d,SE' },
  };
  tournamentEngine.addTournamentExtension({ extension });

  ({ tournamentRecord } = tournamentEngine.getState({
    convertExtensions: true,
  }));
  expect(tournamentRecord._ustaSection.code).toEqual(65);
  expect(tournamentRecord._ustaDistrict.code).toEqual(17);
  expect(tournamentRecord._ustaDivision.code).toEqual('X(50,60,70-80)d,SE');

  const eventId = eventIds[0];
  const { event } = tournamentEngine.getEvent({ eventId });
  extension = {
    name: 'ustaLevel',
    value: 1,
  };
  tournamentEngine.addEventExtension({ eventId, extension });

  extension = {
    name: 'ustaDivision',
    value: { id: '123' },
  };
  tournamentEngine.addEventExtension({ eventId, extension });

  const positionAssignments =
    event.drawDefinitions[0].structures[0].positionAssignments;

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    convertExtensions: true,
    withStatistics: true,
    withOpponents: true,
    withMatchUps: true,
  });
  // specified 200 participantType: DOUBLES => 200 PAIR + 400 INDIVIDUAL
  expect(tournamentParticipants.length).toEqual(600);

  const getParticipant = ({ drawPosition }) => {
    const participantId = positionAssignments.find(
      (assignment) => assignment.drawPosition === drawPosition
    ).participantId;
    return tournamentParticipants.find(
      (participant) => participant.participantId === participantId
    );
  };

  const doublesParticipant = getParticipant({ drawPosition: 1 });
  expect(doublesParticipant.statistics[0].statValue).toEqual(1);
  expect(doublesParticipant.opponents.length).toEqual(2);
  expect(doublesParticipant.matchUps.length).toEqual(3);
  expect(doublesParticipant.events.length).toEqual(1);
  expect(doublesParticipant.draws.length).toEqual(1);

  const individualParticipantId =
    doublesParticipant.individualParticipantIds[0];
  const individualParticipant = tournamentParticipants.find(
    (participant) => participant.participantId === individualParticipantId
  );
  expect(individualParticipant.events[0].drawIds.length).toBeGreaterThan(0);
  expect(individualParticipant.statistics[0].statValue).toBeGreaterThan(0);
  expect(individualParticipant.events[0]._ustaLevel).toEqual(1);

  expect(individualParticipant.draws[0].finishingPositionRange).toEqual([1, 8]);
  expect(individualParticipant.events[0].eventType).toEqual(DOUBLES);
});

it('can add statistics to tournament participants', () => {
  const participantsProfile = {
    participantsCount: 4,
    participantType: PAIR,
  };
  const drawProfiles = [
    {
      drawSize: 4,
      eventType: DOUBLES,
      participantsCount: 4,
      category: {
        ageCategoryCode: 'U18',
        categoryName: 'U18',
        type: AGE,
      },
    },
  ];
  let { tournamentRecord, eventIds } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
  });
  tournamentEngine.setState(tournamentRecord);

  ({ tournamentRecord } = tournamentEngine.getState({
    convertExtensions: true,
  }));

  const eventId = eventIds[0];
  const { event } = tournamentEngine.getEvent({ eventId });

  const positionAssignments =
    event.drawDefinitions[0].structures[0].positionAssignments;

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    convertExtensions: true,
    withStatistics: true,
    withOpponents: true,
    withMatchUps: true,
  });
  expect(tournamentParticipants.length).toEqual(12);

  const getParticipant = ({ drawPosition }) => {
    const participantId = positionAssignments.find(
      (assignment) => assignment.drawPosition === drawPosition
    ).participantId;
    return tournamentParticipants.find(
      (participant) => participant.participantId === participantId
    );
  };

  const doublesParticipant = getParticipant({ drawPosition: 1 });

  const {
    individualParticipantIds,
    events: [{ partnerParticipantId: pairPartnerId }],
  } = doublesParticipant;

  expect(pairPartnerId).toBeUndefined();

  const individualParticipantId =
    doublesParticipant.individualParticipantIds[0];
  const individualParticipant = tournamentParticipants.find(
    (participant) => participant.participantId === individualParticipantId
  );

  const {
    events: [{ partnerParticipantId }],
  } = individualParticipant;

  // check that the individual and partner equal individualParticipantIds for the PAIR
  expect(
    intersection(
      [individualParticipantId, partnerParticipantId],
      individualParticipantIds
    ).length
  ).toEqual(2);
});

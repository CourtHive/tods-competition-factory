import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';

import { PAIR } from '../../../constants/participantTypes';
import { MALE } from '../../../constants/genderConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';

it('can add statistics to tournament participants', () => {
  const participantsProfile = {
    participantsCount: 100,
    participantType: PAIR,
    sex: MALE,
  };
  const drawProfiles = [
    {
      drawSize: 32,
      eventType: DOUBLES,
      participantsCount: 30,
      outcomes: [
        [1, 2, '6-1 6-2', 1],
        [2, 1, '6-2 6-1', 1],
        [1, 3, '6-1 6-3', 1],
        [1, 4, '6-1 6-4', 1],
        [2, 2, '6-2 6-2', 1], // participant who won this match won 2 matches in this draw
      ],
    },
    {
      drawSize: 32,
      eventType: SINGLES,
      participantsCount: 30,
      outcomes: [
        [1, 2, '6-1 6-2', 1],
        [2, 1, '6-2 6-1', 1],
        [1, 3, '6-1 6-3', 1],
        [1, 4, '6-1 6-4', 1],
        [2, 2, '6-2 6-2', 1], // participant who won this match won 2 matches in this draw
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
  tournamentEngine.addTournamentExtension({ tournamentEngine, extension });
  extension = {
    name: 'ustaDistrict',
    value: { code: 17 },
  };
  tournamentEngine.addTournamentExtension({ tournamentEngine, extension });
  extension = {
    name: 'ustaDivision',
    value: { code: 'X(50,60,70-80)d,SE' },
  };
  tournamentEngine.addTournamentExtension({ tournamentEngine, extension });

  ({ tournamentRecord } = tournamentEngine.getState({
    convertExtensions: true,
  }));
  expect(tournamentRecord._ustaSection.code).toEqual(65);
  expect(tournamentRecord._ustaDistrict.code).toEqual(17);
  expect(tournamentRecord._ustaDivision.code).toEqual('X(50,60,70-80)d,SE');

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
    convertExtensions: true,
    withStatistics: true,
    withOpponents: true,
    withMatchUps: true,
  });
  expect(tournamentParticipants.length).toEqual(300);

  const { event } = tournamentEngine.getEvent({ eventId: eventIds[0] });
  const positionAssignments =
    event.drawDefinitions[0].structures[0].positionAssignments;

  const getParticipant = ({ drawPosition }) => {
    const participantId = positionAssignments.find(
      (assignment) => assignment.drawPosition === drawPosition
    ).participantId;
    return tournamentParticipants.find(
      (participant) => participant.participantId === participantId
    );
  };

  const targetParticipant = getParticipant({ drawPosition: 1 });
  console.log({ targetParticipant });
  expect(targetParticipant.statistics[0].statValue).toEqual(1);

  const individualParticipantId = targetParticipant.individualParticipantIds[0];
  const individualParticipant = tournamentParticipants.find(
    (participant) => participant.participantId === individualParticipantId
  );
  expect(individualParticipant.statistics[0].statValue).toBeGreaterThan(0);

  console.log(individualParticipant.opponents);
});

import { mocksEngine, tournamentEngine } from '../..';
import { DOUBLES } from '../../constants/eventConstants';
import { JSON2CSV } from '../json';

it('can transform arrays of JSON objects to CSV', () => {
  const jsonObjects = [{ a: 1 }, { b: 2 }];
  const expectations = ['a,b', '1,', ',2'];
  const conversion = JSON2CSV(jsonObjects).split('\r\n');
  expectations.forEach((expectation, i) =>
    expect(conversion[i]).toEqual(expectation)
  );
});

it('can transform arrays of JSON objects to CSV and map header column names', () => {
  const jsonObjects = [{ a: 1 }, { b: 2 }];
  const expectations = ['first,b', '1,', ',2'];
  const config = { columnMap: { a: 'first' } };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.forEach((expectation, i) => {
    expect(conversion[i]).toEqual(expectation);
  });
});

it('can transform arrays of JSON objects to CSV and specify target attributes', () => {
  const jsonObjects = [{ a: 1 }, { a: 2, b: 'x' }, { a: 3 }];
  const expectations = ['a', '1', '2', '3'];
  const config = { columnAccessors: ['a'] };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.forEach((expectation, i) => {
    expect(conversion[i]).toEqual(expectation);
  });
});

it('can transform arrays of JSON objects to CSV and specify target attributes', () => {
  const jsonObjects = [{ a: 1 }, { b: 2 }, { a: 3, b: 4 }];
  const expectations = ['a', '1', '', '3'];
  const config = { columnAccessors: ['a'] };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.length
    ? expectations.forEach((expectation, i) => {
        expect(conversion[i]).toEqual(expectation);
      })
    : console.log({ conversion });
});

it('can transform arrays of JSON objects to CSV and transform multiple target attributes', () => {
  const jsonObjects = [{ a: 1 }, { b: 2, z: 100 }, { a: 3, b: 4 }];
  const expectations = ['name,b', '1,', '100,2', '3,4'];
  const config = { columnTransform: { name: ['a', 'z'] } };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.length
    ? expectations.forEach((expectation, i) => {
        expect(conversion[i]).toEqual(expectation);
      })
    : console.log({ conversion });
});

it('can transform arrays of JSON objects to CSV and transform multiple target attributes and map column header names', () => {
  const jsonObjects = [{ a: 1 }, { b: 2, z: 100 }, { a: 3, b: 4 }];
  const expectations = ['name,second', '1,', '100,2', '3,4'];
  const config = {
    columnMap: { b: 'second' },
    columnTransform: { name: ['a', 'z'] },
  };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.length
    ? expectations.forEach((expectation, i) => {
        expect(conversion[i]).toEqual(expectation);
      })
    : console.log({ conversion });
});

it('can transform arrays of JSON objects to CSV and transform multiple target attributes and map column header names', () => {
  const jsonObjects = [{ a: 1 }, { b: 2, z: 100 }, { a: 3, b: 4 }, { x: 200 }];
  const expectations = ['name,b,a', '1,,', '100,2,', '3,4,', ',,200'];
  const config = {
    columnMap: { x: 'a' },
    columnTransform: { name: ['a', 'z'] },
  };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.length
    ? expectations.forEach((expectation, i) => {
        expect(conversion[i]).toEqual(expectation);
      })
    : console.log({ conversion });
});

it.only('can transform singles and doubles matchUps to extract side1player1', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 4 }, { drawSize: 4, eventType: DOUBLES }],
    completeAllMatchUps: true,
  });
  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const expectations = [];
  const config = {
    transformAccesorFilter: true,
    columnAccessors: ['matchUpType', 'matchUpFormat', 'endDate'],
    columnTransform: {
      scoreString: ['score.scoreStringSide1'],
      side1Participant1: [
        'sides.0.participant.individualParticipants.0.participantName',
        'sides.0.participant.participantName',
      ],
      side1Participant2: [
        'sides.0.participant.individualParticipants.1.participantName',
      ],
      side2Participant1: [
        'sides.1.participant.individualParticipants.0.participantName',
        'sides.1.participant.participantName',
      ],
      side2Participant2: [
        'sides.1.participant.individualParticipants.1.participantName',
      ],
    },
  };
  const conversion = JSON2CSV(matchUps, config).split('\r\n');
  expectations.length
    ? expectations.forEach((expectation, i) => {
        expect(conversion[i]).toEqual(expectation);
      })
    : console.log(conversion);
});

import { mocksEngine, tournamentEngine } from '../..';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';
import { DOUBLES, SINGLES_EVENT } from '../../constants/eventConstants';
import { SINGLES } from '../../constants/matchUpTypes';
import { JSON2CSV } from '../json';
import {
  FORMAT_ATP_DOUBLES,
  FORMAT_STANDARD,
} from '../../fixtures/scoring/matchUpFormats';
import { WALKOVER } from '../../constants/matchUpStatusConstants';

it('can create CSV from shallow JSON objects', () => {
  const csv = JSON2CSV([{ a: '1', b: '2' }]);
  expect(csv).not.toBeUndefined;

  const result = JSON2CSV();
  expect(result).toEqual(INVALID_VALUES);
});

it('can transform arrays of JSON objects to CSV', () => {
  const jsonObjects = [{ a: 1 }, { b: 2 }];
  const expectations = ['a,b', '1,', ',2'];
  const config = { delimiter: '' };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.forEach((expectation, i) =>
    expect(conversion[i]).toEqual(expectation)
  );
});

it('can transform arrays of JSON objects to CSV and remap values', () => {
  const jsonObjects = [{ a: 1 }, { b: 2 }];
  const expectations = ['a,b', '100,', ',2'];
  const config = { delimiter: '', valuesMap: { a: { 1: 100, 2: 200 } } };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.length
    ? expectations.forEach((expectation, i) =>
        expect(conversion[i]).toEqual(expectation)
      )
    : console.log(conversion);
});

it('supports passing functions which manipulate values', () => {
  const jsonObjects = [
    { matchUpStatus: WALKOVER },
    { matchUpType: SINGLES_EVENT },
  ];
  const expectations = ['matchUpStatus,matchUpType', 'WO,', ',S'];
  const config = {
    delimiter: '',
    valuesMap: { matchUpStatus: { WALKOVER: 'WO' } },
    functionMap: {
      matchUpType: (value) => value?.slice(0, 1),
    },
  };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.length
    ? expectations.forEach((expectation, i) =>
        expect(conversion[i]).toEqual(expectation)
      )
    : console.log(conversion);
});

it('can transform arrays of JSON objects to CSV with custom columnJoiner', () => {
  const jsonObjects = [{ a: 1 }, { b: 2 }];
  const expectations = ['a;b', '1;', ';2'];
  const config = { columnJoiner: ';', delimiter: '' };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.forEach((expectation, i) =>
    expect(conversion[i]).toEqual(expectation)
  );
});

it('can transform arrays of JSON objects to CSV with custom delimiter', () => {
  const jsonObjects = [{ a: 1 }, { b: 2 }];
  const expectations = ['"a","b"', '"1",""', '"","2"'];
  const config = { delimiter: '"' };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.length
    ? expectations.forEach((expectation, i) =>
        expect(conversion[i]).toEqual(expectation)
      )
    : console.log(conversion);
});

it('can transform arrays of JSON objects to CSV and add context to all rows', () => {
  const jsonObjects = [{ a: 1 }, { b: 2 }];
  const expectations = ['contextItem,a,b', 'context,1,', 'context,,2'];
  const config = { context: { contextItem: 'context' }, delimiter: '' };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.forEach((expectation, i) =>
    expect(conversion[i]).toEqual(expectation)
  );
});

it('can transform arrays of JSON objects to CSV and map header column names', () => {
  const jsonObjects = [{ a: 1 }, { b: 2 }];
  const expectations = ['first,b', '1,', ',2'];
  const config = { columnMap: { a: 'first' }, delimiter: '' };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.forEach((expectation, i) => {
    expect(conversion[i]).toEqual(expectation);
  });
});

it('can transform arrays of JSON objects to CSV and specify target attributes', () => {
  const jsonObjects = [{ a: 1 }, { a: 2, b: 'x' }, { a: 3 }];
  const expectations = ['a', '1', '2', '3'];
  const config = { columnAccessors: ['a'], delimiter: '' };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.forEach((expectation, i) => {
    expect(conversion[i]).toEqual(expectation);
  });
});

it('can transform arrays of JSON objects to CSV and specify target attributes', () => {
  const jsonObjects = [{ a: 1 }, { b: 2 }, { a: 3, b: 4 }];
  const expectations = ['a', '1', '', '3'];
  const config = { columnAccessors: ['a'], delimiter: '' };
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
  const config = { columnTransform: { name: ['a', 'z'] }, delimiter: '' };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.length
    ? expectations.forEach((expectation, i) => {
        expect(conversion[i]).toEqual(expectation);
      })
    : console.log({ conversion });
});

it('can recognized bad data', () => {
  let result = JSON2CSV([{ a: 1 }], { columnTransform: 'bad' });
  expect(result).toEqual(INVALID_VALUES);
  result = JSON2CSV([{ a: 1 }], { columnMap: 'bad' });
  expect(result).toEqual(INVALID_VALUES);
  result = JSON2CSV([{ a: 1 }], 'string');
  expect(result).toEqual(INVALID_VALUES);
});

it('can transform arrays of JSON objects to CSV and transform multiple target attributes and map column header names', () => {
  const jsonObjects = [{ a: 1 }, { b: 2, z: 100 }, { a: 3, b: 4 }];
  const expectations = ['name,second', '1,', '100,2', '3,4'];
  const config = {
    columnMap: { b: 'second' },
    columnTransform: { name: ['a', 'z'] },
    delimiter: '',
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
    delimiter: '',
  };
  const conversion = JSON2CSV(jsonObjects, config).split('\r\n');
  expectations.length
    ? expectations.forEach((expectation, i) => {
        expect(conversion[i]).toEqual(expectation);
      })
    : console.log({ conversion });
});

it('can transform singles and doubles matchUps to extract side1player1', () => {
  const endDate = '2022-12-22';
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawSize: 4 },
      { drawSize: 4, eventType: DOUBLES, matchUpFormat: FORMAT_ATP_DOUBLES },
    ],
    completeAllMatchUps: true,
    startDate: endDate,
    endDate,
  });
  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const config = {
    delimiter: '',
    includeTransoformAccessors: true,
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

  expect(conversion[0]).toEqual(
    'endDate,matchUpFormat,matchUpType,scoreString,side1Participant1,side2Participant1,side1Participant2,side2Participant2'
  );
  conversion.slice(1).forEach((row) => {
    const columns = row.split(',');
    expect(columns.length).toEqual(8);
    expect([SINGLES, DOUBLES].includes(columns[2])).toEqual(true);
    expect(columns[0]).toEqual(endDate);
    expect(columns[1]).toEqual(
      columns[2] === DOUBLES ? FORMAT_ATP_DOUBLES : FORMAT_STANDARD
    );
  });
});

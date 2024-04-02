import { generateStatCrew } from '@Generators/tournamentRecords/generateStatCrew';
import { jsonToXml } from '@Generators/tournamentRecords/jsonToXml';
import { expect, test } from 'vitest';
import fs from 'fs';

test('json to xml', () => {
  const json = { first: '1st', second: { fourth: '4th' }, third: { fifth: '5th' } };
  const tagName = 'root';
  const result = jsonToXml({ json, tagName });
  expect(result).toEqual(
    '<root first="1st">\r\n<second fourth="4th"></second>\r\n<third fifth="5th"></third>\r\n</root>',
  );
});

test('json arrays to xml', () => {
  const json = { first: '1st', second: [{ third: { one: '1' } }, { third: { two: 2 } }, { third: { three: '3' } }] };
  const tagName = 'root';
  const result = jsonToXml({ json, tagName });
  expect(result).toEqual(
    '<root first="1st">\r\n<second>\r\n<third one="1"></third>\r\n<third two="2"></third>\r\n<third three="3"></third>\r\n</second>\r\n</root>',
  );
});

test('generation of statcrew from dual', () => {
  const tournamentRecordJSON = fs.readFileSync('./src/tests/generators/dual.tods.json', 'utf-8');
  const tournamentRecord = JSON.parse(tournamentRecordJSON);
  const result: any = generateStatCrew({ tournamentRecord });
  const lines = result.xml.split('\n');
  const linesCount = lines.length;
  expect(linesCount).toEqual(47);
  const tags = lines.map((line) => line.split(' ')?.[0].slice(1).split('>')?.[0]);
  // prettier-ignore
  expect(tags).toEqual([
    'tngame', 'venue', 'officials', 'rules', '/venue', '', 'singles_matches', 'singles_match',
    'singles_score', 'singles_score', '/singles_match', 'singles_match', 'singles_score',
    'singles_score', '/singles_match', 'singles_match', 'singles_score', 'singles_score',
    '/singles_match', 'singles_match', 'singles_score', 'singles_score', '/singles_match',
    'singles_match', 'singles_score', 'singles_score', '/singles_match', 'singles_match',
    'singles_score', 'singles_score', '/singles_match', '/singles_matches', 'doubles_matches',
    'doubles_match', 'doubles_score', 'doubles_score', '/doubles_match', 'doubles_match',
    'doubles_score', 'doubles_score', '/doubles_match', 'doubles_match', 'doubles_score',
    'doubles_score', '/doubles_match', '/doubles_matches', '/tngame', ]);
});

import { extractAttributes as xa } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, it } from 'vitest';

import {
  COMPASS,
  CURTIS_CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  FIRST_ROUND_LOSER_CONSOLATION,
} from '../../../constants/drawDefinitionConstants';

it('can customize naming of COMPASS draw structures', () => {
  const playoffAttributes = {
    0: { name: 'Este', abbreviation: 'E' },
    '0-1': { name: 'Oeste', abbreviation: 'O' },
    '0-2': { name: 'Norte', abbreviation: 'N' },
    '0-3': { name: 'Nordeste', abbreviation: 'NE' },
    '0-1-1': { name: 'Sur', abbreviation: 'S' },
    '0-1-2': { name: 'Suroeste', abbreviation: 'SO' },
    '0-2-1': { name: 'Noroeste', abbreviation: 'NO' },
    '0-1-1-1': { name: 'Surdeste', abbreviation: 'SE' },
  };

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        playoffAttributes,
        drawType: COMPASS,
        drawSize: 32,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const structureNames = drawDefinition.structures.map(xa('structureName'));
  expect(structureNames).toEqual([
    'Este',
    'Oeste',
    'Norte',
    'Sur',
    'Nordeste',
    'Noroeste',
    'Suroeste',
    'Surdeste',
  ]);
});

const playoffAttributes = {
  0: { name: 'Principal', abbreviation: 'P' },
  '0-1': { name: 'Backdraw', abbreviation: 'B' },
};

it('can customize naming of FEED_IN_CHAMPIONSHIP structures', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: FEED_IN_CHAMPIONSHIP,
        playoffAttributes,
        drawSize: 16,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const structureNames = drawDefinition.structures.map(xa('structureName'));
  expect(structureNames).toEqual(['Principal', 'Backdraw']);
});

it('can customize naming of FIRST_ROUND_LOSER_CONSOLATION structures', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: FIRST_ROUND_LOSER_CONSOLATION,
        playoffAttributes,
        drawSize: 16,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const structureNames = drawDefinition.structures.map(xa('structureName'));
  expect(structureNames).toEqual(['Principal', 'Backdraw']);
});

it('can customize naming of FIRST_MATCH_LOSER_CONSOLATION structures', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: FIRST_MATCH_LOSER_CONSOLATION,
        playoffAttributes,
        drawSize: 16,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const structureNames = drawDefinition.structures.map(xa('structureName'));
  expect(structureNames).toEqual(['Principal', 'Backdraw']);
});

it('can customize naming of CURTIS_CONSOLATION structures', () => {
  const playoffAttributes = {
    0: { name: 'Principal', abbreviation: 'P' },
    '0-1': { name: '1st Consey', abbreviation: 'C1' },
    '0-3': { name: '2nd Consey', abbreviation: 'C2' },
    '3-4': { name: '3-4 Playoff', abbreviation: 'PO3' },
  };

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: CURTIS_CONSOLATION,
        playoffAttributes,
        drawSize: 64,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  const drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const structureNames = drawDefinition.structures.map(xa('structureName'));
  expect(structureNames).toEqual([
    'Principal',
    '1st Consey',
    '2nd Consey',
    '3-4 Playoff',
  ]);
});

it('can customize naming of added playoff structures with exitProfiles', () => {
  const playoffAttributes = {
    '0': { name: 'Initial', abbreviation: 'I' },
    '0-3': { name: 'Silver', abbreviation: 'S' },
    '0-4': { name: 'Gold', abbreviation: 'G' },
  };

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, playoffAttributes }],
  });

  tournamentEngine.setState(tournamentRecord);

  const roundProfiles = [{ 3: 1 }, { 4: 1 }];
  const {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.getEvent({ drawId });

  const result = tournamentEngine.addPlayoffStructures({
    playoffStructureNameBase: 'Playoff',
    playoffAttributes,
    roundProfiles,
    structureId,
    drawId,
  });

  expect(result.success).toEqual(true);

  const drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const structureNames = drawDefinition.structures.map(xa('structureName'));
  expect(structureNames).toEqual(['Initial', 'Silver', 'Gold']);
});

it('can customize naming of added playoff structures with finishingPositionRanges', () => {
  const playoffAttributes = {
    '0': { name: 'Initial', abbreviation: 'I' },
    '5-8': { name: 'Silver', abbreviation: 'S' },
    '3-4': { name: 'Gold', abbreviation: 'G' },
  };

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, playoffAttributes }],
  });

  tournamentEngine.setState(tournamentRecord);

  const roundProfiles = [{ 3: 1 }, { 4: 1 }];
  const {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.getEvent({ drawId });

  const result = tournamentEngine.addPlayoffStructures({
    playoffStructureNameBase: 'Playoff',
    playoffAttributes,
    roundProfiles,
    structureId,
    drawId,
  });

  expect(result.success).toEqual(true);

  const drawDefinition = tournamentEngine.getEvent({ drawId }).drawDefinition;
  const structureNames = drawDefinition.structures.map(xa('structureName'));
  expect(structureNames).toEqual(['Initial', 'Silver', 'Gold']);
});

import { generateQualifyingStructure } from '../../assemblies/generators/drawDefinitions/drawTypes/generateQualifyingStructure';
import { addTournamentTimeItem } from '../timeItems/addTimeItem';
import { definedAttributes } from '../../tools/definedAttributes';
import { attachQualifyingStructure } from './attachQualifyingStructure';

import { DrawDefinition, Event, Tournament } from '../../types/tournamentTypes';
import {
  MISSING_TOURNAMENT_RECORD,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
} from '../../constants/errorConditionConstants';

type AddQualifyingstructureArgs = {
  qualifyingRoundNumber: number;
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  qualifyingPositions: number;
  targetStructureId: string;
  roundTarget: number;
  structureName: string;
  matchUpType: string;
  drawSize: number;
  drawType: string;
  eventId: string;
  event: Event;
};

export function addQualifyingStructure(params: AddQualifyingstructureArgs) {
  const tournamentRecord = params.tournamentRecord;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const result = addQualifying(params);
  if (result.error) return result;

  const {
    qualifyingRoundNumber,
    qualifyingPositions,
    targetStructureId,
    drawDefinition,
    structureName,
    matchUpType,
    drawSize,
    drawType,
  } = params;

  const qualifyingDetails = definedAttributes({
    drawId: drawDefinition.drawId,
    qualifyingRoundNumber,
    qualifyingPositions,
    targetStructureId,
    structureName,
    matchUpType,
    drawSize,
    drawType,
  });

  const timeItem = {
    itemType: 'addQualifyingStructures',
    itemValue: qualifyingDetails,
  };
  addTournamentTimeItem({ tournamentRecord, timeItem });

  return result;
}

type AddQualifyingArgs = {
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  targetStructureId: string;
  qualifyingRoundNumber: number;
  roundTarget: number;
  eventId: string;
  event: Event;
};

export function addQualifying(params: AddQualifyingArgs) {
  if (!params.drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!params.targetStructureId) return { error: MISSING_STRUCTURE_ID };
  const result = generateQualifyingStructure(params);
  if (result.error) return result;
  const { structure, link } = result;
  if (!structure || !link) return { error: INVALID_VALUES };

  return attachQualifyingStructure({
    tournamentRecord: params.tournamentRecord,
    drawDefinition: params.drawDefinition,
    structure,
    link,
  });
}

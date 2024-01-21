import { addVoluntaryConsolationStructure } from '../../../../mutate/drawDefinitions/addVoluntaryConsolationStructure';
import { getParticipants } from '../../../../query/participants/getParticipants';
import { validateAndDeriveDrawValues } from '../validateAndDeriveDrawValues';
import { generateOrGetExisting } from './generateOrGetExisting';
import { qualifyingGeneration } from './qualifyingGeneration';
import { constantToString } from '../../../../tools/strings';
import { getDrawFormat } from '../getDrawFormat';

import { QUALIFIER, STRUCTURE_SELECTED_STATUSES } from '../../../../constants/entryStatusConstants';
import { ErrorType, INVALID_VALUES } from '../../../../constants/errorConditionConstants';
import { ResultType, decorateResult } from '../../../../global/functions/decorateResult';
import { GenerateDrawDefinitionArgs } from '../../../../types/factoryTypes';
import { DrawDefinition, Entry } from '../../../../types/tournamentTypes';
import { SUCCESS } from '../../../../constants/resultConstants';

export function generateDrawDefinition(params: GenerateDrawDefinitionArgs): ResultType & {
  existingDrawDefinition?: boolean;
  drawDefinition?: DrawDefinition;
  qualifyingConflicts?: any[];
  positioningReports?: any[];
  structureId?: string;
  success?: boolean;
  error?: ErrorType;
  conflicts?: any[];
} {
  const { voluntaryConsolation, tournamentRecord, event } = params;
  const stack = 'generateDrawDefinition';

  // get participants both for entry validation and for automated placement
  // automated placement requires them to be "inContext" for avoidance policies to work
  const { participants, participantMap } = getParticipants({
    withIndividualParticipants: true,
    convertExtensions: true,
    internalUse: true,
    tournamentRecord,
  });

  const eventEntries =
    event?.entries?.filter(
      (entry: Entry) => entry.entryStatus && [...STRUCTURE_SELECTED_STATUSES, QUALIFIER].includes(entry.entryStatus),
    ) ?? [];

  const validDerivedResult = validateAndDeriveDrawValues({
    ...params, // order is important here
    participantMap,
    participants,
    eventEntries,
  });
  if (validDerivedResult.error) return decorateResult({ result: validDerivedResult, stack });
  const { appliedPolicies, policyDefinitions, drawSize, drawType, enforceGender, seedingProfile } = validDerivedResult;

  const eventType = event?.eventType;
  const matchUpType = params.matchUpType ?? eventType;

  const drawFormatResult = getDrawFormat({ ...params, enforceGender, eventType, matchUpType });
  if (drawFormatResult.error) return decorateResult({ result: drawFormatResult, stack });
  const { matchUpFormat, tieFormat } = drawFormatResult;

  const invalidDrawId = params.drawId && typeof params.drawId !== 'string';
  if (invalidDrawId) return decorateResult({ result: { error: INVALID_VALUES }, stack });

  const genResult = generateOrGetExisting({
    ...params, // order is important here
    isMock: params.isMock ?? true,
    policyDefinitions,
    tournamentRecord,
    appliedPolicies,
    matchUpFormat,
    seedingProfile,
    participants,
    eventEntries,
    matchUpType,
    tieFormat,
    drawSize,
    drawType,
    event,
  });
  if (genResult.error) return decorateResult({ result: genResult, stack });
  const { existingDrawDefinition, positioningReports, drawDefinition, structureId, conflicts, entries } = genResult;
  if (!drawDefinition) return decorateResult({ result: { error: INVALID_VALUES }, stack });

  const qualifyingConflicts: any[] = [];

  // generate qualifying structures
  const qGenResult = qualifyingGeneration({
    qualifyingOnly: params.qualifyingOnly,
    existingDrawDefinition,
    qualifyingConflicts,
    positioningReports,
    appliedPolicies,
    drawDefinition,
    seedingProfile,
    participants,
    structureId,
    entries,
    params,
    stack,
  });
  if (qGenResult.error) return qGenResult;

  drawDefinition.drawName = params.drawName ?? (drawType && constantToString(drawType));

  if (drawSize && typeof voluntaryConsolation === 'object' && drawSize >= 4) {
    addVoluntaryConsolationStructure({
      ...voluntaryConsolation,
      drawDefinition,
      matchUpType,
    });
  }

  return {
    existingDrawDefinition: !!existingDrawDefinition,
    qualifyingConflicts,
    positioningReports,
    drawDefinition,
    structureId,
    ...SUCCESS,
    conflicts,
  };
}

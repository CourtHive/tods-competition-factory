import { generateDrawMaticRound, DrawMaticRoundResult } from './generateDrawMaticRound';
import { participantScaleItem } from '@Query/participant/participantScaleItem';
import { getParticipantIds } from './getParticipantIds';
import { isAdHoc } from '@Query/drawDefinition/isAdHoc';
import { generateRange } from '@Tools/arrays';
import { isObject } from '@Tools/objects';

// types and constants
import { INVALID_DRAW_DEFINITION, INVALID_VALUES, STRUCTURE_NOT_FOUND } from '@Constants/errorConditionConstants';
import { DrawMaticArgs, ScaleAttributes, ResultType } from '@Types/factoryTypes';
import { Structure, EventTypeUnion, MatchUp } from '@Types/tournamentTypes';
import { AD_HOC, stageOrder } from '@Constants/drawDefinitionConstants';
import { DYNAMIC, RATING } from '@Constants/scaleConstants';
import { SINGLES_EVENT } from '@Constants/eventConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function drawMatic(
  params: DrawMaticArgs,
): ResultType & { matchUps?: MatchUp[]; roundResults?: DrawMaticRoundResult[] } {
  const paramsCheck = checkParams(params);
  if (paramsCheck?.error) return paramsCheck;

  const idsResult = getParticipantIds(params);
  if (idsResult.error) return idsResult;

  const structureResult = getAdHocStructure(params);
  if (structureResult.error) return structureResult;

  const adHocRatings = getAdHocRatings(params);

  // TODO: update dynamic ratings based on matchUps present from last played round
  // use scaleEngine.generateDynamicRatings(); see dynamicCalculations.test.ts

  const isMock = params.tournamentRecord?.isMock ?? params.isMock;
  const eventType = params.eventType ?? params.event?.eventType;
  const matchUps: MatchUp[] = [];
  const roundResults: any = [];
  let roundNumber;

  for (const iteration of generateRange(1, (params.roundsCount ?? 1) + 1)) {
    const result = generateDrawMaticRound({
      ...params,
      participantIds: idsResult.participantIds,
      structure: structureResult.structure,
      ignoreLastRoundNumber: true,
      iterationMatchUps: matchUps,
      adHocRatings,
      roundNumber,
      eventType,
      isMock,
    });
    if (result.error) return result;

    const { matchUps: roundMatchUps, ...roundResult } = result;
    roundResults.push({ ...roundResult, iteration, matchUpsCount: roundMatchUps?.length });
    roundNumber = (roundResult?.roundNumber ?? 1) + 1;
    if (roundMatchUps?.length) {
      matchUps.push(...roundMatchUps);
    }
  }

  return { ...SUCCESS, matchUps, roundResults };
}

type GetScaleValueArgs = {
  scaleAccessor?: string;
  eventType?: EventTypeUnion;
  scaleType?: string;
  scaleName: string;
  participant: any;
};

function getScaleValue({ scaleType = RATING, scaleAccessor, participant, scaleName, eventType }: GetScaleValueArgs) {
  const scaleAttributes: ScaleAttributes = {
    eventType: eventType ?? SINGLES_EVENT,
    scaleType,
    scaleName,
  };
  const result =
    participant &&
    participantScaleItem({
      scaleAttributes,
      participant,
    });

  const scaleValue = result?.scaleItem?.scaleValue;
  return scaleAccessor && isObject(scaleValue) ? scaleValue[scaleAccessor] : scaleValue;
}

function getAdHocRatings(params) {
  const { tournamentRecord, participantIds, scaleAccessor, scaleName, eventType, adHocRatings = {} } = params;

  const tournamentParticipants = tournamentRecord.participants ?? [];
  for (const participantId of participantIds ?? []) {
    const participant = tournamentParticipants?.find((participant) => participant.participantId === participantId);
    // first see if there is already a dynamic value
    let scaleValue = getScaleValue({
      scaleName: `${scaleName}.${DYNAMIC}`,
      scaleAccessor,
      participant,
      eventType,
    });
    // if no dynamic value found and a seeding scaleValue is provided...
    if (!scaleValue && scaleName) {
      scaleValue = getScaleValue({
        scaleAccessor,
        participant,
        scaleName,
        eventType,
      });
    }

    if (scaleValue && !adHocRatings[participantId]) adHocRatings[participantId] = scaleValue;
  }

  return adHocRatings;
}

function getAdHocStructure(params): ResultType & { structure?: Structure } {
  if (params.structureId) return params.structureId;

  const drawDefinition = params.drawDefinition;
  // if no structureId is specified find the latest AD_HOC stage which has matchUps
  const targetStructure = drawDefinition?.structures
    ?.filter((structure) => structure.stageSequence === 1)
    ?.reduce((targetStructure: any, structure: any) => {
      const orderNumber = structure.stage && stageOrder[structure.stage];
      const structureIsAdHoc = isAdHoc({ structure });

      return structureIsAdHoc && orderNumber > (stageOrder[targetStructure?.stage] || 1) ? structure : targetStructure;
    }, undefined);

  const structure = drawDefinition?.structures?.find(
    (structure) => structure.structureId === targetStructure?.structureId,
  );
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  // an AD_HOC structure is one that has no child structures and in which no matchUps have roundPosition
  const structureIsAdHoc = isAdHoc({ structure });
  if (!structureIsAdHoc) return { error: INVALID_DRAW_DEFINITION };

  return { structure };
}

function checkParams(params) {
  if (params.roundsCount && typeof params.roundsCount !== 'number') {
    return { error: INVALID_VALUES, info: 'roundsCount must be a number' };
  }

  if (
    typeof params.drawDefinition !== 'object' ||
    (params.drawDefinition.drawType && params.drawDefinition.drawType !== AD_HOC)
  ) {
    return { error: INVALID_DRAW_DEFINITION };
  }

  if (
    !Array.isArray(params.drawDefinition?.entries) &&
    params.participantIds &&
    !Array.isArray(params.participantIds)
  ) {
    return { error: INVALID_VALUES, info: 'Missing Entries' };
  }

  return { error: undefined };
}

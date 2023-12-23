import { generateAdHocMatchUps } from '../generateAdHocMatchUps';
import { findStructure } from '../../../../acquire/findStructure';
import { isObject } from '../../../../utilities/objects';
import { getPairingsData } from './getPairingsData';
import { getEncounters } from './getEncounters';
import { getPairings } from './getPairings';

import { ResultType } from '../../../../global/functions/decorateResult';
import { TEAM } from '../../../../constants/participantConstants';
import { HydratedParticipant } from '../../../../types/hydrated';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_PARTICIPANT_IDS,
  MISSING_STRUCTURE,
  NO_CANDIDATES,
  STRUCTURE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  MatchUp,
  Structure,
  Tournament,
  EventTypeUnion,
} from '../../../../types/tournamentTypes';

// this should be in policyDefinitions
const ENCOUNTER_VALUE = 100;
const SAME_TEAM_VALUE = 100;

const MAX_ITERATIONS = 4000;

type GenerateDrawMaticRoundArgs = {
  tournamentParticipants?: HydratedParticipant[];
  adHocRatings?: { [key: string]: number };
  restrictEntryStatus?: boolean;
  drawDefinition: DrawDefinition;
  tournamentRecord: Tournament;
  generateMatchUps?: boolean;
  salted?: number | boolean;
  participantIds?: string[];
  addToStructure?: boolean;
  encounterValue?: number;
  sameTeamValue?: number;
  maxIterations?: number;
  matchUpIds?: string[];
  structure?: Structure;
  structureId?: string;
  eventType?: EventTypeUnion;
  scaleName?: string;
  drawId?: string;
};

export function generateDrawMaticRound({
  encounterValue = ENCOUNTER_VALUE,
  sameTeamValue = SAME_TEAM_VALUE,
  maxIterations = MAX_ITERATIONS,
  generateMatchUps = true,
  tournamentParticipants,
  tournamentRecord,
  participantIds,
  addToStructure,
  drawDefinition,
  adHocRatings,
  structureId,
  salted = 0.5,
  matchUpIds,
  eventType,
  structure,
  scaleName,
}: GenerateDrawMaticRoundArgs):
  | ResultType
  | {
      participantIdPairings: string[][];
      candidatesCount: number;
      matchUps: MatchUp[];
      iterations: number;
      success: boolean;
      maxDelta: number;
      maxDiff: number;
    } {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structure && !structureId) return { error: STRUCTURE_NOT_FOUND };
  if (!structure) {
    structure = findStructure({ drawDefinition, structureId }).structure;
  }
  if (!isObject(structure)) return { error: MISSING_STRUCTURE };

  if (!participantIds?.length) {
    return { error: MISSING_PARTICIPANT_IDS };
  }

  // create valueObject for each previous encounter within the structure
  const { encounters } = getEncounters({ matchUps: structure?.matchUps ?? [] });
  // valueObjects provide "weighting" to each possible pairing of participants
  // {
  //  'P-I-0|P-I-1': 1,
  //  'P-I-0|P-I-2': 1,
  //  'P-I-0|P-I-3': 1
  // }

  const valueObjects: any = {};
  for (const pairing of encounters) {
    if (!valueObjects[pairing]) valueObjects[pairing] = 0;
    valueObjects[pairing] += encounterValue;
  }

  const teamParticipants = tournamentParticipants?.filter(
    ({ participantType }) => participantType === TEAM
  );
  if (teamParticipants) {
    // add SAME_TEAM_VALUE for participants who appear on the same team
    for (const teamParticipant of teamParticipants) {
      const participantIds = teamParticipant.individualParticipantIds ?? [];
      const { uniquePairings } = getPairingsData({ participantIds });
      for (const pairing of uniquePairings) {
        if (!valueObjects[pairing]) valueObjects[pairing] = 0;
        valueObjects[pairing] += sameTeamValue;
      }
    }
  }

  // deltaObjects contain the difference in ratings between two participants
  // {
  //  'P-I-0|P-I-1': 0,
  //  'P-I-0|P-I-2': 0,
  //  'P-I-0|P-I-3': 0
  // }
  const { uniquePairings, possiblePairings, deltaObjects } = getPairingsData({
    participantIds,
  });

  const params = {
    tournamentParticipants,
    possiblePairings,
    drawDefinition,
    participantIds,
    uniquePairings,
    maxIterations,
    adHocRatings,
    deltaObjects,
    valueObjects,
    eventType,
    scaleName,
    structure,
    salted,
  };

  const { candidatesCount, participantIdPairings, iterations, candidate } =
    getPairings(params);

  if (!candidatesCount) return { error: NO_CANDIDATES };

  let matchUps;
  if (generateMatchUps) {
    const result = generateAdHocMatchUps({
      structureId: structure?.structureId,
      participantIdPairings,
      tournamentRecord,
      addToStructure,
      newRound: true,
      drawDefinition,
      matchUpIds,
    });
    if (result.error) return result;
    matchUps = result.matchUps;
  }

  const { maxDelta, maxDiff } = candidate;

  return {
    ...SUCCESS,
    participantIdPairings,
    candidatesCount,
    iterations,
    matchUps,
    maxDelta,
    maxDiff,
  };
}

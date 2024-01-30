import { generateAdHocMatchUps } from '../generateAdHocMatchUps';
import { findStructure } from '@Acquire/findStructure';
import { getPairingsData } from './getPairingsData';
import { getEncounters } from './getEncounters';
import { getPairings } from './getPairings';
import { isObject } from '@Tools/objects';

// constants and types
import { TEAM } from '@Constants/participantConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { ResultType } from '@Types/factoryTypes';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_PARTICIPANT_IDS,
  MISSING_STRUCTURE,
  NO_CANDIDATES,
  STRUCTURE_NOT_FOUND,
} from '@Constants/errorConditionConstants';
import { DrawDefinition, MatchUp, Structure, EventTypeUnion, Event, Tournament } from '@Types/tournamentTypes';

// this should be in policyDefinitions
const ENCOUNTER_VALUE = 100;
const SAME_TEAM_VALUE = 100;

const MAX_ITERATIONS = 4000;

type GenerateDrawMaticRoundArgs = {
  adHocRatings?: { [key: string]: number };
  ignoreLastRoundNumber?: boolean;
  restrictEntryStatus?: boolean;
  iterationMatchUps?: MatchUp[];
  drawDefinition: DrawDefinition;
  tournamentRecord: Tournament;
  generateMatchUps?: boolean;
  eventType?: EventTypeUnion;
  salted?: number | boolean;
  participantIds?: string[];
  encounterValue?: number;
  sameTeamValue?: number;
  maxIterations?: number;
  matchUpIds?: string[];
  structure?: Structure;
  roundNumber?: number;
  structureId?: string;
  scaleName?: string;
  idPrefix?: string;
  isMock?: boolean;
  drawId?: string;
  event: Event;
};

export type DrawMaticRoundResult = {
  participantIdPairings?: string[][];
  candidatesCount?: number;
  roundNumber?: number;
  matchUps?: MatchUp[];
  iterations?: number;
  success?: boolean;
  maxDelta?: number;
  maxDiff?: number;
};

export function generateDrawMaticRound({
  encounterValue = ENCOUNTER_VALUE,
  sameTeamValue = SAME_TEAM_VALUE,
  maxIterations = MAX_ITERATIONS,
  generateMatchUps = true,
  ignoreLastRoundNumber,
  iterationMatchUps, // necessary when called iteratively and matchUps are not yet added to structure
  tournamentRecord,
  participantIds,
  drawDefinition,
  adHocRatings,
  salted = 0.5,
  roundNumber,
  structureId,
  matchUpIds,
  eventType,
  structure,
  scaleName,
  idPrefix,
  isMock,
  event,
}: GenerateDrawMaticRoundArgs): ResultType & DrawMaticRoundResult {
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
  const consideredMatchUps = [...(iterationMatchUps ?? []), ...(structure?.matchUps ?? [])];
  const { encounters } = getEncounters({ matchUps: consideredMatchUps });

  const tournamentParticipants = tournamentRecord?.participants ?? [];

  const { valueObjects } = getValueObjects({
    tournamentParticipants,
    encounterValue,
    sameTeamValue,
    encounters,
  });

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

  const { candidatesCount, participantIdPairings, iterations, candidate } = getPairings(params);

  if (!candidatesCount) return { error: NO_CANDIDATES };

  let generatedRoundNumber;
  let matchUps;

  if (generateMatchUps) {
    const result = generateAdHocMatchUps({
      structureId: structure?.structureId,
      ignoreLastRoundNumber,
      participantIdPairings,
      newRound: true,
      drawDefinition,
      roundNumber,
      matchUpIds,
      idPrefix,
      isMock,
      event,
    });
    if (result.error) return result;
    generatedRoundNumber = result.roundNumber;
    matchUps = result.matchUps;
  }

  const { maxDelta, maxDiff } = candidate;

  return {
    roundNumber: generatedRoundNumber,
    participantIdPairings,
    candidatesCount,
    ...SUCCESS,
    iterations,
    matchUps,
    maxDelta,
    maxDiff,
  };
}

function getValueObjects({ encounters, tournamentParticipants, encounterValue, sameTeamValue }) {
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

  const teamParticipants = tournamentParticipants?.filter(({ participantType }) => participantType === TEAM);
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

  return { valueObjects };
}

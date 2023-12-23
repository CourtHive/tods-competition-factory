/**
 * Builds up an exhaustive map of all matchUpIds on which a matchUpId is depdendent
 * Optionally builds up an exhaustive map of all potential participantIds for each matchUpId
 */

import { allDrawMatchUps } from './getAllDrawMatchUps';
import { addGoesTo } from '../../drawEngine/governors/matchUpGovernor/addGoesTo';
import { getIndividualParticipantIds } from '../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getIndividualParticipantIds';
import { findEvent } from '../../acquire/findEvent';
import { allCompetitionMatchUps } from './getAllCompetitionMatchUps';
import { matchUpSort } from '../../functions/sorters/matchUpSort';

import { POSITION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  ErrorType,
  MISSING_DRAW_ID,
  MISSING_MATCHUPS,
  MISSING_MATCHUP_IDS,
} from '../../constants/errorConditionConstants';

import { TournamentRecords } from '../../types/factoryTypes';
import { HydratedMatchUp } from '../../types/hydrated';
import {
  DrawDefinition,
  DrawLink,
  Tournament,
} from '../../types/tournamentTypes';

type GetMatchUpDependenciesArgs = {
  tournamentRecords?: TournamentRecords;
  includeParticipantDependencies?: boolean;
  matchUps?: HydratedMatchUp[]; // requires matchUps { inContext: true }
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  matchUpIds?: string[]; // will restrict dependency checking if prior matchUpIds are not included
  drawIds?: string[];
};

export function getMatchUpDependencies(params: GetMatchUpDependenciesArgs): {
  sourceMatchUpIds?: { [key: string]: any[] };
  matchUps?: HydratedMatchUp[];
  positionDependencies?: any;
  matchUpDependencies?: any;
  error?: ErrorType;
  success?: boolean;
} {
  let tournamentRecords = params.tournamentRecords ?? {};
  const targetMatchUps = params.matchUps ?? []; // requires matchUps { inContext: true }
  let drawIds = params.drawIds ?? [];

  const { includeParticipantDependencies, tournamentRecord, drawDefinition } =
    params;

  if (!Array.isArray(targetMatchUps)) return { error: MISSING_MATCHUPS };
  if (!Array.isArray(drawIds)) return { error: MISSING_DRAW_ID };

  const matchUpIds = params.matchUpIds?.length
    ? params.matchUpIds
    : targetMatchUps.map((matchUp) => matchUp.matchUpId);
  if (!Array.isArray(matchUpIds)) return { error: MISSING_MATCHUP_IDS };

  const positionDependencies = {};
  const matchUpDependencies = {};
  const sourceStructureIdMap = {};
  const sourceMatchUpIds = {};

  if (tournamentRecord && !Object.keys(tournamentRecords).length)
    tournamentRecords = { [tournamentRecord.tournamentId]: tournamentRecord };

  const allTournamentRecords: Tournament[] = Object.values(tournamentRecords);

  const allLinks: DrawLink[] = allTournamentRecords.reduce(
    (allLinks: any[], tournamentRecord) => {
      return allLinks
        .concat(tournamentRecord.events ?? [])
        .map((event) =>
          (event.drawDefinitions || []).map(
            (drawDefinition) => drawDefinition.links || []
          )
        )
        .flat(Infinity);
    },
    []
  );

  const positionLinks = allLinks.filter(
    ({ linkType }) => linkType === POSITION
  );

  let matchUps: HydratedMatchUp[] | undefined = targetMatchUps;

  if (positionLinks.length) {
    matchUps = allCompetitionMatchUps({
      nextMatchUps: true,
      tournamentRecords,
    }).matchUps;

    // sourceStructureIdMap returns the sourceStructureId for a given targetStructureId
    const sourceStructureIds = positionLinks.reduce(
      (structureIds: string[], link) => {
        const sourceStructureId = link.source?.structureId;
        const targetStructureId = link.target?.structureId;
        if (sourceStructureId && targetStructureId)
          sourceStructureIdMap[targetStructureId] = sourceStructureId;
        if (sourceStructureId && !structureIds.includes(sourceStructureId))
          structureIds.push(sourceStructureId);
        return structureIds;
      },
      []
    );

    // positionDependencies map a sourceStructureId to the matchUpIds which it contains
    for (const sourceStructureId of sourceStructureIds) {
      positionDependencies[sourceStructureId] = [];
    }
    for (const matchUp of matchUps ?? []) {
      // pertains to Round Robins and e.g. Swiss rounds; Round Robins require hoisting to containing structure
      const sourceStructureId =
        matchUp.containerStructureId || matchUp.structureId;
      if (sourceStructureIds.includes(sourceStructureId)) {
        positionDependencies[sourceStructureId].push(matchUp.matchUpId);
      }
    }
  }

  const initializeMatchUpId = (matchUpId) => {
    if (!matchUpDependencies[matchUpId]) {
      matchUpDependencies[matchUpId] = {
        dependentMatchUpIds: [],
        participantIds: [],
        matchUpIds: [],
        sources: [],
      };
      sourceMatchUpIds[matchUpId] = [];
    }
  };

  const propagateDependencies = (matchUpId, targetMatchUpId) => {
    const propagatedMatchUpIds = matchUpDependencies[matchUpId].matchUpIds;

    // push all existing dependents onto target dependents
    propagatedMatchUpIds.forEach((matchUpIdDependency) => {
      matchUpDependencies[targetMatchUpId].matchUpIds.push(matchUpIdDependency);
    });

    matchUpDependencies[targetMatchUpId].matchUpIds.push(matchUpId);
    matchUpDependencies[matchUpId].dependentMatchUpIds.push(targetMatchUpId);

    if (includeParticipantDependencies) {
      matchUpDependencies[matchUpId].participantIds.forEach(
        (participantIdDependency) =>
          matchUpDependencies[targetMatchUpId].participantIds.push(
            participantIdDependency
          )
      );
    }
  };

  const processMatchUps = (matchUpsToProcess) => {
    const processSourceStructures = Object.keys(positionDependencies).length;

    for (const matchUp of matchUpsToProcess || []) {
      const { matchUpId, winnerMatchUpId, loserMatchUpId } = matchUp;

      // only process specified matchUps
      if (!matchUpIds.length || matchUpIds.includes(matchUpId)) {
        initializeMatchUpId(matchUpId);

        if (includeParticipantDependencies) {
          const { individualParticipantIds } =
            getIndividualParticipantIds(matchUp);
          matchUpDependencies[matchUpId].participantIds =
            individualParticipantIds;
        }

        if (winnerMatchUpId) {
          initializeMatchUpId(winnerMatchUpId);
          propagateDependencies(matchUpId, winnerMatchUpId);
          sourceMatchUpIds[winnerMatchUpId].push(matchUpId);
        }
        if (loserMatchUpId) {
          initializeMatchUpId(loserMatchUpId);
          propagateDependencies(matchUpId, loserMatchUpId);
          sourceMatchUpIds[loserMatchUpId].push(matchUpId);
        }

        matchUpDependencies[matchUpId].sources.push(
          sourceMatchUpIds[matchUpId]
        );
        const s1 = sourceMatchUpIds[matchUpId]
          .map((id) => matchUpDependencies[id].sources[0])
          .flat();
        const s2 = sourceMatchUpIds[matchUpId]
          .map((id) => matchUpDependencies[id].sources[1])
          .flat();
        matchUpDependencies[matchUpId].sources.push(...[s1, s2]);

        if (processSourceStructures) {
          const relevantStructureId =
            matchUp.containerStructureId || matchUp.structureId;
          const sourceStructureId = sourceStructureIdMap[relevantStructureId];
          if (positionDependencies[sourceStructureId]) {
            for (const matchUpDependency of positionDependencies[
              sourceStructureId
            ]) {
              initializeMatchUpId(matchUpDependency);
              propagateDependencies(matchUpDependency, matchUpId);
              sourceMatchUpIds[matchUpDependency].push(matchUpId);
            }
          }
        }
      }
    }
  };

  if (drawDefinition) {
    addGoesTo({ drawDefinition });
    if (!matchUps?.length) {
      matchUps = allDrawMatchUps({ drawDefinition }).matchUps;
    }
    processMatchUps(matchUps);
  } else {
    if (!matchUps?.length) {
      matchUps = allCompetitionMatchUps({
        nextMatchUps: true,
        tournamentRecords,
      }).matchUps;
    }

    if (!drawIds.length) {
      const allDrawIds = allTournamentRecords?.length
        ? allTournamentRecords
            .map(({ events = [] }) =>
              events.map(({ drawDefinitions = [] }) =>
                drawDefinitions.map(({ drawId }) => drawId)
              )
            )
            .flat(Infinity)
        : [];
      if (allDrawIds) drawIds = allDrawIds as string[];
    }

    for (const drawId of drawIds) {
      const drawMatchUps = matchUps
        // first get all matchUps for the draw
        ?.filter((matchUp) => matchUp.drawId === drawId)
        // sort by stage/stageSequence/roundNumber/roundPosition
        .sort(matchUpSort);

      const isRoundRobin = drawMatchUps?.find(
        ({ roundPosition }) => !roundPosition
      );
      // skip this if Round Robin because there is no "Goes To"
      if (!isRoundRobin) {
        const hasTournamentId = drawMatchUps?.find(
          ({ tournamentId }) => tournamentId
        );
        const { drawDefinition } = findEvent({
          tournamentRecord: tournamentRecords[hasTournamentId?.tournamentId],
          drawId,
        });
        if (drawDefinition) addGoesTo({ drawDefinition });
      }

      processMatchUps(drawMatchUps);
    }
  }

  return {
    positionDependencies,
    matchUpDependencies,
    sourceMatchUpIds,
    matchUps,
    ...SUCCESS,
  };
}

import { getAllStructureMatchUps } from '../../../query/matchUps/getAllStructureMatchUps';
import { generateCollectionMatchUps } from '../../../assemblies/generators/drawDefinitions/tieMatchUps';
import { getTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/getTieFormat';
import { compareTieFormats } from '../../../matchUpEngine/governors/tieFormatGovernor/compareTieFormats';
import { copyTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/copyTieFormat';
import { validUpdate } from '../../../validators/validUpdate';
import {
  addMatchUpsNotice,
  deleteMatchUpsNotice,
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../notifications/drawNotifications';
import {
  ResultType,
  decorateResult,
} from '../../../global/functions/decorateResult';
import {
  extractAttributes as xa,
  instanceCount,
  intersection,
  makeDeepCopy,
} from '../../../utilities';

import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  CANNOT_MODIFY_TIEFORMAT,
  ErrorType,
  INVALID_MATCHUP,
  INVALID_TIE_FORMAT,
  MISSING_DRAW_DEFINITION,
  MISSING_TIE_FORMAT,
} from '../../../constants/errorConditionConstants';

import {
  DrawDefinition,
  Event,
  MatchUp,
  Structure,
  TieFormat,
  Tournament,
} from '../../../types/tournamentTypes';

// used to determine that all collections have the same collectionIds
function checkStructureMatchUpCounts({ from, to }) {
  const referenceKeys = Object.keys(from);
  const sameKeys =
    intersection(referenceKeys, Object.keys(to)).length ===
    referenceKeys.length;

  const differentMatchUpsCount = referenceKeys.filter(
    (collectionId) => from[collectionId] !== to[collectionId]
  );
  const matchUpsCountChanges = differentMatchUpsCount.map((collectionId) => ({
    countChange: to[collectionId] - from[collectionId],
    collectionId,
  }));

  const sameMatchUpsCount = referenceKeys.every((key) => from[key] === to[key]);
  const equivalent = sameKeys && sameMatchUpsCount;
  return { equivalent, matchUpsCountChanges };
}

type UpdateTieFormatArgs = {
  updateInProgressMatchUps?: boolean;
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  structure?: Structure;
  tieFormat: TieFormat;
  matchUp?: MatchUp;
  eventId?: string;
  uuids?: string[];
  event?: Event;
};

type UpdateTieFormatResult = {
  modifiedStructuresCount?: number;
  modifiedMatchUpsCount?: number;
  addedMatchUpsCount?: number;
  modifiedCount?: number;
  tieFormat?: TieFormat;
  error?: ErrorType;
};

export function updateTieFormat({
  updateInProgressMatchUps,
  tournamentRecord,
  drawDefinition,
  structure,
  tieFormat,
  eventId,
  matchUp,
  event,
  uuids,
}: UpdateTieFormatArgs): UpdateTieFormatResult {
  const stack = 'updateTieFormat';
  const tournamentId = tournamentRecord?.tournamentId;
  let modifiedStructuresCount = 0;
  let modifiedMatchUpsCount = 0;
  let addedMatchUpsCount = 0;
  let modifiedCount = 0;

  const collectionMap = tieFormat?.collectionDefinitions.reduce(
    (instanceMap, def) => {
      instanceMap[def.collectionId] =
        (instanceMap[def.collectionId] || 0) + def.matchUpCount;
      return instanceMap;
    },
    {}
  );

  const matchingCollections = ({ tieFormat }) => {
    const cMap = tieFormat?.collectionDefinitions.reduce((instanceMap, def) => {
      instanceMap[def.collectionId] =
        (instanceMap[def.collectionId] || 0) + def.matchUpCount;
      return instanceMap;
    }, {});
    return checkStructureMatchUpCounts({ from: cMap, to: collectionMap })
      .equivalent;
  };

  const drawDefaultTieFormat = getTieFormat({ drawDefinition })?.tieFormat;
  const eventDefaultTieFormat = getTieFormat({ event })?.tieFormat;

  if (event && eventId) {
    for (const drawDefinition of event.drawDefinitions ?? []) {
      processDrawDefinition({ drawDefinition });
    }
    event.tieFormat = copyTieFormat(tieFormat);
    modifiedCount += 1;
  } else if (matchUp) {
    if (!matchUp.tieMatchUps) {
      return decorateResult({ result: { error: INVALID_MATCHUP }, stack });
    }
    // ensure that all tieMatchUps are referenced by tieFormat
    const matchUpMap = instanceCount(
      matchUp.tieMatchUps?.map(({ collectionId }) => collectionId)
    );
    const check = checkStructureMatchUpCounts({
      to: collectionMap,
      from: matchUpMap,
    });
    const { changes, changesArePossible, cannotChangeReaon } =
      getMatchUpChangesArePossible({
        matchUp,
        check,
      });

    if (check.equivalent) {
      if (validUpdate({ matchUp, updateInProgressMatchUps })) {
        matchUp.tieFormat = copyTieFormat(tieFormat);
        modifiedCount += 1;
      } else {
        return decorateResult({
          result: { error: CANNOT_MODIFY_TIEFORMAT },
          info: 'matchUp is IN_PROGRESS or COMPLETE',
          stack,
        });
      }
    } else if (changesArePossible) {
      makeChanges({ tieFormat, matchUp, changes, uuids });
    } else {
      return decorateResult({
        context: { collectionMap, matchUpMap },
        result: { error: INVALID_TIE_FORMAT },
        info: cannotChangeReaon || 'specified changes not possible',
        stack,
      });
    }

    modifiedMatchUpsCount += 1;
    modifyMatchUpNotice({
      eventId: event?.eventId,
      context: stack,
      drawDefinition,
      tournamentId,
      matchUp,
    });
  } else if (structure) {
    // all TEAM matchUps within the structure have tieMatchUps which were created following a tieFormat which occurs higher in the hierarchy
    // attaching a tieFormat to the structure must ensure that affected TEAM matchUps within the structure all have appropriate tieMatchUps
    // therefore those that fail to match the modified tieFormat MUST have an appropriate tieFormat attached from higher in the hierarchy
    const inheritedTieFormat = drawDefaultTieFormat ?? eventDefaultTieFormat;
    const modified = processStructure({
      inheritedTieFormat,
      structure,
    })?.modifiedMatchUpsCount;

    if (modified) {
      modifiedMatchUpsCount += modified;
      modifiedStructuresCount += 1;
      modifiedCount += 1;
    }

    const different =
      !structure.tieFormat ||
      compareTieFormats({
        ancestor: structure.tieFormat,
        descendant: tieFormat,
      }).different;

    if (different) {
      structure.tieFormat = copyTieFormat(tieFormat);
      modifiedStructuresCount += 1;
      modifiedCount += 1;
    }

    (modified || different) &&
      drawDefinition &&
      modifyDrawNotice({
        structureIds: [structure.structureId],
        eventId: event?.eventId,
        drawDefinition,
      });
  } else if (drawDefinition) {
    processDrawDefinition({ drawDefinition });
    drawDefinition.tieFormat = copyTieFormat(tieFormat);
    modifiedCount += 1;
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }

  return {
    modifiedStructuresCount,
    modifiedMatchUpsCount,
    addedMatchUpsCount,
    modifiedCount,
    ...SUCCESS,
    tieFormat,
  };

  function processDrawDefinition({ drawDefinition }) {
    const structures = drawDefinition.structures || [];
    const modifiedStructureIds: string[] = [];

    for (const structure of structures) {
      // if a sub-structure has a tieFormat then setting drawDefinition.tieFormat will have no effect
      if (structure.tieFormat) continue;

      const inheritedTieFormat = eventDefaultTieFormat;
      const modifiedCount = processStructure({
        inheritedTieFormat,
        structure,
      })?.modifiedMatchUpsCount;

      if (modifiedCount) {
        modifiedStructuresCount += 1;
        modifiedMatchUpsCount += modifiedCount;
        const structureId = structure.structureId;
        modifiedStructureIds.push(structureId);
      }
    }

    modifyDrawNotice({
      structureIds: modifiedStructureIds,
      eventId: event?.eventId,
      drawDefinition,
    });

    return modifiedStructureIds.length;
  }

  function processStructure({ inheritedTieFormat, structure }): ResultType & {
    modifiedMatchUpsCount?: number;
  } {
    let modifiedMatchUpsCount = 0;
    const structureMatchUps =
      getAllStructureMatchUps({
        matchUpFilters: { matchUpTypes: [TEAM] },
        structure,
      })?.matchUps || [];

    for (const matchUp of structureMatchUps) {
      const validToUpdate = validUpdate({ matchUp, updateInProgressMatchUps });

      let modified = false;
      const tieMatchUpsMap = instanceCount(
        matchUp.tieMatchUps?.map(({ collectionId }) => collectionId)
      );
      const check = checkStructureMatchUpCounts({
        from: tieMatchUpsMap,
        to: collectionMap,
      });
      if (!check.equivalent) {
        const { changes, changesArePossible } = getMatchUpChangesArePossible({
          matchUp,
          check,
        });

        if (changesArePossible && !matchUp.tieFormat) {
          makeChanges({ changes, matchUp, tieFormat, uuids });
        } else if (inheritedTieFormat) {
          const different =
            !matchUp.tieFormat ||
            compareTieFormats({
              ancestor: inheritedTieFormat,
              descendant: matchUp.tieFormat,
            }).different;

          if (different) {
            matchUp.tieFormat = inheritedTieFormat;
            modified = true;
          }
        } else {
          return decorateResult({
            result: { error: MISSING_TIE_FORMAT },
            stack,
          });
        }
      } else if (
        matchUp.tieFormat &&
        matchingCollections(matchUp) &&
        validToUpdate
      ) {
        matchUp.tieFormat = copyTieFormat(tieFormat);
        modified = true;
      }

      if (modified) {
        modifiedMatchUpsCount += 1;
        modifyMatchUpNotice({
          tournamentId: tournamentRecord?.tournamentId,
          drawDefinition,
          context: stack,
          eventId,
          matchUp,
        });
      }
    }

    return { modifiedMatchUpsCount };
  }

  function makeChanges({ uuids, matchUp, tieFormat, changes }) {
    matchUp.tieFormat = copyTieFormat(tieFormat);
    const matchUpIdsRemoved: string[] = [];
    const matchUpsAdded: MatchUp[] = [];

    changes.forEach((change) => {
      if (change.countChange > 0) {
        const collectionPositionOffset = Math.max(
          0,
          ...matchUp.tieMatchUps
            .filter(
              (tieMatchUp) => tieMatchUp.collectionId === change.collectionId
            )
            .map(xa('collectionPosition'))
        );
        const collectionDefinition = tieFormat.collectionDefinitions.find(
          (def) => def.collectionId === change.collectionId
        );
        const newMatchUps: MatchUp[] = generateCollectionMatchUps({
          matchUpsLimit: change.countChange,
          collectionPositionOffset,
          collectionDefinition,
          uuids,
        });
        matchUpsAdded.push(...makeDeepCopy(newMatchUps, false, true));
        addedMatchUpsCount += matchUpsAdded.length;
        matchUp.tieMatchUps.push(...newMatchUps);
      } else {
        const tieMatchUpIdsToRemove = change.toBePlayedTieMatchUpIds.slice(
          0,
          Math.abs(change.countChange)
        );
        console.log('remove', tieMatchUpIdsToRemove.length);
        matchUpIdsRemoved.push(...tieMatchUpIdsToRemove);
        matchUp.tieMatchUps = matchUp.tieMatchUps.filter(
          ({ matchUpId }) => !tieMatchUpIdsToRemove.includes(matchUpId)
        );
      }
    });

    matchUpsAdded.length &&
      addMatchUpsNotice({
        matchUps: matchUpsAdded,
        drawDefinition,
        tournamentId,
        eventId,
      });

    matchUpIdsRemoved.length &&
      deleteMatchUpsNotice({
        matchUpIds: matchUpIdsRemoved,
        action: 'updateTieFormat',
        drawDefinition,
        tournamentId,
        eventId,
      });

    return { matchUpIdsRemoved, matchUpsAdded };
  }
}

function getMatchUpChangesArePossible({ check, matchUp }) {
  let cannotChangeReaon = '';
  const changes: any[] = [];

  const changesArePossible = check.matchUpsCountChanges.every(
    ({ collectionId, countChange }) => {
      const toBePlayedTieMatchUpIds = matchUp.tieMatchUps
        .filter(
          (tieMatchUp) =>
            tieMatchUp.collectionId === collectionId &&
            tieMatchUp.matchUpStatus === TO_BE_PLAYED
        )
        .map(xa('matchUpId'));

      const possibleToChange =
        toBePlayedTieMatchUpIds.length + countChange >= 0 || countChange > 0;

      if (!possibleToChange && countChange < 0)
        cannotChangeReaon = 'Insufficient TO_BE_PLAYED matchUps';

      changes.push({
        toBePlayedTieMatchUpIds,
        collectionId,
        countChange,
      });
      return possibleToChange;
    }
  );
  return { changesArePossible, changes, cannotChangeReaon };
}

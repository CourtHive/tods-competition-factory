import { matchUpIsComplete } from '../../../matchUpEngine/governors/queryGovernor/matchUpIsComplete';
import { structureAssignedDrawPositions } from '../positionsGetter';
import { getAllStructureMatchUps } from './getAllStructureMatchUps';
import { findStructure } from '../findStructure';

import { ResultType } from '../../../global/functions/decorateResult';
import { HydratedMatchUp } from '../../../types/hydrated';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  DrawDefinition,
  Event,
  Participant,
  Structure,
  Tournament,
} from '../../../types/tournamentFromSchema';
import {
  ABANDONED,
  upcomingMatchUpStatuses,
} from '../../../constants/matchUpStatusConstants';

/*
  completedMatchUps are those matchUps where a winningSide is defined
  upcomingMatchUps are those matchUps where both drawPositions are defined
  ===> If requireParticipants then upcmoingMatchUps require drawPositions to be assigned
  pendingMatchUps are those matchUps where a drawPosition is undefined
  *AND* where both drawPositions map to assigned participantIds
*/

type GroupsMatchUpsResult = {
  abandonedMatchUps?: HydratedMatchUp[];
  completedMatchUps?: HydratedMatchUp[];
  upcomingMatchUps?: HydratedMatchUp[];
  pendingMatchUps?: HydratedMatchUp[];
  byeMatchUps?: HydratedMatchUp[];
  includesTeamMatchUps?: boolean;
  structure?: Structure;
};

type GetStructureMatchUpsArgs = {
  tournamentParticipants?: Participant[];
  scheduleVisibilityFilters?: any;
  tournamentAppliedPolicies?: any;
  requireParticipants?: boolean;
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  afterRecoveryTimes?: boolean;
  policyDefinitions?: any;
  structure?: Structure;
  matchUpFilters?: any;
  contextContent?: any;
  contextFilters?: any;
  participantMap?: any;
  scheduleTiming?: any;
  structureId?: string;
  inContext?: boolean;
  contextProfile?: any;
  exitProfiles?: any;
  matchUpsMap?: any;
  context?: any;
  event?: Event;
};

export function getStructureMatchUps({
  requireParticipants = true,
  scheduleVisibilityFilters,
  tournamentAppliedPolicies,
  tournamentParticipants,
  afterRecoveryTimes,
  policyDefinitions,
  tournamentRecord,
  matchUpFilters,
  contextFilters,
  contextContent,
  participantMap,
  scheduleTiming,
  contextProfile,
  drawDefinition,
  exitProfiles,
  matchUpsMap,
  structureId,
  inContext,
  structure,
  context,
  event,
}: GetStructureMatchUpsArgs): ResultType & GroupsMatchUpsResult {
  if (!structure && structureId) {
    ({ structure } = findStructure({ drawDefinition, structureId }));
  }

  const result = getAllStructureMatchUps({
    tournamentAppliedPolicies,
    scheduleVisibilityFilters,
    tournamentParticipants,
    afterRecoveryTimes,
    policyDefinitions,
    tournamentRecord,
    drawDefinition,
    matchUpFilters,
    contextFilters,
    contextProfile,
    contextContent,
    participantMap,
    scheduleTiming,
    exitProfiles,
    matchUpsMap,
    structure,
    inContext,
    context,
    event,
  });

  const byeMatchUps: any[] = [];
  const pendingMatchUps: any[] = [];
  const upcomingMatchUps: any[] = [];
  const abandonedMatchUps: any[] = [];
  const completedMatchUps: any[] = [];

  if (result.error) result;
  const { matchUps } = result;

  const { assignedPositions } = structureAssignedDrawPositions({ structure });
  const participantAssignedDrawPositions = assignedPositions
    ?.filter((assignment) => assignment.participantId)
    .map((assignment) => assignment.drawPosition);

  let includesTeamMatchUps;

  matchUps
    .filter((matchUp) => {
      const teamsMatchUpsOnly =
        matchUpFilters?.matchUpTypes?.length === 1 &&
        matchUpFilters.matchUpTypes[0] === TEAM;
      return !(matchUp.matchUpType !== TEAM && teamsMatchUpsOnly);
    })
    .forEach((matchUp) => {
      if (matchUp.matchUpStatus === ABANDONED) {
        abandonedMatchUps.push(matchUp);
        return;
      }

      if (matchUp.matchUpType === TEAM) includesTeamMatchUps = true;

      const isCollectionMatchUp = matchUp.collectionId;
      const collectionSidesAssigned =
        isCollectionMatchUp &&
        matchUp.sides?.every((side) => side.participantId);

      const drawPositionsFilled =
        !isCollectionMatchUp &&
        matchUp.drawPositions?.filter(Boolean).length === 2;
      const drawPositionsAssigned =
        !isCollectionMatchUp &&
        matchUp.drawPositions?.every(
          (drawPosition) =>
            participantAssignedDrawPositions?.includes(drawPosition)
        );

      const byeAssignedDrawPositions = assignedPositions
        ?.filter((assignment) => assignment.bye)
        .map((assignment) => assignment.drawPosition);

      const isByeMatchUp =
        !isCollectionMatchUp &&
        matchUp.drawPositions?.find(
          (drawPosition) => byeAssignedDrawPositions?.includes(drawPosition)
        );

      const validUpcomingMatchUpStatus = upcomingMatchUpStatuses.includes(
        matchUp.matchUpStatus
      );
      const isUpcomingMatchUp =
        validUpcomingMatchUpStatus &&
        (collectionSidesAssigned ||
          (drawPositionsFilled &&
            (!requireParticipants || drawPositionsAssigned)));

      if (isByeMatchUp) return byeMatchUps.push(matchUp);
      if (matchUpIsComplete({ matchUp }))
        return completedMatchUps.push(matchUp);
      if (isUpcomingMatchUp) return upcomingMatchUps.push(matchUp);
      return pendingMatchUps.push(matchUp);
    });

  return {
    includesTeamMatchUps,
    abandonedMatchUps,
    completedMatchUps,
    upcomingMatchUps,
    pendingMatchUps,
    byeMatchUps,
    structure,
  };
}

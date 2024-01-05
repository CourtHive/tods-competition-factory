import { getEligibleVoluntaryConsolationParticipants } from '../../../query/drawDefinition/getEligibleVoluntaryConsolationParticipants';
import { getMatchUpFormatTimingUpdate } from '../../../query/extensions/matchUpFormatTiming/getMatchUpFormatTimingUpdate';
import { getDrawParticipantRepresentativeIds } from '../../../mutate/drawDefinitions/getDrawParticipantRepresentativeIds';
import { getEventMatchUpFormatTiming } from '../../../query/extensions/matchUpFormatTiming/getEventMatchUpFormatTiming';
import { getModifiedMatchUpFormatTiming } from '../../../query/extensions/matchUpFormatTiming/getModifiedMatchUpTiming';
import { getValidGroupSizes } from '../../../assemblies/generators/drawDefinitions/drawTypes/roundRobin/roundRobin';
import { getMatchUpFormatTiming } from '../../../query/extensions/matchUpFormatTiming/getMatchUpFormatTiming';
import { getScheduledRoundsDetails } from '../../../query/matchUps/scheduling/getScheduledRoundsDetails';
import { getSchedulingProfileIssues } from '../../../query/matchUps/scheduling/getSchedulingProfileIssues';
import { getCompetitionPenalties } from '../../../mutate/participants/penalties/getCompetitionPenalties';
import { roundRobinGroups } from '../../generators/drawDefinitions/drawTypes/roundRobin/roundRobinGroups';
import { getTournamentPenalties } from '../../../mutate/participants/penalties/getTournamentPenalties';
import { getMatchUpDailyLimitsUpdate } from '../../../query/extensions/getMatchUpDailyLimitsUpdate';
import { getCompetitionParticipants } from '../../../query/participants/getCompetitionParticipants';
import { getParticipantIdFinishingPositions } from '../../../query/drawDefinition/finishingPositions';
import { getSeedingThresholds } from '../../../mutate/drawDefinitions/positionGovernor/getSeedBlocks';
import { participantScheduledMatchUps } from '../../../query/matchUps/participantScheduledMatchUps';
import { getParticipantEventDetails } from '../../../query/participants/getParticipantEventDetails';
import { getStructureSeedAssignments } from '../../../query/structure/getStructureSeedAssignments';
import { getAssignedParticipantIds } from '../../../query/drawDefinition/getAssignedParticipantIds';
import { tallyParticipantResults } from '../../../query/matchUps/roundRobinTally/roundRobinTally';
import { competitionScheduleMatchUps } from '../../../query/matchUps/competitionScheduleMatchUps';
import { getMatchUpCompetitiveProfile } from '../../../query/matchUp/getMatchUpCompetitiveProfile';
import { getParticipantMembership } from '../../../query/participants/getParticipantMembership';
import { tieFormatGenderValidityCheck } from '../../../validators/tieFormatGenderValidityCheck';
import { bulkUpdatePublishedEventIds } from '../../../query/event/bulkUpdatePublishedEventIds';
import { positionActions } from '../../../query/drawDefinition/positionActions/positionActions';
import { getParticipantSchedules } from '../../../query/participants/getParticipantSchedules';
import { validateCollectionDefinition } from '../../../validators/validateCollectionDefinition';
import { getMatchUpScheduleDetails } from '../../../query/matchUp/getMatchUpScheduleDetails';
import { getCompetitionDateRange } from '../../../query/tournaments/getCompetitionDateRange';
import { getParticipantScaleItem } from '../../../query/participant/getParticipantScaleItem';
import { compareTieFormats } from '../../../query/hierarchical/tieFormats/compareTieFormats';
import { isValidForQualifying } from '../../../mutate/drawDefinitions/isValidForQualifying';
import { getLinkedTournamentIds } from '../../../query/tournaments/getLinkedTournamentIds';
import { allCompetitionMatchUps } from '../../../query/matchUps/getAllCompetitionMatchUps';
import { getDrawTypeCoercion } from '../../generators/drawDefinitions/getDrawTypeCoercion';
import { getEntriesAndSeedsCount } from '../../../query/entries/getEntriesAndSeedsCount';
import { allTournamentMatchUps } from '../../../query/matchUps/getAllTournamentMatchUps';
import { getPositionAssignments } from '../../../query/structure/getPositionAssignments';
import { getPersonRequests } from '../../../query/matchUps/scheduling/getPersonRequests';
import { getMatchUpDependencies } from '../../../query/matchUps/getMatchUpDependencies';
import { getMatchUpDailyLimits } from '../../../query/extensions/getMatchUpDailyLimits';
import { getCompetitionMatchUps } from '../../../query/matchUps/getCompetitionMatchUps';
import { participantScaleItem } from '../../../query/participant/participantScaleItem';
import { checkMatchUpIsComplete } from '../../../query/matchUp/checkMatchUpIsComplete';
import { getPairedParticipant } from '../../../query/participant/getPairedParticipant';
import { getTournamentPersons } from '../../../query/tournaments/getTournamentPersons';
import { getPredictiveAccuracy } from '../../../query/matchUps/getPredictiveAccuracy';
import { getParticipantSignInStatus } from '../../../query/participant/signInStatus';
import { tournamentMatchUps } from '../../../query/matchUps/getTournamentMatchUps';
import { getCategoryAgeDetails } from '../../../query/event/getCategoryAgeDetails';
import { calculateWinCriteria } from '../../../query/matchUp/calculateWinCriteria';
import { getMatchUpContextIds } from '../../../query/matchUp/getMatchUpContextIds';
import { getMaxEntryPosition } from '../../../query/entries/getMaxEntryPosition';
import { analyzeTournament } from '../../../query/tournaments/analyzeTournament';
import { getTournamentInfo } from '../../../query/tournaments/getTournamentInfo';
import { isValidMatchUpFormat } from '../../../validators/isValidMatchUpFormat';
import { getMatchUpFormat } from '../../../query/hierarchical/getMatchUpFormat';
import { publicFindParticipant } from '../../../acquire/publicFindParticipant';
import { getTournamentIds } from '../../../query/tournaments/getTournamentIds';
import { validMatchUp, validMatchUps } from '../../../validators/validMatchUp';
import { allEventMatchUps } from '../../../query/matchUps/getAllEventMatchUps';
import { getParticipants } from '../../../query/participants/getParticipants';
import { allDrawMatchUps } from '../../../query/matchUps/getAllDrawMatchUps';
import { categoryCanContain } from '../../../query/event/categoryCanContain';
import { matchUpActions } from '../../../query/drawDefinition/matchUpActions';
import { getEventProperties } from '../../../query/event/getEventProperties';
import { getTeamLineUp } from '../../../mutate/drawDefinitions/getTeamLineUp';
import { getMatchUpsStats } from '../../../query/matchUps/getMatchUpsStats';
import { getRoundMatchUps } from '../../../query/matchUps/getRoundMatchUps';
import { getScaleValues } from '../../../query/participant/getScaleValues';
import { getSeedsCount } from '../../../query/drawDefinition/getSeedsCount';
import { getAllDrawMatchUps } from '../../../query/matchUps/drawMatchUps';
import { checkValidEntries } from '../../../validators/checkValidEntries';
import { dehydrateMatchUps } from '../../../mutate/tournaments/dehydrate';
import { getScaledEntries } from '../../../query/event/getScaledEntries';
import { eventMatchUps } from '../../../query/matchUps/getEventMatchUps';
import { structureSort } from '../../../functions/sorters/structureSort';
import { getRounds } from '../../../query/matchUps/scheduling/getRounds';
import { validateCategory } from '../../../validators/validateCategory';
import { validateLineUp } from '../../../validators/validateTeamLineUp';
import { getTieFormat } from '../../../query/hierarchical/getTieFormat';
import { getFlightProfile } from '../../../query/event/getFlightProfile';
import { getMatchUpType } from '../../../query/matchUp/getMatchUpType';
import { analyzeMatchUp } from '../../../query/matchUp/analyzeMatchUp';
import { analyzeDraws } from '../../../query/tournaments/analyzeDraws';
import { drawMatchUps } from '../../../query/matchUps/getDrawMatchUps';
import { getVenuesReport } from '../../../query/venues/venuesReport';
import { publicFindMatchUp } from '../../../acquire/findMatchUp';
import { makeDeepCopy } from '../../../utilities/makeDeepCopy';
import { isAdHoc } from '../../../query/drawDefinition/isAdHoc';
import { findExtension } from '../../../acquire/findExtension';
import { getCourts } from '../../../query/venues/getCourts';
import { getEvents } from '../../../query/events/getEvents';
import { getEvent } from '../../../query/events/getEvent';
import { findPolicy } from '../../../acquire/findPolicy';
import { credits } from '../../../fixtures/credits';
import {
  allPlayoffPositionsFilled,
  isCompletedStructure,
} from '../../../query/drawDefinition/structureActions';
import {
  getPolicyDefinitions,
  getAppliedPolicies,
} from '../../../query/extensions/getAppliedPolicies';
import {
  getCompetitionVenues,
  getVenuesAndCourts,
} from '../../../query/venues/venuesAndCourtsGetter';
import {
  getEventStructures,
  getTournamentStructures,
} from '../../../query/structure/structureGetter';
import {
  getAllowedDrawTypes,
  getAllowedMatchUpFormats,
} from '../../../query/tournaments/allowedTypes';
import {
  getTimeItem,
  getEventTimeItem,
  getTournamentTimeItem,
  getParticipantTimeItem,
  getDrawDefinitionTimeItem,
} from '../../../query/base/timeItems';

import {
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

function findDrawDefinition({ tournamentRecord, drawDefinition }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_ID };
  return { drawDefinition: makeDeepCopy(drawDefinition) };
}
const queryGovernor = {
  allCompetitionMatchUps,
  allDrawMatchUps,
  allEventMatchUps,
  allTournamentMatchUps,
  analyzeDraws,
  analyzeMatchUp,
  analyzeTournament,
  bulkUpdatePublishedEventIds,
  categoryCanContain,
  checkMatchUpIsComplete,
  checkValidEntries,
  competitionScheduleMatchUps,
  credits,
  drawMatchUps,
  eventMatchUps,
  findDrawDefinition,
  findExtension,
  findMatchUp: publicFindMatchUp,
  findParticipant: publicFindParticipant,
  findPolicy,
  getAllDrawMatchUps,
  getAllowedDrawTypes,
  getAllowedMatchUpFormats,
  getAppliedPolicies,
  getAssignedParticipantIds,
  getCompetitionDateRange,
  getCompetitionMatchUps,
  getCompetitionParticipants,
  getCompetitionPenalties, // test
  getCompetitionVenues,
  getCourts,
  getDrawDefinitionTimeItem,
  getDrawParticipantRepresentativeIds,
  getDrawTypeCoercion,
  getEligibleVoluntaryConsolationParticipants,
  getEntriesAndSeedsCount,
  getEvent,
  getEventMatchUpFormatTiming,
  getEventProperties,
  getEvents,
  getEventStructures,
  getEventTimeItem,
  getFlightProfile,
  getLinkedTournamentIds,
  getMatchUpCompetitiveProfile,
  getMatchUpDailyLimits, // document
  getMatchUpDailyLimitsUpdate, // document
  getMatchUpDependencies,
  getMatchUpFormat,
  getMatchUpFormatTiming,
  getMatchUpFormatTimingUpdate,
  getMatchUpScheduleDetails,
  getMatchUpsStats,
  getMatchUpType,
  getMaxEntryPosition,
  getModifiedMatchUpFormatTiming,
  getPairedParticipant,
  getParticipantEventDetails,
  getParticipantIdFinishingPositions,
  getParticipantMembership,
  getParticipants,
  getParticipantScaleItem,
  getParticipantSchedules,
  getParticipantSignInStatus,
  getParticipantTimeItem,
  getPersonRequests,
  getPolicyDefinitions,
  getPositionAssignments,
  getPredictiveAccuracy,
  getRoundMatchUps,
  getRounds,
  getScaledEntries,
  getScheduledRoundsDetails,
  getSchedulingProfileIssues,
  getSeedsCount,
  getStructureSeedAssignments,
  getTeamLineUp,
  getTieFormat,
  getTournamentIds,
  getTournamentInfo,
  getTournamentPenalties,
  getTournamentPersons,
  getTournamentStructures,
  getTournamentTimeItem,
  getVenuesAndCourts,
  getVenuesReport,
  isValidForQualifying,
  isValidMatchUpFormat,
  matchUpActions,
  participantScaleItem,
  participantScheduledMatchUps,
  positionActions,
  tallyParticipantResults,
  tournamentMatchUps,
  validateCollectionDefinition,
  validateLineUp,
  validMatchUp,
  validMatchUps,

  allPlayoffPositionsFilled,
  getCategoryAgeDetails,
  calculateWinCriteria,
  compareTieFormats,
  dehydrateMatchUps,
  getMatchUpContextIds,
  getScaleValues,
  getSeedingThresholds,
  getTimeItem,
  getValidGroupSizes,
  isAdHoc,
  isCompletedStructure,
  roundRobinGroups,
  structureSort,
  tieFormatGenderValidityCheck,
  validateCategory,
};

export const query = queryGovernor;
export default queryGovernor;

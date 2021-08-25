import { allCompetitionMatchUps } from '../../getters/matchUpsGetter';
import {
  INVALID_TOURNAMENT_RECORD,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecords
 * @param {object} schedulingProfile
 * @param {string[]} dates - optional - array of dates to validate
 * @returns
 */
export function validateSchedulingProfile({
  tournamentRecords,
  schedulingProfile,
  dates = [],
}) {
  if (typeof tournamentRecords !== 'object')
    return { error: INVALID_TOURNAMENT_RECORD };
  if (typeof schedulingProfile !== 'object') return { error: INVALID_VALUES };

  const { matchUps } = allCompetitionMatchUps({ tournamentRecords });

  for (const dateProfile of schedulingProfile) {
    const { date, venues = [] } = dateProfile;
    if (!dates?.length || dates.includes(date)) {
      for (const venue of venues || []) {
        const drawAggregator = {};
        for (const round of venue?.rounds || []) {
          const { tournamentId, drawId, structureId } = round;
          const drawHash = tournamentId + '|' + drawId;
          const roundMatchUp = matchUps.find(
            (matchUp) => matchUp.structureId === structureId
          );
          const roundInfo = Object.assign({}, round, { roundMatchUp });
          drawAggregator[drawHash] = (drawAggregator[drawHash] || []).concat(
            roundInfo
          );
        }
        console.log(Object.values(drawAggregator)[0]);
      }
    }
  }

  // for each date check the rounds for each venue
  // group the rounds into draws while preserving the prescribed order
  // for each round of every draw get a matchUp that is representative of the round
  // determine how to use stageSequence && finishingPositionRange to ensure that rounds within each groupoing are in sensible order
}

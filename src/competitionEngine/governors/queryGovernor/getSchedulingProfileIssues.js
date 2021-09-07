import { allDrawMatchUps } from '../../../tournamentEngine/getters/matchUpsGetter';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';

import { stageOrder as orderedStages } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_TOURNAMENT_RECORD,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecords
 * @param {object} schedulingProfile
 * @param {string[]} dates - optional - array of dates to validate
 */
// NOTE: this can be removed once `getMatchUpDependencies` can be utilized
export function getSchedulingProfileIssues({
  tournamentRecords,
  schedulingProfile,
  dates = [],
}) {
  if (typeof tournamentRecords !== 'object')
    return { error: INVALID_TOURNAMENT_RECORD };
  if (typeof schedulingProfile !== 'object') return { error: INVALID_VALUES };

  const issues = [];

  // for each date check the rounds for each venue
  for (const dateProfile of schedulingProfile) {
    const { date, venues = [] } = dateProfile;

    // skip dates that are not specified; process all if none specified
    if (!dates?.length || dates.includes(date)) {
      for (const venue of venues || []) {
        const venueDateIssues = [];
        const drawAggregator = {};
        const { venueId } = venue;

        // group the rounds into draws while preserving the prescribed order
        for (const round of venue?.rounds || []) {
          const { tournamentId, drawId } = round;
          const drawHash = tournamentId + '|' + drawId;

          drawAggregator[drawHash] = (drawAggregator[drawHash] || []).concat(
            round
          );
        }

        // now process ordered rounds of each draw
        let lastStageOrder = 0; // report when stageOrder is not sequential
        let lastSequenceNumber = 0; // report when stageSequences out of order
        const structureRoundNumber = {}; // keep track of roundNumber progression within each draw structure
        for (const drawHash of Object.keys(drawAggregator)) {
          const [tournamentId, drawId] = drawHash.split('|');
          const { drawDefinition, event, error } = findEvent({
            tournamentRecord: tournamentRecords[tournamentId],
            drawId,
          });
          if (error) return { error };

          const result = allDrawMatchUps({
            drawDefinition,
            event,
            inContext: true,
          });
          if (result.error) return result;
          const { matchUps } = result;

          const drawRounds = drawAggregator[drawHash];
          for (const round of drawRounds) {
            const { structureId, roundNumber } = round;

            // find a matchUp representative of the round
            const roundMatchUp = matchUps?.find(
              (matchUp) => matchUp.structureId === structureId
            );
            // extract attributes to be used when checking order
            const { /*exitProfile,*/ stage, stageSequence } =
              roundMatchUp || {};
            const stageOrder = orderedStages[stage];

            if (stageOrder < lastStageOrder)
              venueDateIssues.push({
                date,
                venueId,
                round,
                issue: 'stageOrder',
              });
            if (stageOrder > lastStageOrder) {
              lastStageOrder = stageOrder;
              lastSequenceNumber = 0; // each time stage increments reset sequence to 0
            }

            if (!structureRoundNumber[structureId]) {
              structureRoundNumber[structureId] = roundNumber;
            } else {
              if (roundNumber < structureRoundNumber[structureId]) {
                venueDateIssues.push({
                  date,
                  venueId,
                  round,
                  issue: 'roundOrder',
                });
              }
            }
            structureRoundNumber[structureId] = roundNumber;

            if (stageSequence < lastSequenceNumber)
              venueDateIssues.push({
                date,
                venueId,
                round,
                issue: 'stageSence',
              });
            lastSequenceNumber = stageSequence;
          }
        }

        if (venueDateIssues.length) issues.push(...venueDateIssues);
      }
    }
  }

  return { issues, ...SUCCESS };
}

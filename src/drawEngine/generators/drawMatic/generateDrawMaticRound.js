import { getPositionAssignments } from '../../getters/positionsGetter';
import { generateAdHocMatchUps } from '../generateAdHocMatchUps';

import { DOUBLES } from '../../../constants/eventConstants';
import { TEAM } from '../../../constants/participantTypes';

const ENCOUNTER_VALUE = 50;
const SAME_TEAM_VALUE = 60;

// valueObjects provide "weighting" to each possible pairing of participants
// deltaObjects contain the difference in ratings between two participants

export function generateDrawMaticRound({
  tournamentParticipants,
  drawDefinition,
  participantIds,
  structureId,
  matchUpIds,
  eventType,
  structure,
}) {
  const { positionAssignments } = getPositionAssignments({ structure });

  // create valueObject for each previous encounter within the structure
  const { encounters } = getEncounters({
    matchUps: structure.matchUps,
    positionAssignments,
  });
  // valueObjects provide "weighting" to each possible pairing of participants
  const valueObjects = {};
  for (const pairing of encounters) {
    if (!valueObjects[pairing]) valueObjects[pairing] = 0;
    valueObjects[pairing] += ENCOUNTER_VALUE;
  }

  const teamParticipants = tournamentParticipants?.filter(
    ({ participantType }) => participantType === TEAM
  );
  if (teamParticipants) {
    // add SAME_TEAM_VALUE for participants who appear on the same team
    for (const teamParticipant of teamParticipants) {
      const participantIds = teamParticipant.individualParticipantIds;
      const { uniquePairings } = getUniquePairings({ participantIds });
      for (const pairing of uniquePairings) {
        if (!valueObjects[pairing]) valueObjects[pairing] = 0;
        valueObjects[pairing] += SAME_TEAM_VALUE;
      }
    }
  }

  const { uniquePairings, deltaObjects } = getUniquePairings({
    participantIds,
  });

  const matchUpsCount = Math.floor(participantIds.lenght / 2);

  const { matchUps: roundMatchUps } = generateAdHocMatchUps({
    newRound: true,
    drawDefinition,
    matchUpsCount,
    structureId,
    matchUpIds,
  });

  const params = {
    drawDefinition,
    participantIds,
    uniquePairings,
    roundMatchUps,
    deltaObjects,
    structure,
  };

  eventType === DOUBLES
    ? generateDoublesRound(params)
    : generateSinglesRound(params);

  return { matchUps: [] };
}

function generateSinglesRound() {}
function generateDoublesRound() {}

function getUniquePairings({ participantIds }) {
  const possiblePairings = {};
  const uniquePairings = [];

  participantIds.forEach((participantId) => {
    possiblePairings[participantId] = participantIds.filter(
      (id) => id !== participantId
    );
    possiblePairings[participantId].forEach((id) => {
      const pairing = matchupHash(id, participantId);
      if (!uniquePairings.includes(pairing)) uniquePairings.push(pairing);
    });
  });

  const deltaObjects = Object.assign(
    {},
    ...uniquePairings.map((pairing) => ({ [pairing]: 0 }))
  );
  return { uniquePairings, possiblePairings, deltaObjects };
}

function getEncounters({ matchUps, positionAssignments }) {
  let encounters = [];

  for (const matchUp of matchUps) {
    const participantIds = positionAssignments
      .filter(({ drawPosition }) =>
        matchUp.drawPositions.includes(drawPosition)
      )
      .map(({ participantId }) => participantId)
      .filter(Boolean);
    if (participantIds.length === 2) {
      const pairing = matchupHash(...participantIds);
      if (!encounters.includes(pairing)) encounters.push(pairing);
    }
  }

  return { encounters };
}

function matchupHash(id1, id2) {
  return [id1, id2].sort().join('|');
}

/*
  function singlesRound() {
    // increment matchup values based on ratings differentials
    Object.keys(value_objects).forEach((matchup) => {
      let ratings = matchup
        .split('|')
        .map((pid) => evt.adhoc_ratings[pid] || fx.DEFAULT_RATING);
      let differential = Math.abs(ratings[0] - ratings[1]) + 1;
      delta_objects[matchup] = Math.abs(ratings[0] - ratings[1]);
      value_objects[matchup] += Math.pow(differential, 2);
    });

    let ranked_matchups = Object.keys(value_objects)
      .map((matchup) => ({ matchup, value: value_objects[matchup] }))
      .sort(valueSort);
    let player_matchup_values = matchupValues({
      matchups: player_matchups,
      value_objects,
    });

    evt.rounds += 1;
    let candidate = generateCandidate({
      ranked_matchups,
      matchup_values: player_matchup_values,
      delta_objects,
      env,
    });
    let singles_matches = candidate.matchups.map((matchup) =>
      teamMatch({
        tournament,
        evt,
        opponents: matchup.opponents,
        round: evt.rounds,
      })
    );

    return singles_matches;
  }
*/

/*
  function doublesRound() {
    let team_ids = evt.approved.map((team) => team.sort().join('~'));
    let { team_matchups, team_value_objects } = uniqueDoublesMatchups({
      team_ids,
    });

    // increment matchup values based on ratings differentials
    Object.keys(team_value_objects).forEach((matchup) => {
      let matchup_hashes = [];
      let sides = matchup.split('|');
      let ratings = sides.map((side) =>
        side
          .split('~')
          .map(playerRating)
          .reduce((a, b) => a + b)
      );

      let differential = Math.abs(ratings[0] - ratings[1]) + 1;
      delta_objects[matchup] = Math.abs(ratings[0] - ratings[1]);
      team_value_objects[matchup] += Math.pow(differential, 2);

      // for each matchup between players on both sides, increment the
      // team_value_object by the individual value_objects
      sides.forEach((side, i) => {
        let player_ids = side.split('~');
        player_ids.forEach((player_id) => {
          let opponent_ids = sides[1 - i].split('~');
          opponent_ids.forEach((opponent_id) => {
            let matchup_hash = matchupHash(player_id, opponent_id);
            if (matchup_hashes.indexOf(matchup_hash) < 0)
              matchup_hashes.push(matchup_hash);
          });
        });
      });

      matchup_hashes.forEach((matchup_hash) => {
        team_value_objects[matchup] += value_objects[matchup_hash] || 0;
      });
    });

    let ranked_matchups = Object.keys(team_value_objects)
      .map((matchup) => ({ matchup, value: team_value_objects[matchup] }))
      .sort(valueSort);
    let team_matchup_values = matchupValues({
      matchups: team_matchups,
      value_objects: team_value_objects,
    });

    evt.rounds += 1;
    let candidate = generateCandidate({
      ranked_matchups,
      matchup_values: team_matchup_values,
      delta_objects,
      env,
    });
    let doubles_matches = candidate.matchups.map((matchup) =>
      teamMatch({
        tournament,
        evt,
        opponents: matchup.opponents,
        round: evt.rounds,
      })
    );

    return doubles_matches;

    function playerRating(pid) {
      return evt.adhoc_ratings[pid]
        ? parseFloat(evt.adhoc_ratings[pid])
        : fx.DEFAULT_RATING;
    }
  }
  */

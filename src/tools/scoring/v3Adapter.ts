/**
 * v3→v4 Adapter
 *
 * Wraps v4.0 functional API to match v3.x object-oriented API
 * Allows existing v3.x tests to run against v4.0 implementation
 */

import type { AddPointOptions } from '@Types/scoring/types';
import { createMatchUp } from '@Mutate/scoring/createMatchUp';
import { addPoint } from '@Mutate/scoring/addPoint';
import { getScore } from '@Query/scoring/getScore';
import { getScoreboard } from '@Query/scoring/getScoreboard';
import { getWinner } from '@Query/scoring/getWinner';
import { isComplete } from '@Query/scoring/isComplete';
import { PointWithMetadata } from '@Query/scoring/statistics/types';
import { enrichPoint } from '@Query/scoring/statistics/pointParser';
import { buildCounters } from '@Query/scoring/statistics/counters';
import { calculateStats } from '@Query/scoring/statistics/calculator';
import { parseFormat } from './formatConverter';

/**
 * Parse point code (S, R, A, D) to determine winner
 */
function parsePointCode(code: string, server: number): AddPointOptions {
  const upper = code.toUpperCase();
  let winner: number;

  // S = Server wins, A = Ace (server wins)
  if (upper === 'S' || upper === 'A') {
    winner = server;
  }
  // R = Receiver wins, D = Double fault (receiver wins)
  else if (upper === 'R' || upper === 'D') {
    winner = 1 - server;
  }
  // P/Q = Penalty (assign to non-penalized player - assume receiver)
  else if (upper === 'P' || upper === 'Q') {
    winner = 1 - server;
  } else {
    throw new Error(`Unknown point code: ${code}`);
  }

  return { winner: winner as 0 | 1, server: server as 0 | 1 };
}

/**
 * Adapter that creates a v3-compatible API around v4 matchUp
 */
export function createV3Adapter() {
  // Log version on first load to confirm which code is running
  console.log('[UMO-V4] Adapter loaded - BUILD:', new Date().toISOString());

  const adapter = {
    /**
     * Match factory - wraps v4.createMatchUp and provides v3 API
     */
    Match: (options: any = {}) => {
      // Create initial matchUp
      let matchUp = createMatchUp({
        matchUpId: options.matchUpId,
        matchUpFormat: options.matchUpFormat,
        participants: options.participants,
        isDoubles: options.isDoubles,
      });

      console.log('[UMO-V4] matchUp created with format:', matchUp.matchUpFormat);

      // Track first service and current server
      let firstService = 0;
      let currentServer = 0;

      // Track point history for statistics
      const pointHistory: PointWithMetadata[] = [];
      let pointIndex = 0;

      /**
       * Calculate "needed" metadata for current game state
       * Based on V3's pointsNeeded() logic
       */
      function calculateNeeded(matchUp: any, score: any): any {
        const currentSet = score.sets?.[score.sets.length - 1];
        if (!currentSet) {
          return {
            points_to_game: undefined,
            points_to_set: undefined,
            games_to_set: undefined,
            is_breakpoint: false,
          };
        }

        const side1Games = currentSet.side1Score || 0;
        const side2Games = currentSet.side2Score || 0;

        // Get current point score from score.points (not gameScore)
        const side1Points = score.points?.[0] || 0;
        const side2Points = score.points?.[1] || 0;

        // Get format parameters (default to standard tennis)
        const formatStructure = matchUp.matchUpFormat ? parseFormat(matchUp.matchUpFormat).format : null;
        const setTo = formatStructure?.setFormat?.setTo || 6;
        const winBy = formatStructure?.setFormat?.winBy || 2;
        const tiebreakAt = formatStructure?.setFormat?.tiebreakAt || setTo;
        const hasGoldenPoint = formatStructure?.setFormat?.hasGoldenPoint || false;

        // Calculate games_to_set (how many games each player needs to win the set)
        const threshold = setTo;
        const min_diff = winBy;

        const games_to_set = [side1Games, side2Games].map((player_score, idx) => {
          const opponent_score = idx === 0 ? side2Games : side1Games;

          // If at tiebreak threshold (e.g., 6-6), need 1 game (the tiebreak)
          if (player_score === tiebreakAt && opponent_score === tiebreakAt) {
            return 1;
          }

          // If in golden point situation or close to threshold
          if (hasGoldenPoint && player_score === threshold && opponent_score === threshold) {
            return 1;
          }

          // Normal case: need to reach threshold with required margin
          if (opponent_score >= threshold - 1) {
            // Close to threshold, need margin
            return threshold + min_diff - player_score;
          } else {
            // Just need to reach threshold
            return threshold - player_score;
          }
        });

        // Calculate points to game for current game
        const points_to_game = [0, 1].map((player) => {
          const playerPoints = player === 0 ? side1Points : side2Points;
          const opponentPoints = player === 0 ? side2Points : side1Points;

          // Standard game scoring (not tiebreak)
          if (side1Games !== tiebreakAt || side2Games !== tiebreakAt) {
            // Need 4 points to win, but must win by 2 in deuce
            if (playerPoints >= 3 && opponentPoints >= 3) {
              // Deuce or advantage
              return 2; // Need 2 points to win from deuce
            } else if (playerPoints >= 3) {
              // At 40-x where x < 30
              return 1;
            } else {
              // Still building to 40
              return 4 - playerPoints;
            }
          } else {
            // Tiebreak game
            const tiebreakTo = 7;
            if (playerPoints >= tiebreakTo - 1 && opponentPoints >= tiebreakTo - 1) {
              return 2; // Need 2-point margin
            } else if (playerPoints >= tiebreakTo - 1) {
              return 1;
            } else {
              return tiebreakTo - playerPoints;
            }
          }
        });

        // Calculate total points to set
        const points_to_set = [0, 1].map((player) => {
          let points_needed = 0;
          let player_games_to_set = games_to_set[player];

          // Add points needed for current game (if not complete)
          points_needed += points_to_game[player];
          player_games_to_set -= 1;

          // Add points for remaining games (assume 4 points per game)
          const pointsPerGame = 4; // Simplified: assume winning games 4-0
          for (let i = player_games_to_set; i > 0; i--) {
            points_needed += pointsPerGame;
          }

          return points_needed;
        });

        // Breakpoint detection (receiver is one point from winning game)
        const receiverIndex = 1 - currentServer;
        const is_breakpoint = points_to_game[receiverIndex] === 1;

        return {
          points_to_game,
          points_to_set,
          games_to_set,
          is_breakpoint,
        };
      }

      /**
       * Update service tracking based on game/set completion
       */
      function updateServiceTracking() {
        const score = getScore(matchUp);
        // In tiebreak, alternate every 2 points
        const currentSet = matchUp.score.sets.at(-1);
        if (currentSet) {
          const s1 = currentSet.side1Score || 0;
          const s2 = currentSet.side2Score || 0;

          // Check if in tiebreak (6-6)
          if (s1 === 6 && s2 === 6) {
            const tiebreakPoints =
              (currentSet.side1GameScores?.slice(-1)[0] || 0) + (currentSet.side2GameScores?.slice(-1)[0] || 0);
            // Alternate every 2 points in tiebreak, starting with player who didn't serve last
            currentServer = Math.floor(tiebreakPoints / 2) % 2;
            return;
          }
        }

        // Regular games: alternate server each game
        const gamesCompleted = score.sets
          .flatMap((set) => [set.side1Score || 0, set.side2Score || 0])
          .reduce((a, b) => a + b, 0);

        currentServer = (firstService + gamesCompleted) % 2;
      }

      // Build v3-compatible match object
      const matchObj: any = {
        // State mutation methods (update internal matchUp)
        addPoint: (winner: any, metadata?: any) => {
          let pointOptions: AddPointOptions;

          if (typeof winner === 'number') {
            // Numeric input: 0 or 1
            pointOptions = { winner, ...metadata };
          } else if (typeof winner === 'string') {
            // Code-based input: 'S', 'R', 'A', 'D', etc.
            pointOptions = parsePointCode(winner, firstService);
          } else if (typeof winner === 'object') {
            // Object input: { winner: 0, code: 'S' }
            pointOptions = winner;
          } else {
            throw new TypeError(`Invalid point input: ${winner}`);
          }

          // Calculate metadata BEFORE adding the point
          const scoreBefore = getScore(matchUp);
          const currentSet = scoreBefore.sets?.length ? scoreBefore.sets.length - 1 : 0;
          const currentGame =
            (scoreBefore.sets?.[currentSet]?.side1Score ?? 0) + (scoreBefore.sets?.[currentSet]?.side2Score ?? 0);

          // Calculate "needed" metadata (points to game, points to set, etc.)
          const needed = calculateNeeded(matchUp, scoreBefore);

          matchUp = addPoint(matchUp, pointOptions);

          // Store point with metadata for statistics
          const enrichedPoint = enrichPoint(
            { ...pointOptions, ...metadata },
            {
              server: currentServer as 0 | 1,
              index: pointIndex++,
              set: currentSet,
              game: currentGame,
            },
          );
          // Add v3-specific metadata (not part of TODS Point type)
          (enrichedPoint as any).needed = needed;
          (enrichedPoint as any).breakpoint = needed.is_breakpoint || false;
          pointHistory.push(enrichedPoint);

          // CRITICAL: Also add needed to the actual point in matchUp.history for set history API
          const lastPointInMatchUp = matchUp.history?.points[matchUp.history.points.length - 1];
          if (lastPointInMatchUp) {
            // Recalculate needed AFTER point is added for more accurate values
            const scoreAfter = getScore(matchUp);
            const neededAfter = calculateNeeded(matchUp, scoreAfter);
            (lastPointInMatchUp as any).needed = neededAfter;
            (lastPointInMatchUp as any).breakpoint = neededAfter.is_breakpoint || false;
          }

          // Update service tracking after point
          updateServiceTracking();

          // Trigger event callback if registered
          if (matchObj._pointCallback) {
            try {
              matchObj._pointCallback(matchObj);
            } catch (error) {
              console.error('Error in point callback:', error);
            }
          }

          // V3 addPoint returns { point, result, match } object
          // Hive-eye checks what.point.result to show stroke slider
          // But also need to support chaining for tests
          const lastPoint = matchUp.history?.points[matchUp.history.points.length - 1];
          const returnValue: any = {
            point: lastPoint || enrichedPoint,
            result: (matchUp as any).matchUpStatus === 'COMPLETE' ? 'complete' : undefined,
            match: matchObj,
            // Support chaining by adding addPoint method
            addPoint: (w: any, m?: any) => matchObj.addPoint(w, m),
          };
          return returnValue;
        },

        addPoints: (points: any[]) => {
          points.forEach((point) => {
            // Use addPoint to ensure pointHistory is updated
            matchObj.addPoint(point);
          });
          return matchObj;
        },

        // Events API for v3 compatibility
        events: {
          addPoint: (callback: (...args: any[]) => void) => {
            // Store callback for point events
            // Note: In v3, this was used to register event listeners
            // For now, we'll store it but v4 doesn't have event system yet
            matchObj._pointCallback = callback;
          },
          undo: (callback: (...args: any[]) => void) => {
            matchObj._undoCallback = callback;
          },
          reset: (callback: (...args: any[]) => void) => {
            matchObj._resetCallback = callback;
          },
          clearEvents: () => {
            delete matchObj._pointCallback;
            delete matchObj._undoCallback;
            delete matchObj._resetCallback;
          },
        },

        // Query methods (read from matchUp)
        score: () => {
          const score = getScore(matchUp);

          // Count completed sets (sets with a winner)
          const completedSets = matchUp.score.sets.filter((s) => s.winningSide !== undefined);
          const sets1 = completedSets.filter((s) => s.winningSide === 1).length;
          const sets2 = completedSets.filter((s) => s.winningSide === 2).length;

          // V3 score() returns object WITHOUT scoreString property
          return {
            counters: {
              points: score.points,
              games: score.games,
              sets: [sets1, sets2],
              local: score.games,
            },
            points: `${score.points?.[0]}-${score.points?.[1]}`,
            games: `${score.games?.[0]}-${score.games?.[1]}`,
            sets:
              matchUp.score.sets.length > 0
                ? `${matchUp.score.sets.filter((s) => s.winningSide === 1).length}-${matchUp.score.sets.filter((s) => s.winningSide === 2).length}`
                : '0-0',
            components: {
              sets: matchUp.score.sets.map((set) => ({
                games: [set.side1Score || 0, set.side2Score || 0],
                tiebreak:
                  set.side1TiebreakScore === undefined ? undefined : [set.side1TiebreakScore, set.side2TiebreakScore],
              })),
            },
            display: {},
          };
        },

        scoreboard: (perspective?: number) => {
          const board = getScoreboard(matchUp, { perspective });
          console.log('[UMO-V4] scoreboard() called, returning:', board);
          console.log('[UMO-V4]   matchUp.score.sets:', matchUp.score.sets);
          return board;
        },

        winner: () => {
          const winningSide = getWinner(matchUp);
          // Convert from 1-indexed to 0-indexed
          return winningSide !== undefined ? winningSide - 1 : undefined;
        },

        complete: () => {
          return isComplete(matchUp);
        },

        // Format access
        format: {
          code: matchUp.matchUpFormat,
          get structure() {
            // Return format structure (Factory-style)
            return (
              (matchUp as any).formatStructure || {
                bestOf: 3,
                setFormat: {
                  setTo: 6,
                  tiebreakAt: 6,
                  tiebreakFormat: { tiebreakTo: 7 },
                  NoAD: false,
                },
              }
            );
          },
          get setsToWin() {
            // Derive from matchUpFormat or default to 2 (best of 3)
            const structure = matchObj.format.structure;
            const bestOf = structure?.bestOf || 3;
            return Math.ceil(bestOf / 2);
          },
          settings: (formatConfig?: any) => {
            if (formatConfig) {
              // Update format
              if (formatConfig.code) {
                matchUp.matchUpFormat = formatConfig.code;
              }
              if (formatConfig.structure) {
                (matchUp as any).formatStructure = formatConfig.structure;
              }
            }
            return matchObj.format;
          },
          changeFormat: (newFormat: string) => {
            matchUp.matchUpFormat = newFormat;
            return matchObj;
          },
          pointsTo: 4, // Default for regular game
          winBy: 2,
          hasGoldenPoint: false,
          isTiebreak: false,
        },

        // Metadata access
        metadata: {
          match: { id: matchUp.matchUpId },
          get tournament() {
            // Tournament property access
            return (matchUp as any).tournamentName || '';
          },
          players: () => matchUp.sides.map((side) => side.participant).filter(Boolean),
          definePlayer: (player: any) => {
            // Update matchUp sides with player info
            const sideIndex = player.index ?? matchUp.sides.length;
            if (sideIndex < matchUp.sides.length) {
              matchUp.sides[sideIndex].participant = {
                participantId: player.puid || player.id || `player-${sideIndex}`,
                participantName:
                  player.firstName && player.lastName
                    ? `${player.firstName} ${player.lastName}`
                    : player.name || `Player ${sideIndex + 1}`,
                participantType: 'INDIVIDUAL',
                participantRole: 'COMPETITOR',
                participantStatus: 'ACTIVE',
                person: {
                  standardGivenName: player.firstName || player.name || '',
                  standardFamilyName: player.lastName || '',
                  nationalityCode: player.ioc || player.nationality,
                  sex: player.sex,
                },
              };
            }
            return matchObj;
          },
          updateParticipant: (update: any) => {
            // Modern TODS-style update using sideNumber
            const { sideNumber, person, participantName, participantId } = update;
            const index = sideNumber - 1; // Convert to 0-based index

            // Ensure side exists
            if (!matchUp.sides[index]) {
              matchUp.sides[index] = {
                sideNumber,
              };
            }

            // Create or update participant
            if (matchUp.sides[index].participant) {
              // Update existing participant
              if (participantName) {
                matchUp.sides[index].participant.participantName = participantName;
              }
              if (participantId) {
                matchUp.sides[index].participant.participantId = participantId;
              }
              if (person) {
                matchUp.sides[index].participant.person = {
                  ...matchUp.sides[index].participant.person,
                  ...person,
                };
                // Update participantName from person if not explicitly provided
                if (!participantName && person.standardGivenName && person.standardFamilyName) {
                  matchUp.sides[index].participant.participantName =
                    `${person.standardGivenName} ${person.standardFamilyName}`.trim();
                }
              }
            } else {
              matchUp.sides[index].participant = {
                participantId: participantId || `player-${index}`,
                participantName:
                  participantName || `${person?.standardGivenName || ''} ${person?.standardFamilyName || ''}`.trim(),
                participantType: 'INDIVIDUAL',
                participantRole: 'COMPETITOR',
                person: person || {},
              };
            }

            return matchObj;
          },
          defineMatch: (match?: any) => {
            // When called without arguments, return current match metadata
            if (match === undefined) {
              return {
                id: matchUp.matchUpId,
                matchUpId: matchUp.matchUpId,
                date: (matchUp as any).scheduledDate,
                status: matchUp.matchUpStatus,
                court: (matchUp as any).court,
                umpire: (matchUp as any).umpire,
              };
            }

            // When called with arguments, set match metadata
            if (!match) return matchObj;
            if (match.id) {
              matchUp.matchUpId = match.id;
            }
            if (match.matchUpId) {
              matchUp.matchUpId = match.matchUpId;
            }
            if (match.date !== undefined) {
              // Store date in matchUp (TODS uses scheduledDate)
              (matchUp as any).scheduledDate = match.date;
            }
            if (match.status) {
              matchUp.matchUpStatus = match.status;
            }
            if (match.court) {
              (matchUp as any).court = match.court;
            }
            if (match.umpire) {
              (matchUp as any).umpire = match.umpire;
            }
            return matchObj;
          },
          defineTournament: (tournament?: any) => {
            // When called without arguments, return current tournament metadata
            if (tournament === undefined) {
              return {
                name: (matchUp as any).tournamentName,
                tournamentName: (matchUp as any).tournamentName,
                category: (matchUp as any).category,
                level: (matchUp as any).level,
              };
            }

            // When called with arguments, set tournament metadata
            if (!tournament) return matchObj;
            if (tournament.name) {
              (matchUp as any).tournamentName = tournament.name;
            }
            if (tournament.tournamentName) {
              (matchUp as any).tournamentName = tournament.tournamentName;
            }
            if (tournament.category) {
              (matchUp as any).category = tournament.category;
            }
            if (tournament.level) {
              (matchUp as any).level = tournament.level;
            }
            return matchObj;
          },
          serviceOrder: () => {
            // Return array of player indices in service order
            return [0, 1];
          },
          playerTeam: (player: number) => {
            // For singles, player is their own team
            return player;
          },
          teams: () => {
            // For singles, each player is a team
            return [[0], [1]];
          },
          timestamps: (value?: boolean) => {
            // Get/set timestamps flag
            if (value !== undefined) {
              (matchUp as any).useTimestamps = value;
              return matchObj;
            }
            return (matchUp as any).useTimestamps || false;
          },
          liveStats: (value?: boolean) => {
            // Get/set live stats flag (in metadata for consistency)
            if (value !== undefined) {
              (matchUp as any).liveStats = value;
              return matchObj.set;
            }
            return (matchUp as any).liveStats || false;
          },
          resetStats: () => {
            // Reset statistics
            (matchUp as any).stats = {};
            return matchObj;
          },
          reset: () => {
            // Reset metadata to defaults
            return matchObj;
          },
        },

        // History access
        history: {
          // Return the SAME array reference so decoratePoint mutations persist
          points: () => matchUp.history?.points || [],
          lastPoint: () => {
            const points = matchUp.history?.points || [];
            return points.at(-1);
          },
          common: () => {
            // Return common history (addPoint episodes)
            return (matchUp.history?.points || []).map((point: any, index) => ({
              action: 'addPoint',
              point: {
                ...point,
                index,
              },
              needed: point.needed || {},
            }));
          },
          action: (actionName: string) => {
            if (actionName === 'addPoint') {
              // Return addPoint episodes with point data and metadata
              // Must include game, set, result, complete, next_service for visualization compatibility
              return (matchUp.history?.points || []).map((point: any, index) => {
                // Determine current game and set state at this point in history
                // Use extended point data (game, set) added by enrichPoint
                const pointSetIndex = point.set || 0;
                const pointGameIndex = point.game || 0;
                const currentSet = matchUp.score.sets[pointSetIndex];
                const side1Games = currentSet?.side1Score || 0;
                const side2Games = currentSet?.side2Score || 0;
                const setComplete = currentSet?.winningSide !== undefined;
                let setWinner: number | undefined;
                if (setComplete) {
                  setWinner = currentSet.winningSide === 1 ? 0 : 1;
                } else {
                  setWinner = undefined;
                }

                // Determine game state
                const gameScores = currentSet?.side1GameScores || [];
                const side1Points = gameScores[pointGameIndex] || 0;
                const side2Points = (currentSet?.side2GameScores || [])[pointGameIndex] || 0;

                // Game is complete if we moved to next game or set
                const nextPoint = matchUp.history?.points[index + 1] as any;
                const gameComplete = nextPoint
                  ? nextPoint.game !== pointGameIndex || nextPoint.set !== pointSetIndex
                  : false;
                let gameWinner: number | undefined;
                if (gameComplete) {
                  gameWinner = side1Points > side2Points ? 0 : 1;
                }

                // Match complete
                const matchComplete = matchUp.matchUpStatus === 'COMPLETED';

                // Next service (alternates or changes on game completion)
                const next_service = gameComplete ? 1 - (point.server || 0) : point.server || 0;

                return {
                  action: 'addPoint',
                  result: true,
                  complete: matchComplete,
                  point: {
                    ...point,
                    index,
                    breakpoint: point.breakpoint || false,
                    server: point.server !== undefined ? point.server : index % 2,
                  },
                  game: {
                    complete: gameComplete,
                    winner: gameWinner,
                    games: [side1Games, side2Games],
                    index: pointGameIndex,
                  },
                  set: {
                    complete: setComplete,
                    winner: setWinner,
                    sets: matchUp.score.sets
                      .map((s) => s.side1Score || 0)
                      .concat(matchUp.score.sets.map((s) => s.side2Score || 0)),
                    index: pointSetIndex,
                  },
                  needed: point.needed || {
                    points_to_game: [4 - side1Points, 4 - side2Points],
                    points_to_set: [],
                    games_to_set: [],
                  },
                  next_service,
                };
              });
            }
            return [];
          },
        },

        // State setters
        set: {
          firstService: (value?: number) => {
            if (value !== undefined) {
              firstService = value;
              return matchObj.set;
            }
            return firstService;
          },
          liveStats: (value?: boolean) => {
            // Get/set live stats flag
            if (value !== undefined) {
              (matchUp as any).liveStats = value;
              return matchObj.set;
            }
            return (matchUp as any).liveStats || false;
          },
          perspectiveScore: (value?: boolean) => {
            // v4 doesn't have global perspective, handled per-query
            return value !== undefined ? matchObj.set : false;
          },
        },

        // Set/Game access
        sets: () => {
          // Return array of set objects with v3 API
          return matchUp.score.sets.map((set, setIndex) => ({
            score: () => ({
              counters: {
                local: [set.side1Score || 0, set.side2Score || 0],
              },
            }),
            scoreboard: () => {
              const s1 = set.side1Score || 0;
              const s2 = set.side2Score || 0;
              if (set.side1TiebreakScore !== undefined) {
                return s1 > s2 ? `${s1}-${s2}(${set.side2TiebreakScore})` : `${s1}(${set.side1TiebreakScore})-${s2}`;
              }
              return `${s1}-${s2}`;
            },
            games: () => {
              // Return game objects (simplified for now)
              const gameCount = Math.max(set.side1Score || 0, set.side2Score || 0);
              return Array.from({ length: gameCount }, (_, i) => ({
                index: i,
                score: () => ({ counters: { local: [0, 0] } }),
              }));
            },
            complete: () => set.winningSide !== undefined,
            winner: () => (set.winningSide !== undefined ? set.winningSide - 1 : undefined),

            // Add history property to match V3 API
            history: {
              points: () => {
                // Return points filtered by this set index
                const allPoints = matchUp.history?.points || [];
                return allPoints.filter((point: any) => point.set === setIndex);
              },
              action: (actionType: string) => {
                // Return transformed points as action episodes for this set
                const allPoints = matchUp.history?.points || [];
                const setPoints = allPoints.filter((point: any) => point.set === setIndex);

                if (actionType === 'addPoint') {
                  return setPoints.map((point: any) => ({
                    action: 'addPoint',
                    point: point,
                    result: true,
                    complete: point.matchComplete || false,
                    set: point.set,
                    game: point.game,
                    needed: point.needed, // Include needed metadata for ptsChart
                  }));
                }
                return [];
              },
              local: () => {
                // Return local history for this set (games won)
                const allPoints = matchUp.history?.points || [];
                const setPoints = allPoints.filter((point: any) => point.set === setIndex);
                return setPoints;
              },
              score: () => {
                // Return score history for all games in this set
                const allPoints = matchUp.history?.points || [];
                const setPoints = allPoints.filter((point: any) => point.set === setIndex);
                return setPoints.map((point: any) => point.score || '0-0');
              },
              games: () => {
                // Return games history for this set
                const allPoints = matchUp.history?.points || [];
                const setPoints = allPoints.filter((point: any) => point.set === setIndex);
                return setPoints;
              },
              lastPoint: () => {
                // Return the last point of this set
                const allPoints = matchUp.history?.points || [];
                const setPoints = allPoints.filter((point: any) => point.set === setIndex);
                return setPoints.length > 0 ? setPoints[setPoints.length - 1] : { score: '0-0' };
              },
              common: () => {
                // Return all history (not just this set)
                return matchUp.history?.points || [];
              },
            },
          }));
        },

        games: () => {
          // Current set's games
          const currentSet = matchUp.score.sets[matchUp.score.sets.length - 1];
          if (!currentSet) return [];
          return matchObj.sets()[matchUp.score.sets.length - 1].games();
        },

        // Undo functionality
        undo: () => {
          console.log('[UMO-V4] undo() called');

          if (!matchUp.history || matchUp.history.points.length === 0) {
            console.log('[UMO-V4] undo() returning: matchObj (no points to undo)');
            return matchObj;
          }

          // Get the point being undone for logging
          const undonePoint = matchUp.history.points[matchUp.history.points.length - 1];

          // Recreate matchUp without last point
          const points = matchUp.history.points.slice(0, -1);
          matchUp = createMatchUp({
            matchUpFormat: matchUp.matchUpFormat,
            matchUpId: matchUp.matchUpId,
            participants: matchUp.sides.map((s) => s.participant).filter((p): p is NonNullable<typeof p> => !!p),
          });

          // Suppress point callbacks during replay
          const savedPointCallback = (matchObj as any)._pointCallback;
          (matchObj as any)._pointCallback = null;

          // Replay points
          points.forEach((point) => {
            matchUp = addPoint(matchUp, point);
          });

          // Restore point callback
          (matchObj as any)._pointCallback = savedPointCallback;

          // Trigger undo callback if registered
          if ((matchObj as any)._undoCallback) {
            try {
              (matchObj as any)._undoCallback(matchObj);
            } catch (error) {
              console.error('Error in undo callback:', error);
            }
          }

          console.log('[UMO-V4] undo() returning: undone point', undonePoint);
          return matchObj;
        },

        // Additional methods that v3 tests might use
        reset: () => {
          matchUp = createMatchUp({
            matchUpFormat: matchUp.matchUpFormat,
            matchUpId: matchUp.matchUpId,
          });

          // Trigger reset callback if registered
          if ((matchObj as any)._resetCallback) {
            try {
              (matchObj as any)._resetCallback(matchObj);
            } catch (error) {
              console.error('Error in reset callback:', error);
            }
          }

          return matchObj;
        },

        nextService: () => {
          updateServiceTracking();
          return currentServer;
        },

        nextTeamServing: () => {
          return firstService % 2;
        },

        nextTeamReceiving: () => {
          return (firstService + 1) % 2;
        },

        participants: (value?: any) => {
          if (value !== undefined) {
            // Set participants
            return matchObj;
          }
          return matchUp.sides.map((side) => side.participant);
        },

        doubles: (value?: boolean) => {
          if (value !== undefined) {
            // Set doubles mode
            return matchObj;
          }
          return matchUp.matchUpType === 'DOUBLES';
        },

        singles: (value?: boolean) => {
          if (value !== undefined) {
            // Set singles mode
            return matchObj;
          }
          return matchUp.matchUpType === 'SINGLES';
        },

        // Statistics API (v3 compatible)
        stats: {
          counters: (setFilter?: number) => {
            console.log('[UMO-V4] stats.counters() called with setFilter:', setFilter);

            // CRITICAL: Use pointHistory instead of matchUp.history.points
            // pointHistory has enriched points with serve, result, etc. from enrichPoint()
            // matchUp.history.points only has raw points from addPoint()
            return buildCounters(pointHistory, { setFilter });
          },
          calculated: (setFilter?: number) => {
            console.log('[UMO-V4] stats.calculated() called with setFilter:', setFilter);

            // CRITICAL: Use pointHistory for enriched points
            const counters = buildCounters(pointHistory, { setFilter });
            return calculateStats(counters);
          },
        },

        // Export as TODS matchUp
        toMatchUp: () => {
          // Return full matchUp with all metadata
          return {
            ...matchUp,
            // Ensure metadata is preserved
            tournamentName: (matchUp as any).tournamentName,
            category: (matchUp as any).category,
            level: (matchUp as any).level,
            court: (matchUp as any).court,
            umpire: (matchUp as any).umpire,
            scheduledDate: (matchUp as any).scheduledDate,
          };
        },

        // Decorate point with additional metadata
        decoratePoint: (point: any, metadata: any) => {
          console.log('[UMO-V4] decoratePoint called with:', {
            index: point?.index,
            metadata,
          });

          if (!point || point.index === undefined) {
            console.log('[UMO-V4] Invalid point, returning');
            return matchObj;
          }

          // V4 addPoint() mutates matchUp in place (no cloning).
          // So we can directly update the point in matchUp.history.points.

          console.log('[UMO-V4]   Point before decoration:', matchUp.history?.points[point.index]);

          // Update the actual point in the CURRENT matchUp's history
          if (matchUp.history?.points && matchUp.history.points[point.index]) {
            Object.assign(matchUp.history.points[point.index], metadata);
            console.log('[UMO-V4]   Point after decoration:', matchUp.history.points[point.index]);
          } else {
            console.log('[UMO-V4] ERROR: Could not find point at index', point.index);
          }

          // Also update in pointHistory array for statistics
          const pointInHistory = pointHistory.find((p) => p.index === point.index);
          if (pointInHistory) {
            Object.assign(pointInHistory, metadata);
          }

          // Update the point parameter so caller sees the change
          Object.assign(point, metadata);

          return matchObj;
        },

        // Match status property (getter/setter)
        get status() {
          return (matchUp as any).status || '';
        },
        set status(value: string) {
          (matchUp as any).status = value;
        },

        // Access internal matchUp for debugging
        _matchUp: () => matchUp,
        _pointHistory: () => pointHistory,
      };

      return matchObj;
    },
    /**
     * fromMatchUp - Convert TODS matchUp to v3 format (stub for now)
     *
     * @param matchUp - TODS matchUp object
     * @returns Configuration object for v3 adapter
     */
    fromMatchUp: (matchUp: any) => {
      return {
        id: matchUp.matchUpId,
        type: matchUp.matchUpFormat,
        participants: matchUp.sides?.flatMap((side: any) => (side.participant ? [side.participant] : [])),
        isDoubles: matchUp.matchUpType === 'DOUBLES',
      };
    },
  };

  return adapter;
}

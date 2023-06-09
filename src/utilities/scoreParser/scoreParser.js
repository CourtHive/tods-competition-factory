import { isValidPattern } from './validPatterns';
import { transforms } from './transforms';

let transformations = {};
let invalid = [];

const processingOrder = [
  'handleNumeric',
  'handleWalkover',
  'handleRetired',
  'replaceOh',
  'stringScore',
  'punctuationAdjustments',
  'excisions',
  'handleSpaceSeparator',
  'matchKnownPatterns',
  'removeDanglingBits',
  'handleBracketSpacing',
  'matchKnownPatterns',
  'containedSets',
  'separateScoreBlocks',
  'handleGameSeparation',
  'removeErroneous',
  'joinFloatingTiebreak',
  'handleSetSlashSeparation',
  'handleTiebreakSlashSeparation',
  'properTiebreak',
  'sensibleSets',
  'superSquare',
];

// secondPass is used to process only numbers which have been extracted from strings
const secondPass = [
  'handleNumeric',
  'separateScoreBlocks',
  'sensibleSets',
  'superSquare',
];

export function getInvalid() {
  return invalid;
}
export function dumpInvalid() {
  invalid = [];
}

export function getTransformations() {
  return transformations;
}
export function resetTransformations() {
  transformations = {};
}

export function tidyScore({
  score: incomingScore,
  stepLog,
  fullLog,
  profile,
  identifier,
  fileName,
  sheetName,
}) {
  let modifications = [],
    matchUpStatus,
    applied = [],
    attributes,
    result;

  let score = incomingScore;

  const doProcess = (methods) => {
    methods.forEach((method) => {
      result = transforms[method]({
        profile, // config object compatible with provider profiles
        identifier, // optional identifier (used in test harness)
        matchUpStatus,
        attributes,
        applied,
        score,
      });
      const modified = result.score !== score;
      if (modified) {
        modifications.push({ method, score: result.score });
      }

      if (
        stepLog &&
        (fullLog || modified || result.matchUpStatus !== matchUpStatus)
      ) {
        if (matchUpStatus) {
          console.log({ score: result.score, matchUpStatus }, method);
        } else {
          console.log({ score: result.score }, method);
        }
      }

      if (result.matchUpStatus) matchUpStatus = result.matchUpStatus;
      if (result.attributes) attributes = result.attributes;
      if (result.applied) applied = result.applied;
      score = result.score;
    });
  };

  doProcess(processingOrder);

  let isValid = isValidPattern(score);
  if (!isValid) {
    // Hail Mary: extract only the numbers from the string
    score = incomingScore.toString().replace(/\D/g, '');
    if (attributes?.removed) {
      attributes.removed = undefined;
    }
    doProcess(secondPass);

    isValid = isValidPattern(score);
    if (!isValid) {
      invalid.push({ score, fileName, sheetName });
      score = '';
    }
  }

  applied.forEach((application) => {
    if (!transformations[application]) {
      transformations[application] = 0;
    }
    transformations[application] += 1;
  });

  return {
    score,
    matchUpStatus: matchUpStatus?.toUpperCase(),
    modifications,
    isValid,
  };
}

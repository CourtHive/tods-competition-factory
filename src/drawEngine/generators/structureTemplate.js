import { unique, UUID } from '../../utilities';
import { ROUND_OUTCOME } from '../../constants/drawDefinitionConstants';

export const structureTemplate = ({
  stage,
  structureId,
  matchUps = [],
  structures,
  stageOrder,
  roundLimit,
  roundOffset,
  exitProfile,
  // matchUpType, // unnecessary; factory propagates to this point in case it is ever necessary
  matchUpFormat,
  structureType,
  structureAbbreviation,
  structureName,
  seedingProfile,
  qualifyingRound,
  stageSequence = 1,
  seedAssignments = [],
  finishingPosition = ROUND_OUTCOME,
}) => {
  const structure = {
    structureAbbreviation,
    structureName,
    // matchUpType,
    matchUpFormat,
    stageSequence,
    finishingPosition,
    seedAssignments,
    structureId: structureId || UUID(),
  };

  if (stage) structure.stage = stage;
  if (stageOrder) structure.stageOrder = stageOrder;
  if (roundLimit) structure.roundLimit = roundLimit;
  if (roundOffset) structure.roundOffset = roundOffset;
  if (structureType) structure.structureType = structureType;
  if (seedingProfile) structure.seedingProfile = seedingProfile;
  if (qualifyingRound) structure.qualifyingRound = qualifyingRound;
  if (exitProfile) structure.exitProfile = exitProfile;

  const positionAssignments = []
    .concat(...matchUps.map((matchUp) => matchUp.drawPositions))
    .filter(Boolean);

  if (structures) {
    structure.structures = structures;
  } else {
    structure.matchUps = matchUps;
    structure.positionAssignments = unique(positionAssignments)
      .sort((a, b) => a - b)
      .map((drawPosition) => ({ drawPosition }));
  }

  return structure;
};

export default structureTemplate;

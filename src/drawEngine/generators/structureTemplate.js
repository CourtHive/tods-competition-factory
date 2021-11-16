import { unique, UUID } from '../../utilities';
import { ROUND_OUTCOME } from '../../constants/drawDefinitionConstants';

export const structureTemplate = ({
  finishingPosition = ROUND_OUTCOME,
  structureAbbreviation,
  seedAssignments = [],
  stageSequence = 1,
  qualifyingRound,
  seedingProfile,
  matchUpFormat,
  structureType,
  structureName,
  matchUps = [],
  structureId,
  exitProfile,
  roundOffset,
  roundLimit,
  stageOrder,
  structures,
  stage,
}) => {
  const structure = {
    structureId: structureId || UUID(),
    structureAbbreviation,
    finishingPosition,
    seedAssignments,
    matchUpFormat,
    stageSequence,
    structureName,
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

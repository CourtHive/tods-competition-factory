import { unique, UUID } from '../../utilities';
import { ROUND_OUTCOME } from '../../constants/drawDefinitionConstants';

export const structureTemplate = ({
  stage,
  matchUps = [],
  structures,
  stageOrder,
  roundLimit,
  roundOffset,
  matchUpFormat,
  structureType,
  structureAbbreviation,
  structureName,
  seedingProfile,
  structureIndex,
  qualifyingRound,
  stageSequence = 1,
  seedAssignments = [],
  finishingPosition = ROUND_OUTCOME,
}) => {
  const structure = {
    structureAbbreviation,
    structureName,
    matchUpFormat,
    stageSequence,
    finishingPosition,
    seedAssignments,
    structureId: UUID(),
  };

  if (stage) structure.stage = stage;
  if (stageOrder) structure.stageOrder = stageOrder;
  if (roundLimit) structure.roundLimit = roundLimit;
  if (roundOffset) structure.roundOffset = roundOffset;
  if (structureType) structure.structureType = structureType;
  if (seedingProfile) structure.seedingProfile = seedingProfile;
  if (qualifyingRound) structure.qualifyingRound = qualifyingRound;

  const positionAssignments = []
    .concat(...matchUps.map(matchUp => matchUp.drawPositions))
    .filter(f => f);

  if (structures) {
    structure.structures = structures;
  } else {
    structure.matchUps = matchUps;
    structure.positionAssignments = unique(positionAssignments)
      .sort((a, b) => a - b)
      .map(drawPosition => ({ drawPosition }));
    if (structureIndex) structure.structureIndex = structureIndex;
  }

  return structure;
};

export default structureTemplate;

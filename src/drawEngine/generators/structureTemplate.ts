import { unique, UUID } from '../../utilities';

import { ROUND_OUTCOME } from '../../constants/drawDefinitionConstants';
import {
  MatchUp,
  SeedAssignment,
  Structure,
} from '../../types/tournamentFromSchema';

type StructureTemplateArgs = {
  seedAssignments?: SeedAssignment[];
  qualifyingRoundNumber?: number;
  structureAbbreviation?: string;
  finishingPosition?: string;
  structures?: Structure[];
  structureOrder?: number;
  matchUpFormat?: string;
  stageSequence?: number;
  structureName?: string;
  structureType?: string;
  matchUps?: MatchUp[];
  roundOffset?: number;
  structureId?: string;
  seedingProfile?: any;
  roundLimit?: number;
  stageOrder?: number;
  stage?: string;
};

export const structureTemplate = ({
  finishingPosition = ROUND_OUTCOME,
  qualifyingRoundNumber,
  structureAbbreviation,
  seedAssignments = [],
  stageSequence = 1,
  structureOrder,
  seedingProfile,
  matchUpFormat,
  structureType,
  structureName,
  matchUps = [],
  structureId,
  roundOffset,
  roundLimit,
  stageOrder,
  structures,
  stage,
}: StructureTemplateArgs) => {
  const structure: any = {
    structureId: structureId || UUID(),
    structureAbbreviation,
    finishingPosition,
    seedAssignments,
    matchUpFormat,
    stageSequence,
    structureName,
  };

  if (structureOrder) structure.structureOrder = structureOrder;
  if (structureType) structure.structureType = structureType;
  if (seedingProfile) structure.seedingProfile = seedingProfile;
  if (roundOffset) structure.roundOffset = roundOffset;
  if (stageOrder) structure.stageOrder = stageOrder;
  if (roundLimit) structure.roundLimit = roundLimit;
  if (stage) structure.stage = stage;

  if (qualifyingRoundNumber)
    structure.qualifyingRoundNumber = qualifyingRoundNumber;

  const drawPositions = matchUps
    .flatMap(({ drawPositions }) => drawPositions)
    .filter(Boolean);

  if (structures) {
    structure.structures = structures;
  } else {
    structure.matchUps = matchUps;
    structure.positionAssignments = unique(drawPositions)
      .sort((a, b) => a - b)
      .map((drawPosition) => ({ drawPosition }));
  }

  return structure;
};

export default structureTemplate;
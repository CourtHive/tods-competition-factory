import { validateTieFormat } from '@Assemblies/governors/scoreGovernor';
import tieFormatDefaults from '@Generators/templates/tieFormatDefaults';

// constants and types
import { FORMAT_STANDARD } from '@Fixtures/scoring/matchUpFormats';
import { MAIN } from '@Constants/drawDefinitionConstants';
import { TieFormat } from '@Types/tournamentTypes';
import { ResultType } from '@Types/factoryTypes';
import { TEAM } from '@Constants/eventConstants';

export function getDrawFormat(params): ResultType & { tieFormat?: TieFormat; matchUpFormat?: string } {
  const {
    existingDrawDefinition,
    hydrateCollections,
    enforceGender,
    tieFormatName,
    matchUpType,
    eventType,
    isMock,
    event,
  } = params;
  // drawDefinition cannot have both tieFormat and matchUpFormat
  let { tieFormat, matchUpFormat } = params;

  if (matchUpType === TEAM && eventType === TEAM) {
    // if there is an existingDrawDefinition which has a tieFormat on MAIN structure
    // use this tieFormat ONLY when no tieFormat is specified in params
    const existingMainTieFormat = existingDrawDefinition?.structures?.find(({ stage }) => stage === MAIN)?.tieFormat;

    tieFormat =
      tieFormat ||
      existingMainTieFormat ||
      // if tieFormatName is provided and it matches the name of the tieFormat attached to parent event...
      (tieFormatName && event?.tieFormat?.tieFormatName === tieFormatName && event.tieFormat) ||
      // if the tieFormatName is not found in the factory then will use default
      (tieFormatName &&
        tieFormatDefaults({
          namedFormat: tieFormatName,
          hydrateCollections,
          isMock,
          event,
        })) ||
      // if no tieFormat is found on event then will use default
      event?.tieFormat ||
      tieFormatDefaults({ event, isMock, hydrateCollections });

    matchUpFormat = undefined;
  } else if (!matchUpFormat) {
    tieFormat = undefined;
    if (!event?.matchUpFormat) {
      matchUpFormat = FORMAT_STANDARD;
    }
  }

  if (tieFormat) {
    const result = validateTieFormat({
      gender: event?.gender,
      enforceGender,
      tieFormat,
    });
    if (result.error) return result;
  }

  return { tieFormat, matchUpFormat };
}

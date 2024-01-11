export function getItemTieFormat({ item, drawDefinition, structure, event }) {
  if (!item) return;
  if (item.tieFormat) return item.tieFormat;

  // if there is a tieFormatId, only possible to look for referenced tieFormat in tieFormats on drawDefinition and event
  if (item.tieFormatId) {
    if (drawDefinition.tieFormat) return drawDefinition.tieFormat;
    const tieFormat = drawDefinition.tieFormats?.find(
      (tf) => item.tieFormatId === tf.tieFormatId
    );
    if (tieFormat) return tieFormat;

    if (event.tieFormat) return event.tieFormat;
    return event.tieFormats?.find((tf) => item.tieFormatId === tf.tieFormatId);
  }
  if (structure.tieFormat) return structure.tieFormat;
  if (structure.tieFormatId) {
    const structureTieFormat = drawDefinition.tieFormats?.find(
      (tf) => structure.tieFormatId === tf.tieFormatId
    );
    if (structureTieFormat) return structureTieFormat;
  }
}

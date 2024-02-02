export function getDrawIsPublished({ publishStatus, drawId }) {
  if (publishStatus?.drawDetails) {
    return publishStatus.drawDetails?.[drawId]?.publishingDetail?.published;
  } else if (publishStatus?.drawIds) {
    return publishStatus.drawIds.includes(drawId);
  }
  return true;
}

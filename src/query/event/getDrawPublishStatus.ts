export function getDrawPublishStatus({ drawDetails, drawId }) {
  // TODO: check details.embargo
  const details = drawDetails?.[drawId]?.publishingDetail;
  return details?.published;
}

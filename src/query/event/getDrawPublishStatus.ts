export function getDrawPublishStatus({ drawDetails, drawId }) {
  const details = drawDetails?.[drawId]?.publishingDetail;
  return details?.published;
}

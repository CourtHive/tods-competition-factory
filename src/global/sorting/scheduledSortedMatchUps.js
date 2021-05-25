export function scheduledSortedMatchUps({ matchUps, schedulingProfile }) {
  if (schedulingProfile?.length) {
    console.log({ schedulingProfile });
  }
  return matchUps.sort((a, b) => {
    return (
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  });
}

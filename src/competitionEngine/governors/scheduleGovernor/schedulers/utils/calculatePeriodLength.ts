export function calculatePeriodLength({
  averageMatchUpMinutes,
  periodLength = 30,
  recoveryMinutes,
}) {
  const combinedMinutes =
    (averageMatchUpMinutes || 90) + (recoveryMinutes || 0);
  return periodLength > combinedMinutes ? combinedMinutes : periodLength || 30;
}

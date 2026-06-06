export function calculateForecast(
  currentSpend: number,
  dayOfMonth: number,
  daysInMonth: number
) {
  const dailyAverage = currentSpend / dayOfMonth;

  const projectedMonthlySpend =
    dailyAverage * daysInMonth;

  return {
    dailyAverage,
    projectedMonthlySpend,
  };
}
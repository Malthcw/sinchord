export type TimeOfDay = "Morning" | "Afternoon" | "Evening";

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export function getGreeting(
  name: string | null,
  date: Date = new Date(),
): string {
  return `${getTimeOfDay(date)}, ${name ?? "Stranger"}`;
}

export function formatHeaderDate(date:Date = new Date()): string{
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday} · ${day} ${month}`.toUpperCase();
}

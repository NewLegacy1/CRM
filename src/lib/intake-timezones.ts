/** Common IANA zones for intake forms (extend as needed). */
export const INTAKE_TIMEZONE_OPTIONS = [
  { value: "America/Toronto", label: "Eastern (Toronto)" },
  { value: "America/New_York", label: "Eastern (New York)" },
  { value: "America/Chicago", label: "Central (Chicago)" },
  { value: "America/Denver", label: "Mountain (Denver)" },
  { value: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
  { value: "America/Vancouver", label: "Pacific (Vancouver)" },
  { value: "America/Halifax", label: "Atlantic (Halifax)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "UK (London)" },
  { value: "Other / not listed", label: "Other / not listed" },
] as const;

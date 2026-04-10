/**
 * Framer Motion whileInView defaults for marketing sections.
 * Positive root margin + low amount = animations start before content is fully on-screen
 * (fixes late triggers on iOS Safari / dynamic viewport).
 */
export const marketingWhileInView = {
  once: true as const,
  amount: 0.04 as const,
  margin: "18% 0px 22% 0px" as const,
} as const;

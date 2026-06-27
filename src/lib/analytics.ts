import { track } from '@vercel/analytics'

export type PortfolioEvent =
  | 'mode_selected'
  | 'case_study_opened'
  | 'chat_started'
  | 'resume_downloaded'
  | 'contact_clicked'

export function trackPortfolioEvent(
  name: PortfolioEvent,
  properties?: Record<string, string | number | boolean>,
) {
  track(name, properties)
}

import type { TestDetails } from '@playwright/test';

export const SEVERITIES = ['blocker', 'critical', 'normal', 'minor', 'trivial'] as const;
export type SeverityLevel = (typeof SEVERITIES)[number];

function severityDetails(level: SeverityLevel): TestDetails {
  return {
    tag: `@${level}`,
    annotation: [{ type: 'severity', description: level }],
  };
}

export const blocker = severityDetails('blocker');
export const critical = severityDetails('critical');
export const normal = severityDetails('normal');
export const minor = severityDetails('minor');
export const trivial = severityDetails('trivial');

export { expect, test } from '../fixtures/test';

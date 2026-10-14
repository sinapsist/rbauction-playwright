import { Severity, severity } from 'allure-js-commons';

const SEVERITY_BY_TAG: Record<string, Severity> = {
  '@blocker': Severity.BLOCKER,
  '@critical': Severity.CRITICAL,
  '@normal': Severity.NORMAL,
  '@minor': Severity.MINOR,
  '@trivial': Severity.TRIVIAL,
};

/** Copies the Playwright severity tag onto the Allure report. */
export async function applyReportedSeverity(tags: readonly string[]): Promise<void> {
  const severityTag = tags.find((tag) =>
    Object.prototype.hasOwnProperty.call(SEVERITY_BY_TAG, tag),
  );
  const reported = severityTag ? SEVERITY_BY_TAG[severityTag] : undefined;
  await severity(reported ?? Severity.NORMAL);
}

"""Read-only test-contract check. The browser test source is already normalized."""
from pathlib import Path
s=Path('experience/tests/report-v4.mjs').read_text()
for required in ('waitForReportImages','await expect.poll','process.exitCode=1','report-e2e.json'):
 if required not in s:raise RuntimeError('Report test contract missing: '+required)
print('REPORT_TEST_HELPERS_READY')

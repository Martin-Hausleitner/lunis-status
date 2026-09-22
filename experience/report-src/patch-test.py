from pathlib import Path
p=Path('experience/tests/report-v4.mjs')
s=p.read_text()
a="async function ready(page){await page.waitForFunction(()=>Array.from(document.querySelectorAll('img[src]')).every(i=>i.complete&&i.naturalWidth>0));}"
b="async function ready(page){const {waitForReportImages}=await import('../report-src/test-support.mjs');await waitForReportImages(page);}"
if a in s:s=s.replace(a,b)
elif b not in s:raise RuntimeError('Unexpected report image readiness helper')
p.write_text(s)
print('REPORT_TEST_HELPERS_READY')

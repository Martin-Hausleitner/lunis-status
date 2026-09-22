export async function waitForReportImages(page){
  // Native lazy loading must be exercised by actual scrolling, not by changing
  // the document or replacing images with mocks before making screenshots.
  for(const image of await page.locator('img[src]').all()){
    if(await image.isVisible())await image.scrollIntoViewIfNeeded();
  }
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('img[src]')).every(i=>i.complete&&i.naturalWidth>0),{},{timeout:20000});
  await page.evaluate(()=>window.scrollTo(0,0));
}

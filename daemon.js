const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
      headless: true,
    args: [
      '--no-sandbox',
      'disable-setuid-sandbox',
    ]});
  const page = await browser.newPage();
  page.on('console',message=>{
    console.log(message);
  });
  page.on('error',error=>{
    console.log(error);
  });
  await page.goto('http://127.0.0.1/fitoverse/simulator.html?worldname=fitolando&worlduri=worlds/fitolando&signalserver=127.0.0.1:8181');
})();

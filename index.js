const puppeteer = require('puppeteer');
let nespressoData = Promise.resolve();
const express = require('express');
const app = express();

app.get("/", async function(req, res) {
    res.status(200).json(await nespressoData);
  });

fetchPods = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.nespresso.com/us/en/order/capsules/vertuo', { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        let rows = document.getElementsByClassName('ProductListElement');

        getText = (className, row) => {
            return row.querySelector(className).textContent;
        }

        const pods = [];
        for (let row of rows) {
            let name = getText('.ProductListElement__name', row);
            let description = getText('.ProductListElement__headline', row);
            let size = getText('.ProductListElement__cup-size', row);
            let intensity = getText('.ProductListElement__intensity', row);
            let price = getText('.ProductListElement__price', row);
            let inStock = getText('.ProductListElement__add-to-basket', row).includes("ADD TO BAG");
            pods.push({ name, description, size, intensity, price, inStock });
        }
        return pods
    });
    await browser.close();
    return data;
};
nespressoData = fetchPods();
setInterval(() => {nespressoData = fetchPods()}, 60 * 1000);

app.listen(8000, () => {console.log('app listening on port 8000')});
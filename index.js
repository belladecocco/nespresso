const puppeteer = require('puppeteer');

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
    console.log(data);
};
fetchPods();
setInterval(fetchPods, 60 * 1000);
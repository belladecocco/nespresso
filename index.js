const mongo = require("mongodb");
const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const MongoClient = mongo.MongoClient;

const url = "mongodb://localhost:27017/";

(async () => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const db = client.db("nespresso");

    app.get("/", async function (req, res) {
        res.send(await db.collection("current").find({}).toArray());
    });
    app.get("/historical/:podName", async function (req, res) {
        res.send(await db.collection("historical").find({name: req.params.podName}).toArray());
    });

    fetchPods = async () => {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://www.nespresso.com/us/en/order/capsules/vertuo', { waitUntil: 'networkidle2' });

        const data = await page.evaluate(() => {
            let rows = document.getElementsByClassName('ProductListElement');

            let getText = (className, row) => {
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


    let fetchAndStore = async () => {
        let nespressoData = await fetchPods();
        let nespressoCurrent = db.collection("current");
        let nespressoHistory = db.collection("historical");
        for (let pod of nespressoData) {
            let finder = await nespressoCurrent.findOneAndUpdate({ name: pod.name }, { $set: pod }, { upsert: true });
            if (finder.value == undefined || finder.value.price != pod.price || finder.value.inStock != pod.inStock) {
                nespressoHistory.insertOne({ name: pod.name, price: pod.price, inStock: pod.inStock, date: new Date() })
            }
        }
    }

    setInterval(() => { fetchAndStore() }, 60 * 1000);

    app.listen(8000, () => { console.log('app listening on port 8000') });

})();

# nespresso-scraper
 collects nespresso vertuo pod data from nespresso.com using puppeteer. saves data as pod objects to two mongodb collections: current and historical.
 ## to start
 1. clone the repo
 2. `npm install`
 ## to run
 `npm start`
## to call
  * GET `/` returns data from 'current' database. a pod object contains the following properties: name, description, size, intensity, price, inStock.
  * GET `/historical/PODNAME` returns data entries from 'historical' database. a pod is inserted in historical database if it is new or changes in price of inStock. 
## next steps
  * build out a UI with current pod data and charts with historical pod data
  * include more endpoints

"use strict";

const fs = require("fs");
const ASINS = require("./asinList");
const chunk = require("./helpers/chunk");
const scrape = require("./helpers/scrape");

(async () => {
  const asins = Object.entries(ASINS);

  for (let [key, value] of asins) {
    const CHUNKED_ASIN_LIST = chunk(value.asinList, 10);
    const FILE_NAME = key;

    for (let i = 0; i < CHUNKED_ASIN_LIST.length; i++) {
      try {
        const data = await scrape(CHUNKED_ASIN_LIST[i]);
        const fileData = fs.existsSync(`./asins/${FILE_NAME}.json`)
          ? fs.readFileSync(`./asins/${FILE_NAME}.json`, "utf8")
          : [];
        const failedAsinData = fs.existsSync(`./asins/failedAsins.json`)
          ? fs.readFileSync(`./asins/failedAsins.json`, "utf8")
          : [];

        let asins = fileData.length ? JSON.parse(fileData) : [];
        let failedAsins = failedAsinData.length
          ? JSON.parse(failedAsinData)
          : [];

        data.forEach(asin => {
          if (
            asin.asin &&
            !asins.some(item => item.asin === asin.asin) &&
            asin.offeringID &&
            asin.offeringID.length
          ) {
            asins.push(asin);
          } else if (!failedAsins.some(item => item.asin === asin.asin)) {
            failedAsins.push(asin);
          }
        });

        fs.writeFileSync(`./asins/${FILE_NAME}.json`, JSON.stringify(asins));
        fs.writeFileSync(
          `./asins/failedAsins.json`,
          JSON.stringify(failedAsins)
        );
      } catch (error) {
        console.log(error);
      }
    }
  }
})();

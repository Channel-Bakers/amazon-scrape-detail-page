"use strict";

const fs = require("fs");

(async () => {
  const failedAsinData = fs.existsSync(`./asins/failedAsins.json`)
    ? fs.readFileSync(`./asins/failedAsins.json`, "utf8")
    : [];

  let failedAsins = failedAsinData.length ? JSON.parse(failedAsinData) : [];

  if (failedAsins.length) {
    failedAsins.forEach(asin => {
      console.log(asin.asin);
    });
  }
})();

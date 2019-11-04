'use strict';

const puppeteer = require("puppeteer");

/**
 *
 * @param {array} asins list of asins to scrape
 */
const scrape = async asins => {
  const data = [];

  await Promise.all(
    asins.map(async asin => {
      const asinData = await (async () => {
        try {
          console.log(asin);

          const browser = await puppeteer.launch({
            // args: ["--proxy-server=127.0.0.1:9876"]
          });
          const page = await browser.newPage();

          await page.goto(`https://www.amazon.com/dp/${asin}?th=1&psc=1`, {
            waitUntil: "load"
          });

          const pageData = await page.evaluate(() => {
            const asin = window.location.pathname.split("/")[2];
            let title = document.getElementById("productTitle");
            let image = document.getElementById("landingImage");
            let price = document.getElementById("priceblock_ourprice");
            let offeringID = document.getElementById("offerListingID");
            let color = document.getElementById("variation_color_name");
            let size = document.getElementById("variation_size_name");

            if (price) price = price.innerText;
            if (title) title = title.innerText;
            if (image) image = image.src;
            if (offeringID) offeringID = offeringID.value;
            if (color) {
              color = color.querySelector(".selection")
                ? color.querySelector(".selection").innerText
                : color.innerText.split(":")[1].trim();
            }
            if (size) {
              size = size.classList.contains("variation-dropdown")
                ? size.querySelector(
                    "#dropdown_selected_size_name .a-dropdown-prompt"
                  ).innerText
                : size.innerText.split(":")[1].trim();
            }

            return {
              asin,
              title,
              image,
              color,
              size,
              price,
              offeringID
            };
          });

          await browser.close();

          return pageData;
        } catch (error) {
          console.log(`Error scraping ${asin}`);
          console.log(error);
        }
      })();

      data.push(asinData);
    })
  );

  return data;
};

module.exports = scrape;
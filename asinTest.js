'use strict';

const puppeteer = require('puppeteer');

(async () => {
	const asin = 'B01N2147MR';

	try {
		// const browser = await puppeteer.launch();
		const browser = await puppeteer.launch({
			ignoreHTTPSErrors: true,
			dumpio: false,
			// headless: true,
			devtools: false,
			// ignoreDefaultArgs: true,
			ignoreDefaultFlags: true,
			defaultViewport: {
				//--window-size in args
				width: 1280,
				height: 1024,
			},
			args: [
				/* TODO : https://peter.sh/experiments/chromium-command-line-switches/
	there is still a whole bunch of stuff to disable
	*/
				//'--crash-test', // Causes the browser process to crash on startup, useful to see if we catch that correctly
				// not idea if those 2 aa options are usefull with disable gl thingy
				// '--disable-canvas-aa', // Disable antialiasing on 2d canvas
				// '--disable-2d-canvas-clip-aa', // Disable antialiasing on 2d canvas clips
				'--disable-gl-drawing-for-tests', // BEST OPTION EVER! Disables GL drawing operations which produce pixel output. With this the GL output will not be correct but tests will run faster.
				// '--disable-dev-shm-usage', // ???
				// '--no-zygote', // wtf does that mean ?
				'--use-gl=desktop', // better cpu usage with --use-gl=desktop rather than --use-gl=swiftshader, still needs more testing.
				'--enable-webgl',
				'--hide-scrollbars',
				'--mute-audio',
				'--no-first-run',
				'--disable-infobars',
				'--disable-breakpad',
				'--ignore-gpu-blacklist',
				'--window-size=1280,1024', // see defaultViewport
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--ignore-certificate-errors',
				'--proxy-server=socks5://127.0.0.1:9050',
				'--proxy-bypass-list=*',
			],
		});
		const page = await browser.newPage();

		// let currentIpAddress = '';

		// page.on('response', response => {
		//   if (response.ok() === false) {
		//     exec('(echo authenticate \'""\'; echo signal newnym; echo quit) | nc localhost 9051', (error, stdout, stderr) => {
		//       if (stdout.match(/250/g).length === 3) {
		//         console.log('Success: The IP Address has been changed.');
		//       } else {
		//         console.log('Error: A problem occured while attempting to change the IP Address.');
		//       }
		//     });
		//   } else {
		//     console.log('Success: The Page Response was successful (no need to change the IP Address).');
		//   }
		// });

		// enable request interception
		await page.setRequestInterception(true);
		// add header for the navigation requests
		page.on('request', (request) => {
			// Do nothing in case of non-navigation requests.
			if (!request.isNavigationRequest()) {
				request.continue();
				return;
			}
			// Add a new header for navigation request.
			const headers = request.headers();
			headers['X-Requested-With'] = 'XMLHttpRequest';
			request.continue({headers});
		});

		await page.goto(`https://www.amazon.com/dp/${asin}?th=1&psc=1`, {
			waitUntil: 'load',
		});

		const pageData = await page.evaluate(() => {
			try {
				const asin = window.location.pathname.split('/')[2];
				let title = document.getElementById('productTitle');
				let image = document.getElementById('landingImage');
				let price = document.getElementById('priceblock_ourprice');
				let offeringID = document.getElementById('offerListingID');
				let color = document.getElementById('variation_color_name');
				let size = document.getElementById('variation_size_name');

				if (price) price = price.innerText;
				if (title) title = title.innerText;
				if (image) image = image.src;
				if (offeringID) offeringID = offeringID.value;
				if (color) {
					color = color.querySelector('.selection')
						? color.querySelector('.selection').innerText
						: color.innerText.split(':')[1].trim();
				}
				if (size) {
					size = size.classList.contains('variation-dropdown')
						? size.querySelector(
								'#dropdown_selected_size_name .a-dropdown-prompt'
						  ).innerText
						: size.innerText.split(':')[1].trim();
				}

				// const page = document.body.innerHTML;

				// return page;

				return {
					asin,
					title,
					image,
					color,
					size,
					price,
					offeringID
				};
			} catch (error) {
				return error;
			}
		});

		await browser.close();

		console.log(pageData);
	} catch (error) {
		console.log(`Error scraping ${asin}`);
		console.log(error);
	}
})();

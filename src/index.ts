import puppeteer, { Browser } from 'puppeteer';
import childProcess from 'child_process';

const exec = childProcess.exec;

(async () => {

	for (let i = 0; i < 10; i++) {
		const start = new Date();
		await getTheStuff();
		console.log(`Completed ${i} in ${+(new Date()) - +(start)}`);
	}
})();

export async function getTheStuff() {

	const browser = await puppeteer.launch({
		args: [
			// '--proxy-server=socks5://127.0.0.1:9050',
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-infobars',
			'--window-position=0,0',
			'--ignore-certifcate-errors',
			'--ignore-certifcate-errors-spki-list',
			'--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
		],
	});
	const page = await browser.newPage();
	const url = 'https://www.google.com/search?q=bird+food';

	page.on('response', response => {
		// Ignore requests that aren't the one we are explicitly doing
		if (response.request().url() === url) {
			if (response.status() > 399) {
				console.log('response.status', response.status(), response.request().url());
				exec('(echo authenticate \'""\'; echo signal newnym; echo quit) | nc localhost 9051', (error, stdout, stderr) => {
					if (stdout.match(/250/g).length === 3) {
						console.log('Success: The IP Address has been changed.');
					} else {
						console.log('Error: A problem occured while attempting to change the IP Address.');
					}
				});
			}
			else {
				console.log('Success: The Page Response was successful (no need to change the IP Address).');
			}
		}
	});

	await page.goto(url);
	try {
		await page.waitForSelector('#captcha-form', { timeout: 2500 });
		console.log('captcha time, let us proxy');
		await browser.close();

		exec('(echo authenticate \'""\'; echo signal newnym; echo quit) | nc localhost 9051', (error, stdout, stderr) => {
			if (stdout.match(/250/g).length === 3) {
				console.log('Success: The IP Address has been changed.');
			} else {
				console.log('Error: A problem occured while attempting to change the IP Address.');
			}
		});
		return getTheStuff();
	}
	catch (e) {
		console.log('no captcha, carry on!');
	}

	const citeElements = await page.$$('cite');
	console.log('cite elements', citeElements.length);

	await browser.close();

}
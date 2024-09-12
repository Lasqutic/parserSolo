import { launch } from 'puppeteer';

export async function initializeBrowser() {
  
    const browser =  launch({
        headless: false,
        defaultViewport: false,
        userDataDir: './tmp'
    });
    return await browser;
}


import { getTotalPages, parsProductPage } from './pagination.js';
import pLimit from 'p-limit';

export async function parsManufacturer(browser, manufacturerUrl) {
    const page = await browser.newPage();
    let allManufacturerProducts = [];
    await page.goto(manufacturerUrl);
    const totalPages = await getTotalPages(page);
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const products = await parsProductPage(page, manufacturerUrl, pageNum);
        allManufacturerProducts.push(...products)
    }
    await page.close();
    return allManufacturerProducts;
}

//to do 
export async function parseManufacturersParallelWithLimit(manufacturerUrls, parallelLimit, browser) {
    const limit = pLimit(parallelLimit);

    const parsingPromises = manufacturerUrls.map((url) => {
        return limit(async () => {
            try {
                return await parsManufacturer(browser, url)
            } catch (error) {
                return error.message;
            }
        });
    });


    const results = await Promise.all(parsingPromises);

    const validResults = results.filter(result => result !== null);

    return validResults.flat();
}

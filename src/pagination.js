import { parsProduct } from './product.js';


export async function getTotalPages(page) {
    const defaultPageNumber = '1';
    const isPaginationExist = await page.$('.bx-pag-next');

    return isPaginationExist
        ? await page.$eval('.bx-pag-next', el => el.previousElementSibling.textContent)
        : defaultPageNumber;
}

export async function parsProductPage(page, manufacnureUrl, pageNum) {
    const pageUrl = `${manufacnureUrl}?PAGEN_1=${pageNum}`;
    await page.goto(pageUrl);
    let productUrls = await getProductUrls(page);
    let productPageData = [];
    for (const productUrl of productUrls) {
     productPageData.push(...await parsProduct(page, productUrl));
    }
    return productPageData;
}

export async function getProductUrls(page) {
    const AllProductsFromPage = await page.$$eval('.bx_catalog_item_images', links =>
        links.map(link => link.getAttribute('href')));

    return AllProductsFromPage;

}


import { extractProductData } from './src/product.js';
import { initializeBrowser } from './src/browser.js';

test('parses real website page correctly', async () => {

    const browser = await initializeBrowser();
    const page = await browser.newPage()
    await page.goto('https://solo.ua/product/macadamia_zhivilna_maska_z_oli_yu_makadamii/');


    const result = await extractProductData(page);

    expect(result).toEqual([{
        "manufacturer": "JJ",
        "pageUrl": "https://solo.ua/product/macadamia_zhivilna_maska_z_oli_yu_makadamii/",
        "title": "MACADAMIA Живильна маска з олією макадамії",
        "productVolume": "500мл",
        "barcode": "8053830432635",
        "shortBarcode": "2635",
        "imgUrls": [
            "https://solo.ua/upload/iblock/4e5/kg4pqe1tj9divmqho4oy3poa3crrpke2/3d0fd0f7_4585_11ee_8180_0cc47a064540_ua.jpg",
            "https://solo.ua/upload/iblock/741/lq8set8m9wzye79wpss5cvarrecun43d/3d0fd0f6_4585_11ee_8180_0cc47a064540_ua.jpg"
        ],
        "productAvailable": true
    }]);
    await browser.close();
});

/* describe('Google', () => {
    beforeAll(async () => {
      await page.goto('https://google.com');
  });
  
    it('should be titled "Google"', async () => {
      await expect(page.title()).resolves.toMatch('Google');
  });
  }); */
export async function parsProduct(page, productUrl) {
    const fullProductUrl = `https://solo.ua${productUrl}`;
    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY = 10000;
    const INITIAL_DELAY = 1350;

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const extractDataWithRetry = async () => {
        let lastError = null;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            try {
                await delay(attempt === 0 ? INITIAL_DELAY : RETRY_DELAY);
                await page.goto(fullProductUrl);
                const productData = await extractProductData(page);
                if (productData) {
                    return productData;
                }
            } catch (error) {
                lastError = error;
            }
        }
        return [{
            url: fullProductUrl,
            errorMessage: lastError ? lastError.message : "Unknown error",
        }];
    };

    return await extractDataWithRetry();
}


export async function extractProductData(page) {
    try {

        return await page.evaluate(() => {
            const productTitle = document.querySelector('.sml').textContent;
            const isColorProduct = document.querySelector('.col-12.clearfix.mwh') !== null;
            const pageUrl = window.location.href;

            const getProductDetails = (productTitle, productVolume = null, productBarcode, shortBarcode, productImages, isProductAvailable) => {
                const manufacturerElement = document.querySelector('.col_one_fourth.col_last > a');
                const manufacturerName = manufacturerElement ? manufacturerElement.getAttribute('title') : 'Unknown Manufacturer';
                return {
                    manufacturer: manufacturerName,
                    pageUrl: pageUrl,
                    title: productTitle,
                    productVolume,
                    barcode: productBarcode,
                    shortBarcode,
                    imgUrls: productImages,
                    productAvailable: isProductAvailable
                };
            };

            const getImages = () => {
                const images = [];
                const baseUrl = 'https://solo.ua';
                const productImage = baseUrl + document.querySelector('.bx_bigimages_aligner img').getAttribute('src');

                const extractImageUrl = (element) => {
                    const styleAttribute = element.getAttribute('style');
                    const urlMatch = styleAttribute.match(/url\(['"]?(.*?)['"]?\)/);
                    return urlMatch ? baseUrl + urlMatch[1] : null;
                };

                document.querySelectorAll('.bx_slide .cnt_item').forEach(element => {
                    const container = element.closest('.bx_slider_conteiner');
                    const containerStyle = container.getAttribute('style');

                    if (!containerStyle || containerStyle === 'display: ;') {
                        const imageUrl = extractImageUrl(element);
                        if (imageUrl) {
                            images.push(imageUrl);
                        }
                    }
                });

                if (images[0] !== productImage) {
                    images.unshift(productImage);
                }

                return images;
            };

            const extractDetails = (items, extractFunc) => {
                return Array.from(items).map(extractFunc).filter(Boolean);
            };

            const extractProduct = () => {

                const productSizeVariations = document.querySelectorAll('.bx_item_detail_size.full .bx_size ul > li');
                if (productSizeVariations.length > 0) {
                    return extractDetails(productSizeVariations, productSize => {
                        if (productSize.getAttribute('style') !== 'width: 20%; display: none;') {
                            productSize.click();
                            const productImages = getImages();
                            const productVolume = productSize.querySelector('i').getAttribute('title');
                            const productBarcode = document.querySelector('dl').lastElementChild.textContent;
                            const shortBarcode = productBarcode.slice(-4);
                            const isProductAvailable = !document.querySelector('.add-to-cart.button.nomargin')
                                .closest('.item_buttons_counter_block').getAttribute('style').includes('display: none;');

                            return getProductDetails(productTitle, productVolume, productBarcode, shortBarcode, productImages, isProductAvailable);
                        }
                    });

                }
                else {
                    throw new Error('Cannot read properties of null')
                }


            };

            const extractColorProduct = () => {

                const colorElements = document.querySelectorAll('.col-12.clearfix.mwh');
                if (colorElements.length > 0) {
                    return extractDetails(colorElements, colorElement => {
                        const productImages = getImages();
                        const tintName = colorElement.innerText.match('^.*?(?=\n)')[0];
                        const fullTitle = `${productTitle}, ${tintName}`;
                        const barcodeMatches = colorElement.innerText.match(/\b\d{13}\b/g);
                        const productBarcode = barcodeMatches ? barcodeMatches[0] : 'barcode is null';
                        const shortBarcode = productBarcode.slice(-4);
                        const isProductAvailable = !/Немає в наявності/i.test(colorElement.innerText);

                        return getProductDetails(fullTitle, null, productBarcode, shortBarcode, productImages, isProductAvailable);
                    });
                }
                else {
                    throw new Error('Cannot read properties of null')
                }



            };
            if (isColorProduct) {
                return extractColorProduct();

            } else if (productTitle === 'Страница не найдена') {
                return [{
                    errorUrl: pageUrl,
                    errorMessage: productTitle
                }];
            }
            else {
                return extractProduct()
            }


        })
    } catch (error) {
        return [{
            errorUrl: page.url(),
            errorMessage: error.message,
        }];
    }

}
import { initializeBrowser } from './browser.js';
import { parsManufacturer, parseManufacturersParallelWithLimit } from './manufacturer.js';
import AllManufacturersList from './data/manufacturerList.js';
import writeJsonFile from './utils/json/writeJson.js'

async function main() {
    const browser = await initializeBrowser();

    writeJsonFile('testlimit2.json', await parseManufacturersParallelWithLimit(AllManufacturersList, 2, browser))
    
}

main();

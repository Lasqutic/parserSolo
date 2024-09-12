import { writeFileSync } from 'fs';
export default function writeJsonFile(filePath, jsonObject) {
    try {

        if (jsonObject === null || typeof jsonObject !== 'object') {
            throw new Error('Invalid object: must be non null and be an object.');
        }
        const jsonData = JSON.stringify(jsonObject, null, 2);

        writeFileSync(filePath, jsonData, 'utf-8');

        console.log('JSON has been successfully written to the file.');
        return true;
    } catch (error) {
        console.error('JSON writing error: ', error.message);
        return false;
    }
};

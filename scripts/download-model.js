import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO = 'kiruthik2409/mental-health-xgboost-onnx';
const FILENAME = 'mental_health_model.onnx'; // User provided filename
const BRANCH = 'main';
const URL = `https://huggingface.co/${REPO}/resolve/${BRANCH}/${FILENAME}`;
const DEST_DIR = path.resolve(__dirname, '../public/models');
const DEST_FILE = path.join(DEST_DIR, 'model.onnx');

// Ensure directory exists
if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

console.log(`Downloading ${FILENAME} from ${REPO}...`);
console.log(`URL: ${URL}`);

const file = fs.createWriteStream(DEST_FILE);

https.get(URL, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        console.log(`Redirecting to: ${redirectUrl}`);
        https.get(redirectUrl, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Failed to download: Status Code ${res.statusCode}`);
                file.close();
                fs.unlinkSync(DEST_FILE);
                return;
            }
            res.pipe(file);
            setupFileHandlers(file, DEST_FILE);
        });
        return;
    }

    if (response.statusCode !== 200) {
        console.error(`Failed to download: Status Code ${response.statusCode}`);
        file.close();
        fs.unlinkSync(DEST_FILE);
        return;
    }

    response.pipe(file);
    setupFileHandlers(file, DEST_FILE);

}).on('error', (err) => {
    fs.unlinkSync(DEST_FILE);
    console.error('Error downloading file:', err.message);
});

function setupFileHandlers(fileStream, filePath) {
    fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Download completed! Model saved to: ${filePath}`);

        // Verify size
        const stats = fs.statSync(filePath);
        console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        if (stats.size < 1000) {
            console.warn("WARNING: File seems too small. It might be an LFS pointer or error page.");
            console.log("If this is an LFS pointer, you might need to use the 'download raw' link.");
        }
    });
}

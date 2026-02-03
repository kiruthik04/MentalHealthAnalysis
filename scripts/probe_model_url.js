import https from 'https';

const REPO = 'kiruthik2409/mental-health-xgboost-onnx';
const CANDIDATES = [
    { branch: 'main', file: 'model.onnx' },
    { branch: 'main', file: 'xgboost_model.onnx' },
    { branch: 'main', file: 'mental_health.onnx' },
    { branch: 'main', file: 'mental-health.onnx' },
    { branch: 'main', file: 'mental_health_xgboost.onnx' },
    { branch: 'main', file: 'xgb_model.onnx' },
    { branch: 'master', file: 'model.onnx' },
    { branch: 'main', file: 'model.json' }, // Sometimes it's JSON for other frameworks, but we need ONNX
    { branch: 'main', file: 'mental-health-xgboost-onnx.onnx' }
];

console.log(`Probing ${REPO} for valid files...`);

function checkUrl(branch, file) {
    return new Promise((resolve) => {
        const url = `https://huggingface.co/${REPO}/resolve/${branch}/${file}`;
        const req = https.request(url, { method: 'HEAD' }, (res) => {
            // 200 = OK, 302 = Redirect (likely valid download link)
            if (res.statusCode === 200 || res.statusCode === 302) {
                console.log(`[FOUND] ${branch}/${file} -> ${res.statusCode}`);
                resolve({ branch, file, url, status: res.statusCode });
            } else {
                console.log(`[MISSING] ${branch}/${file} -> ${res.statusCode}`);
                resolve(null);
            }
        });
        req.on('error', () => resolve(null));
        req.end();
    });
}

async function run() {
    for (const c of CANDIDATES) {
        const result = await checkUrl(c.branch, c.file);
        if (result) {
            console.log("\n!!! SUCCESS !!!");
            console.log(`Valid Model Found: ${result.url}`);
            process.exit(0);
        }
    }
    console.log("\nNo valid model file found in common locations.");
    process.exit(1);
}

run();

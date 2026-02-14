import http from 'http';

function check() {
    console.log("Checking API health...");
    http.get('http://localhost:4000/health', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log("Health Check:", res.statusCode, data);

            if (res.statusCode === 200) {
                checkProfile();
            }
        });
    }).on('error', (err) => {
        console.error("Health Check Error:", err.message);
    });
}

function checkProfile() {
    console.log("Checking Profile API for u_p1...");
    http.get('http://localhost:4000/api/profile/u_p1', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log("Profile Check:", res.statusCode, data);
        });
    }).on('error', (err) => {
        console.error("Profile Check Error:", err.message);
    });
}

check();

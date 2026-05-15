const fs = require('fs');
const path = 'f:/stitch_ayla_media_women_s_photography/ella/src/app/admin/AdminDashboardClient.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/fetch\("\/api\/reviews"\)\.then/g, 'fetch("/api/reviews?all=true").then');
code = code.replace(/const rRes = await fetch\("\/api\/reviews"\);/g, 'const rRes = await fetch("/api/reviews?all=true");');

fs.writeFileSync(path, code);
console.log("Replaced reviews fetch");

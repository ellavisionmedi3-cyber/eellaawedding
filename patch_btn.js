const fs = require('fs');
const path = 'f:/stitch_ayla_media_women_s_photography/ella/src/app/admin/AdminDashboardClient.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `                            <button onClick={() => setSelected(b)} style={s({ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" })}>\n                              <span className="icon" style={{ fontSize: 16 }}>visibility</span>\n                            </button>\n                          </div>`;

const targetStrCrlf = targetStr.replace(/\n/g, '\r\n');

const replaceStr = `                            <button onClick={() => setSelected(b)} style={s({ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" })}>\n                              <span className="icon" style={{ fontSize: 16 }}>visibility</span>\n                            </button>\n                            <button onClick={() => deleteBooking(b.id)} style={s({ width: 32, height: 32, borderRadius: 8, background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.2)", color: "#ff4d4d", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" })}>\n                              <span className="icon" style={{ fontSize: 16 }}>delete</span>\n                            </button>\n                          </div>`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
} else if (code.includes(targetStrCrlf)) {
  code = code.replace(targetStrCrlf, replaceStr);
} else {
  console.log("Could not find target string");
  process.exit(1);
}

fs.writeFileSync(path, code);
console.log("Patch successful");

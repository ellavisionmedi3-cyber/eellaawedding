const fs = require('fs');
const path = 'f:/stitch_ayla_media_women_s_photography/ella/src/app/admin/AdminDashboardClient.tsx';
let code = fs.readFileSync(path, 'utf8');

const funcs = `
  const deleteBooking = async (id: string) => {
    if(!confirm(isRtl ? "هل أنت متأكد من حذف هذا الاستفسار؟" : "Are you sure you want to delete this inquiry?")) return;
    setBusy(id);
    await fetch(\`/api/bookings/\${id}\`, { method: "DELETE" });
    setBookingsList(prev => prev.filter(b => b.id !== id));
    setBusy(null);
    notify(isRtl ? "تم حذف الاستفسار" : "Inquiry deleted");
    router.refresh();
  };

  const exportBookings = () => {
    const csvRows = [];
    const headers = isRtl ? ["الاسم", "رقم الجوال"] : ["Name", "Mobile"];
    csvRows.push(headers.join(","));
    for (const b of bookingsList) {
      csvRows.push(\`\${b.client_name},\${b.mobile}\`);
    }
    const blob = new Blob(["\\uFEFF" + csvRows.join("\\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inquiries.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateStatus = async`;

code = code.replace('  const updateStatus = async', funcs);

const exportBtn = `</button>
                  ))}
                  <button onClick={exportBookings} style={s({ padding: "6px 16px", borderRadius: 50, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 })}>
                    <span className="icon" style={{fontSize: 14}}>download</span> {isRtl ? "تنزيل" : "Export"}
                  </button>
                </div>
              </div>`;

code = code.replace(`</button>\n                  ))}\n                </div>\n              </div>`, exportBtn);
code = code.replace(`</button>\r\n                  ))}\r\n                </div>\r\n              </div>`, exportBtn); // CRLF fallback

const deleteBtn = `<button onClick={() => setSelected(b)} style={s({ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" })}>
                              <span className="icon" style={{ fontSize: 16 }}>visibility</span>
                            </button>
                            <button onClick={() => deleteBooking(b.id)} style={s({ width: 32, height: 32, borderRadius: 8, background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.2)", color: "#ff4d4d", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" })}>
                              <span className="icon" style={{ fontSize: 16 }}>delete</span>
                            </button>`;

code = code.replace(`<button onClick={() => setSelected(b)} style={s({ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" })}>
                              <span className="icon" style={{ fontSize: 16 }}>visibility</span>
                            </button>`, deleteBtn);

fs.writeFileSync(path, code);
console.log("Done");

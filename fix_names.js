const fs = require('fs');
let c = fs.readFileSync('src/context/translations.ts', 'utf8');
c = c.replace(/Ayla/g, 'Ella')
     .replace(/أيلة/g, 'إيلا')
     .replace(/ايلا/g, 'إيلا')
     .replace(/\s*kids:\s*"[^"]+",/g, '');
fs.writeFileSync('src/context/translations.ts', c);

const files = [
  'src/app/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/admin/AdminDashboardClient.tsx',
  'src/app/privacy/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/api/test-email/route.ts',
  'src/app/api/tamara/webhook/route.ts',
  'src/app/api/bookings/route.ts',
  'src/components/home/TestimonialsSection.tsx',
  'src/lib/db.ts'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/Ayla/g, 'Ella')
                     .replace(/أيلة/g, 'إيلا')
                     .replace(/ايلا/g, 'إيلا');
    fs.writeFileSync(file, content);
  }
}
console.log('Replacements done');

import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const assetsDir = path.join(distDir, 'assets');

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const jsFile = files.find(f => f.endsWith('.js'));
  const cssFile = files.find(f => f.endsWith('.css'));

  if (jsFile && cssFile) {
    const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');
    const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NFRC — Network Firewall Rule Compiler (Interactive Presentation)</title>
    <style>
      ${cssContent}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      ${jsContent}
    </script>
  </body>
</html>`;

    fs.writeFileSync(path.resolve('standalone.html'), htmlContent);
    console.log('Successfully created standalone.html (single-file, offline self-contained HTML)!');
  }
}


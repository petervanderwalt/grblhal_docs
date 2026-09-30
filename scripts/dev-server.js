const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const BUILD = path.join(ROOT, 'docs');
const portArg = process.argv.find(arg => arg.startsWith('--port='));
const PORT = Number(portArg ? portArg.split('=')[1] : process.env.PORT || 3103);
const clients = new Set();

let buildTimer;
let building = false;
let rebuildQueued = false;

function buildSite() {
  return new Promise(resolve => {
    const build = spawn(process.execPath, [path.join(__dirname, 'build-docs.js'), '--prefix=/docs'], {
      cwd: ROOT,
      stdio: 'inherit'
    });

    build.on('close', code => resolve(code === 0));
    build.on('error', error => {
      console.error(`\nUnable to start the documentation build: ${error.message}`);
      resolve(false);
    });
  });
}

function notifyRebuild() {
  for (const client of clients) client.write('event: rebuilt\ndata: ok\n\n');
}

async function rebuild() {
  if (building) {
    rebuildQueued = true;
    return;
  }

  building = true;
  console.log('\n🔄 Rebuilding documentation...');
  const succeeded = await buildSite();
  building = false;

  if (succeeded) {
    console.log('✅ Preview updated');
    notifyRebuild();
  } else {
    console.log('❌ Preview was not refreshed because the build failed');
  }

  if (rebuildQueued) {
    rebuildQueued = false;
    rebuild();
  }
}

function scheduleRebuild() {
  clearTimeout(buildTimer);
  buildTimer = setTimeout(rebuild, 150);
}

function contentType(file) {
  const types = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  };
  return types[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

function previewClientScript() {
  return `<script>
(() => {
  const key = 'grblhal-docs-preview-scroll:' + location.href;
  const restore = () => {
    const saved = sessionStorage.getItem(key);
    if (!saved) return;
    sessionStorage.removeItem(key);
    const { x, y } = JSON.parse(saved);
    setTimeout(() => scrollTo(x, y), 25);
  };
  addEventListener('DOMContentLoaded', restore, { once: true });
  new EventSource('/__docs_events').addEventListener('rebuilt', () => {
    sessionStorage.setItem(key, JSON.stringify({ x: scrollX, y: scrollY }));
    location.reload();
  });
})();
</script>`;
}

function serveFile(requestPath, response) {
  const relativePath = requestPath.replace(/^\/docs\/?/, '') || 'index.html';
  const filePath = path.resolve(BUILD, relativePath);

  if (filePath !== BUILD && !filePath.startsWith(BUILD + path.sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  let resolvedPath = filePath;
  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
    resolvedPath = path.join(resolvedPath, 'index.html');
  }

  fs.readFile(resolvedPath, (error, contents) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end(error.code === 'ENOENT' ? 'Not found' : error.message);
      return;
    }

    const type = contentType(resolvedPath);
    response.setHeader('Content-Type', type);
    response.setHeader('Cache-Control', 'no-store');
    if (type.startsWith('text/html')) {
      response.end(contents.toString().replace('</body>', `${previewClientScript()}</body>`));
      return;
    }
    response.end(contents);
  });
}

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);

  if (requestPath === '/__docs_events') {
    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream'
    });
    response.write(': connected\n\n');
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }

  if (requestPath === '/') {
    response.writeHead(302, { Location: '/docs/' }).end();
    return;
  }

  if (!requestPath.startsWith('/docs/')) {
    response.writeHead(404).end('Not found');
    return;
  }

  serveFile(requestPath, response);
});

async function start() {
  if (!await buildSite()) {
    process.exitCode = 1;
    return;
  }

  let port = PORT;
  server.on('listening', () => {
    console.log(`\n👀 Preview watching ${path.relative(ROOT, CONTENT)}/`);
    console.log(`🌐 Open http://localhost:${server.address().port}/docs/\n`);
  });
  server.on('error', error => {
    if (error.code !== 'EADDRINUSE') throw error;
    console.log(`Port ${port} is already in use; trying ${port + 1}.`);
    port += 1;
    server.listen(port);
  });
  server.listen(port);

  const watcher = chokidar.watch(CONTENT, {
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    ignoreInitial: true
  });
  watcher.on('all', (_event, filePath) => {
    console.log(`Detected change: ${path.relative(CONTENT, filePath)}`);
    scheduleRebuild();
  });
  watcher.on('error', error => {
    console.error(`Unable to watch ${CONTENT}: ${error.message}`);
  });
}

start();

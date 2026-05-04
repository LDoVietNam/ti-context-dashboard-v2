const chokidar = require('chokidar');
const { execSync } = require('child_process');
const simpleGit = require('simple-git');
const path = require('path');

// Configuration
const CONTEXT_DIR = path.join(__dirname, '..');
const DASHBOARD_DIR = __dirname;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_URL = `https://${GITHUB_TOKEN}@github.com/LDoVietNam/ti-context-dashboard-v2.git`;

if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable is required');
    console.error('💡 Run: export GITHUB_TOKEN=your_token && node auto-sync.js');
    process.exit(1);
}

const contextFiles = [
    'router-context.json',
    'cli-context.json',
    'automation-context.json',
    'dashboard-context.json',
    'donutbrowser-context.json',
    'mcp-context.json',
    'providers-context.json',
    'tui-context.json'
];

console.log('🚀 Ti Context Dashboard Auto-Sync');
console.log('📁 Watching:', CONTEXT_DIR);
console.log('📄 Files:', contextFiles.join(', '));
console.log('⏹️  Press Ctrl+C to stop\n');

// Debounce timer
let rebuildTimer = null;
const REBUILD_DELAY = 2000; // 2 seconds debounce

async function rebuildAndDeploy() {
    console.log('\n🔄 Rebuilding dashboard...');

    try {
        // 1. Rebuild static HTML
        console.log('📦 Building static HTML...');
        execSync('node build-static.js', { cwd: DASHBOARD_DIR, stdio: 'inherit' });

        // 2. Copy dist to root
        console.log('📋 Copying dist to root...');
        execSync('cp -r dist/* .', { cwd: DASHBOARD_DIR, stdio: 'inherit' });

        // 3. Git operations
        const git = simpleGit(DASHBOARD_DIR, {
            config: {
                'http.https://github.com/.extraheader': 'AUTHORIZATION: basic ' + Buffer.from('x-access-token:' + GITHUB_TOKEN).toString('base64')
            }
        });

        // Check if there are changes
        const status = await git.status();
        if (status.files.length === 0) {
            console.log('✅ No changes to deploy');
            return;
        }

        // 4. Commit changes
        console.log('💾 Committing changes...');
        await git.add('.');
        await git.commit('Auto-sync: Update context files');

        // 5. Push to main with token (force)
        console.log('🚀 Pushing to GitHub...');
        await git.push(REPO_URL, 'main', ['--force']);

        console.log('✅ Deployed successfully!');
        console.log('🌐 URL: https://ldovietnam.github.io/ti-context-dashboard-v2/\n');

    } catch (error) {
        console.error('❌ Error during rebuild/deploy:', error.message);
    }
}

// Watch context files
const watcher = chokidar.watch(
    contextFiles.map(f => path.join(CONTEXT_DIR, f)),
    {
        persistent: true,
        ignoreInitial: true
    }
);

watcher.on('change', (filePath) => {
    console.log(`📝 Changed: ${path.basename(filePath)}`);

    // Debounce rebuild
    if (rebuildTimer) {
        clearTimeout(rebuildTimer);
    }

    rebuildTimer = setTimeout(() => {
        rebuildAndDeploy();
        rebuildTimer = null;
    }, REBUILD_DELAY);
});

watcher.on('error', (error) => {
    console.error('❌ Watcher error:', error);
});

// Initial build
console.log('🔨 Initial build...');
rebuildAndDeploy();

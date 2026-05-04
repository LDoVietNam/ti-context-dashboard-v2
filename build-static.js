const fs = require('fs');
const path = require('path');

const CONTEXT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(__dirname, 'dist');

const contextFiles = [
    {
        id: 'router',
        name: 'Ti Router',
        description: 'AI routing gateway with OpenAI-compatible API',
        path: path.join(CONTEXT_DIR, 'router-context.json')
    },
    {
        id: 'cli',
        name: 'Ti CLI',
        description: 'Microkernel + Plugin architecture for AI agent ecosystem',
        path: path.join(CONTEXT_DIR, 'cli-context.json')
    },
    {
        id: 'automation',
        name: 'Ti Automation',
        description: 'Plugin registry system for automation tasks',
        path: path.join(CONTEXT_DIR, 'automation-context.json')
    },
    {
        id: 'dashboard',
        name: 'Ti Dashboard',
        description: 'Web dashboard with embedded templates and static files',
        path: path.join(CONTEXT_DIR, 'dashboard-context.json')
    },
    {
        id: 'donutbrowser',
        name: 'Donut Browser',
        description: 'Open Source Anti-Detect Browser (Next.js + Tauri/Rust)',
        path: path.join(CONTEXT_DIR, 'donutbrowser-context.json')
    },
    {
        id: 'mcp',
        name: 'MCP Hub',
        description: 'Central hub for all MCP servers and tools',
        path: path.join(CONTEXT_DIR, 'mcp-context.json')
    },
    {
        id: 'providers',
        name: 'Providers',
        description: 'API providers and adapters collection',
        path: path.join(CONTEXT_DIR, 'providers-context.json')
    },
    {
        id: 'tui',
        name: 'Ti TUI',
        description: 'Terminal UI component for Ti Platform',
        path: path.join(CONTEXT_DIR, 'tui-context.json')
    }
];

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load all context files
const contexts = {};
contextFiles.forEach(cf => {
    try {
        const data = fs.readFileSync(cf.path, 'utf8');
        contexts[cf.id] = JSON.parse(data);
        console.log(`✅ Loaded: ${cf.id}`);
    } catch (err) {
        console.error(`❌ Error loading ${cf.id}:`, err.message);
    }
});

// Read HTML template
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Inject embedded data
const scriptTag = `
    <script>
        // Embedded context data
        window.EMBEDDED_CONTEXTS = ${JSON.stringify(contexts)};
        window.CONTEXT_LIST = ${JSON.stringify(contextFiles.map(cf => ({
            id: cf.id,
            name: cf.name,
            description: cf.description
        })))};
    </script>
`;

// Insert before closing </head>
const modifiedHtml = htmlContent.replace('</head>', scriptTag + '</head>');

// Modify loadProjectList to use embedded data first
const modifiedScript = modifiedHtml.replace(
    'const response = await fetch(`/api/contexts?search=${encodeURIComponent(searchTerm)}`);',
    'const response = { json: async () => window.CONTEXT_LIST.filter(cf => cf.name.toLowerCase().includes(searchTerm) || cf.description.toLowerCase().includes(searchTerm)) };'
).replace(
    'const response = await fetch(`/api/context/${project.id}`);',
    'const response = { json: async () => window.EMBEDDED_CONTEXTS[project.id] || {} };'
);

// Write output
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), modifiedScript);
console.log('✅ Built static HTML to dist/index.html');
console.log(`📊 Embedded ${Object.keys(contexts).length} contexts`);

const http = require('http');
const fs = require('fs');
const path = require('path');

const CONTEXT_DIR = 'Z:\\10_WORKPLACE\\Ti\\Ti-learning-lab\\03_Knowledge\\Router\\';
const PORT = 3000;

const contextFiles = [
    {
        id: 'router',
        name: 'Ti Router',
        description: 'AI routing gateway with OpenAI-compatible API',
        path: CONTEXT_DIR + 'router-context.json'
    },
    {
        id: 'cli',
        name: 'Ti CLI',
        description: 'Microkernel + Plugin architecture for AI agent ecosystem',
        path: CONTEXT_DIR + 'cli-context.json'
    },
    {
        id: 'automation',
        name: 'Ti Automation',
        description: 'Plugin registry system for automation tasks',
        path: CONTEXT_DIR + 'automation-context.json'
    },
    {
        id: 'dashboard',
        name: 'Ti Dashboard',
        description: 'Web dashboard with embedded templates and static files',
        path: CONTEXT_DIR + 'dashboard-context.json'
    },
    {
        id: 'donutbrowser',
        name: 'Donut Browser',
        description: 'Open Source Anti-Detect Browser (Next.js + Tauri/Rust)',
        path: CONTEXT_DIR + 'donutbrowser-context.json'
    },
    {
        id: 'mcp',
        name: 'MCP Hub',
        description: 'Central hub for all MCP servers and tools',
        path: CONTEXT_DIR + 'mcp-context.json'
    },
    {
        id: 'providers',
        name: 'Providers',
        description: 'API providers and adapters collection',
        path: CONTEXT_DIR + 'providers-context.json'
    },
    {
        id: 'tui',
        name: 'Ti TUI',
        description: 'Terminal UI component for Ti Platform',
        path: CONTEXT_DIR + 'tui-context.json'
    }
];

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve static files
    if (req.url === '/' || req.url === '/index.html' || req.url.startsWith('/?')) {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // API: Get contexts list
    if (req.url.startsWith('/api/contexts')) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const searchTerm = url.searchParams.get('search')?.toLowerCase() || '';
        
        const filtered = contextFiles.filter(cf => 
            cf.name.toLowerCase().includes(searchTerm) || 
            cf.description.toLowerCase().includes(searchTerm)
        );
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filtered));
        return;
    }

    // Favicon - ignore
    if (req.url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API: Get specific context
    if (req.url.startsWith('/api/context/')) {
        const id = req.url.replace('/api/context/', '');
        const cf = contextFiles.find(f => f.id === id);
        
        console.log(`Loading context: ${id}, found: ${cf ? 'yes' : 'no'}`);
        
        if (!cf) {
            console.log(`Context not found for ID: ${id}`);
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Context not found', id: id }));
            return;
        }
        
        console.log(`Reading file: ${cf.path}`);
        
        fs.readFile(cf.path, 'utf8', (err, data) => {
            if (err) {
                console.log(`Error reading file: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Error reading file: ${err.message}`, path: cf.path }));
                return;
            }
            
            console.log(`File read successfully, size: ${data.length} bytes`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
        return;
    }

    // 404 - Return JSON error
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', url: req.url }));
});

server.listen(PORT, () => {
    console.log(`🚀 Ti Context Dashboard running at http://localhost:${PORT}`);
    console.log(`📁 Serving from: ${CONTEXT_DIR}`);
    console.log(`⏹️  Press Ctrl+C to stop`);
});

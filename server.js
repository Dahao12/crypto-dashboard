#!/usr/bin/env node

/**
 * Servidor local para Crypto Dashboard
 * Uso: node server.js [porta]
 *
 * Exemplo:
 *   node server.js 8000
 *   node server.js 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || 8000;

// MIME types
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Servidor
const server = http.createServer((req, res) => {
    // Log request
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    let filePath = '.' + req.url;

    // Default to index.html
    if (filePath === './') {
        filePath = './index.html';
    }

    // Get file extension
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Read file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                fs.readFile('./index.html', (error, content) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        🚀 Crypto Dashboard Server - Iniciado!        ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║   Local:   http://localhost:${PORT}                       ║`);
    console.log(`║   Network: http://$(get_local_ip):${PORT}/               ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║   Para acessar fora da rede:                              ║');
    console.log('║   1) Ngrok: ngrok http 8000                               ║');
    console.log('║   2) GitHub Pages: ./deploy.sh                            ║');
    console.log('║   3) Netlify: netlify deploy --prod                       ║');
    console.log('║                                                           ║');
    console.log('║   Veja: como-acessar-fora-rede.md                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
});

// Helper function para pegar IP local
function get_local_ip() {
    try {
        const interfaces = require('os').networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
        return 'localhost';
    } catch (error) {
        return 'localhost';
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('');
    console.log('✅ Servidor encerrado.');
    process.exit(0);
});
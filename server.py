#!/usr/bin/env python3
"""
Simple HTTP server for Ti Context Dashboard
Serves the dashboard at http://localhost:8080
"""

import http.server
import socketserver
import os
import json
from urllib.parse import parse_qs

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class ContextHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), ContextHandler) as httpd:
        print(f"🚀 Ti Context Dashboard running at http://localhost:{PORT}")
        print(f"📁 Serving from: {DIRECTORY}")
        print(f"⏹️  Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

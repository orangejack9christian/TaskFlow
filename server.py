#!/usr/bin/env python3
"""
Simple HTTP server for TaskFlow
Access from other devices on your network
"""
import http.server
import socketserver
import socket
import webbrowser
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow access from other devices
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def get_local_ip():
    """Get the local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

def main():
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            local_ip = get_local_ip()
            
            print("=" * 60)
            print("TaskFlow Server Started!")
            print("=" * 60)
            print(f"\nLocal access: http://localhost:{PORT}")
            print(f"Network access: http://{local_ip}:{PORT}")
            print("\nAccess from other devices:")
            print(f"  - Make sure they're on the same Wi-Fi network")
            print(f"  - Open browser and go to: http://{local_ip}:{PORT}")
            print("\nPress Ctrl+C to stop the server")
            print("=" * 60)
            
            # Open browser automatically
            webbrowser.open(f'http://localhost:{PORT}')
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
    except OSError as e:
        if e.errno == 10048:  # Windows: Address already in use
            print(f"\nError: Port {PORT} is already in use.")
            print("Try closing other applications or use a different port.")
        else:
            print(f"\nError: {e}")

if __name__ == "__main__":
    main()

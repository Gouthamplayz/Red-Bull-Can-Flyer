# Pure static file server (Zero storage - 100% private)
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class StaticHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

if __name__ == "__main__":
    print(f"🚀 Can Flyer running at http://localhost:{PORT}")
    httpd = HTTPServer(("", PORT), StaticHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

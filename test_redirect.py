import urllib.request, urllib.parse, json, base64

png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==')

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    '--' + boundary + '\r\n'
    'Content-Disposition: form-data; name="redirect_url"\r\n\r\n'
    '/TrangDanhMucSanPham/TrangSanPham.html\r\n'
    '--' + boundary + '\r\n'
    'Content-Disposition: form-data; name="image"; filename="test.png"\r\n'
    'Content-Type: image/png\r\n\r\n'
).encode() + png + ('\r\n--' + boundary + '--\r\n').encode()

req = urllib.request.Request(
    'http://127.0.0.1:5000/api/ai/search-image-redirect',
    data=body,
    headers={
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
    }
)

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        content = resp.read()
        print('STATUS: ' + str(resp.status))
        print('LEN: ' + str(len(content)))
        print('Has localStorage: ' + str(b'localStorage' in content))
        print('Has productGrid: ' + str(b'productGrid' in content))
        print('Has countdown: ' + str(b'countdown' in content))
        print('Has redirect URL: ' + str(b'TrangDanhMucSanPham' in content))
        print()
        print('Content type header: ' + str(resp.headers.get('Content-Type')))
        print()
        print('LAST 500 chars:')
        print(content[-500:].decode('utf-8', errors='replace'))
except Exception as e:
    print('ERROR: ' + type(e).__name__ + ' ' + str(e))

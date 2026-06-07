with open(r'e:\Study\Code\HTML,CSS,JS\GiaoDienWeb\GiaoDienWeb\TrangDanhMucSanPham\TrangSanPham.html', 'rb') as f:
    c = f.read()

idx = c.find(b'async function handleAISearchParams')
print('Function start:', repr(c[idx:idx+100]))
print()

idx2 = c.find(b'search-session')
print('Session API:', repr(c[idx2-30:idx2+80]))

with open(r'e:\Study\Code\HTML,CSS,JS\GiaoDienWeb\GiaoDienWeb\TrangDanhMucSanPham\TrangSanPham.html', 'rb') as f:
    content = f.read()

# Find and replace the handleAISearchParams function
start_marker = b'async function handleAISearchParams() {'
idx = content.find(start_marker)
if idx < 0:
    print('Start marker not found!')
    exit(1)

# Find end of function by brace counting
depth = 0
end_idx = idx
i = idx
while i < len(content):
    if content[i:i+1] == b'{':
        depth += 1
    elif content[i:i+1] == b'}':
        depth -= 1
        if depth == 0:
            end_idx = i + 1
            break
    i += 1

old_fn = content[idx:end_idx]
print(f'OLD fn len: {len(old_fn)}')

new_fn = b'''async function handleAISearchParams() {
            const params = new URLSearchParams(window.location.search);
            const aiSearchParam = params.get('ai_search');
            showDebug('[AI] PAGE LOAD - ai_search=' + aiSearchParam);

            if (aiSearchParam !== '1') {
                return;
            }

            const banner = document.getElementById('aiSearchBanner');
            const bannerText = document.getElementById('aiSearchBannerText');

            // Buoc 1: Doc tu localStorage (embed tu redirect page)
            try {
                const stored = localStorage.getItem('ai_search_results');
                const metaStr = localStorage.getItem('ai_search_meta');
                showDebug('[AI] localStorage results=' + (stored ? 'EXISTS(' + stored.length + ')' : 'null'));

                if (stored) {
                    const parsed = JSON.parse(stored);
                    AI_SEARCH_RESULTS = Array.isArray(parsed) ? parsed : [];
                    showDebug('[AI] localStorage parse OK: ' + AI_SEARCH_RESULTS.length + ' results');

                    let metaObj = null;
                    try { metaObj = metaStr ? JSON.parse(metaStr) : null; } catch(e) {}

                    if (banner && bannerText) {
                        const topLabel = metaObj && metaObj.topLabel ? metaObj.topLabel : '';
                        bannerText.textContent = AI_SEARCH_RESULTS.length > 0
                            ? 'Tim thay ' + AI_SEARCH_RESULTS.length + ' san pham tuong tu' + (topLabel ? ' - Nhan dien: ' + topLabel : '')
                            : 'Khong tim thay san pham tuong tu' + (topLabel ? ' - Nhan dien: ' + topLabel : '');
                        banner.style.display = 'block';
                    }

                    // Don sach localStorage sau khi doc xong
                    localStorage.removeItem('ai_search_results');
                    localStorage.removeItem('ai_search_meta');
                    showDebug('[AI] Done - localStorage cleared');
                    return;
                }
            } catch(e) {
                showDebug('[AI] localStorage error: ' + e.message);
            }

            // Buoc 2: Thu fetch tu session API (backup)
            const searchId = params.get('search_id');
            if (searchId) {
                showDebug('[AI] Trying session API...');
                try {
                    const resp = await fetch(API_BASE + '/ai/search-session/' + searchId);
                    if (resp.ok) {
                        const data = await resp.json();
                        if (data.success && data.data) {
                            AI_SEARCH_RESULTS = data.data.results || [];
                            const detections = data.data.detections || [];
                            const labelList = detections.map(function(d) { return d.label; }).join(', ');
                            showDebug('[AI] Session OK: ' + AI_SEARCH_RESULTS.length + ' results');

                            if (banner && bannerText) {
                                bannerText.textContent = AI_SEARCH_RESULTS.length > 0
                                    ? 'Tim thay ' + AI_SEARCH_RESULTS.length + ' san pham tuong tu' + (labelList ? ' - Nhan dien: ' + labelList : '')
                                    : 'Khong tim thay san pham tuong tu' + (labelList ? ' - Nhan dien: ' + labelList : '');
                                banner.style.display = 'block';
                            }
                            return;
                        }
                    } else {
                        showDebug('[AI] Session API failed: ' + resp.status);
                    }
                } catch(e) {
                    showDebug('[AI] Session fetch error: ' + e.message);
                }
            }

            // Buoc 3: Khong lay duoc ket qua
            AI_SEARCH_RESULTS = [];
            showDebug('[AI] No results available');
            if (banner && bannerText) {
                bannerText.textContent = 'Khong tim thay san pham tuong tu';
                banner.style.display = 'block';
            }
        }'''

new_content = content.replace(old_fn, new_fn, 1)
if new_content == content:
    print('ERROR: replacement did not happen!')
else:
    with open(r'e:\Study\Code\HTML,CSS,JS\GiaoDienWeb\GiaoDienWeb\TrangDanhMucSanPham\TrangSanPham.html', 'wb') as f:
        f.write(new_content)
    print(f'SUCCESS: replaced {len(old_fn)} -> {len(new_fn)} bytes')
    if b'localStorage' in new_content and b'ai_search_results' in new_content:
        print('VERIFIED: localStorage approach in file')

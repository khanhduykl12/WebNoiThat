import os

base = r'E:\Study\Code\HTML,CSS,JS\GiaoDienWeb\GiaoDienWeb\Pic\Pic_SanPham'

templates = {
    'Sofa': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5E6D3"/>
<rect x="60" y="240" width="680" height="220" rx="30" fill="#8B6347"/>
<rect x="90" y="270" width="620" height="160" rx="20" fill="#C4956A"/>
<rect x="60" y="380" width="80" height="100" rx="15" fill="#6B4C3B"/>
<rect x="660" y="380" width="80" height="100" rx="15" fill="#6B4C3B"/>
<rect x="130" y="430" width="60" height="50" rx="10" fill="#D4A574"/>
<rect x="610" y="430" width="60" height="50" rx="10" fill="#D4A574"/>
<text x="400" y="520" font-family="Segoe UI,Arial" font-size="32" fill="#5C3D2E" text-anchor="middle" font-weight="bold">SOFA NỘI THẤT</text>
<text x="400" y="560" font-family="Segoe UI,Arial" font-size="20" fill="#8B6347" text-anchor="middle">Phòng Khách Cao Cấp</text>
</svg>''',
    'BanTra': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F0E6D8"/>
<ellipse cx="400" cy="300" rx="320" ry="140" fill="#C4956A"/>
<ellipse cx="400" cy="290" rx="300" ry="120" fill="#D4A574"/>
<rect x="370" y="400" width="60" height="140" rx="10" fill="#8B6347"/>
<rect x="310" y="500" width="180" height="20" rx="8" fill="#6B4C3B"/>
<text x="400" y="560" font-family="Segoe UI,Arial" font-size="30" fill="#5C3D2E" text-anchor="middle" font-weight="bold">BÀN TRÀ GỖ</text>
<text x="400" y="595" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Phòng Khách Hiện Đại</text>
</svg>''',
    'KeTV': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F0EB"/>
<rect x="100" y="200" width="600" height="300" rx="15" fill="#E8E0D8"/>
<rect x="120" y="220" width="260" height="180" rx="10" fill="#D4C8BC"/>
<rect x="420" y="220" width="260" height="180" rx="10" fill="#D4C8BC"/>
<rect x="120" y="420" width="560" height="60" rx="8" fill="#C4956A"/>
<rect x="100" y="500" width="30" height="60" rx="5" fill="#8B6347"/>
<rect x="670" y="500" width="30" height="60" rx="5" fill="#8B6347"/>
<text x="400" y="570" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">KỆ TV</text>
<text x="400" y="600" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Nội Thất Phòng Khách</text>
</svg>''',
    'KeTrungBay': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#EDE6DC"/>
<rect x="300" y="80" width="200" height="450" rx="10" fill="#C4956A"/>
<rect x="310" y="90" width="180" height="100" rx="5" fill="#E8D8C4"/>
<rect x="310" y="200" width="180" height="100" rx="5" fill="#E8D8C4"/>
<rect x="310" y="310" width="180" height="100" rx="5" fill="#E8D8C4"/>
<rect x="310" y="420" width="180" height="100" rx="5" fill="#E8D8C4"/>
<text x="400" y="570" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">KỆ TRƯNG BÀY</text>
<text x="400" y="600" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Phong Cách Scandinavia</text>
</svg>''',
    'Rem': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F0EBE4"/>
<rect x="200" y="80" width="400" height="20" rx="5" fill="#8B6347"/>
<rect x="200" y="100" width="400" height="350" rx="10" fill="#F5F0EB" opacity="0.7"/>
<line x1="250" y1="100" x2="250" y2="450" stroke="#D4C8BC" stroke-width="2"/>
<line x1="300" y1="100" x2="300" y2="450" stroke="#D4C8BC" stroke-width="2"/>
<line x1="350" y1="100" x2="350" y2="450" stroke="#D4C8BC" stroke-width="2"/>
<line x1="400" y1="100" x2="400" y2="450" stroke="#D4C8BC" stroke-width="2"/>
<line x1="450" y1="100" x2="450" y2="450" stroke="#D4C8BC" stroke-width="2"/>
<line x1="500" y1="100" x2="500" y2="450" stroke="#D4C8BC" stroke-width="2"/>
<line x1="550" y1="100" x2="550" y2="450" stroke="#D4C8BC" stroke-width="2"/>
<text x="400" y="580" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">RÈM CỬA</text>
</svg>''',
    'Tham': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F0E8E0"/>
<rect x="100" y="150" width="600" height="350" rx="20" fill="#D4C8BC"/>
<rect x="120" y="170" width="560" height="310" rx="15" fill="#C4956A"/>
<rect x="140" y="190" width="520" height="270" rx="10" fill="#E8D8C4"/>
<path d="M160 220 Q260 200 360 220 Q460 240 560 220 Q620 230 660 220" stroke="#C4956A" stroke-width="3" fill="none"/>
<path d="M160 270 Q260 250 360 270 Q460 290 560 270 Q620 280 660 270" stroke="#C4956A" stroke-width="3" fill="none"/>
<path d="M160 320 Q260 300 360 320 Q460 340 560 320 Q620 330 660 320" stroke="#C4956A" stroke-width="3" fill="none"/>
<text x="400" y="560" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">THẢM TRẢI SÀN</text>
<text x="400" y="595" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Phòng Khách Sang Trọng</text>
</svg>''',
    'Goi': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F0EB"/>
<circle cx="400" cy="280" r="180" fill="#C4956A"/>
<circle cx="400" cy="270" r="160" fill="#D4A574"/>
<circle cx="400" cy="260" r="140" fill="#E8D8C4"/>
<ellipse cx="400" cy="520" rx="200" ry="60" fill="#C4956A" opacity="0.3"/>
<text x="400" y="560" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">GỐI TRANG TRÍ</text>
<text x="400" y="595" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Phong Cách Hiện Đại</text>
</svg>''',
    'Giuong': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F0E8E0"/>
<rect x="80" y="280" width="640" height="220" rx="15" fill="#8B6347"/>
<rect x="100" y="300" width="600" height="180" rx="10" fill="#E8D8C4"/>
<rect x="110" y="310" width="580" height="100" rx="8" fill="#F5EDE0"/>
<rect x="80" y="180" width="640" height="120" rx="20" fill="#6B4C3B"/>
<rect x="90" y="190" width="620" height="100" rx="15" fill="#8B6347"/>
<rect x="120" y="500" width="50" height="60" rx="8" fill="#5C3D2E"/>
<rect x="630" y="500" width="50" height="60" rx="8" fill="#5C3D2E"/>
<text x="400" y="570" font-family="Segoe UI,Arial" font-size="32" fill="#5C3D2E" text-anchor="middle" font-weight="bold">GIƯỜNG NGỦ</text>
<text x="400" y="605" font-family="Segoe UI,Arial" font-size="20" fill="#8B6347" text-anchor="middle">Phòng Ngủ Tiện Nghi</text>
</svg>''',
    'GiuongDon': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F0E8E0"/>
<rect x="180" y="250" width="440" height="200" rx="15" fill="#8B6347"/>
<rect x="200" y="270" width="400" height="160" rx="10" fill="#E8D8C4"/>
<rect x="210" y="280" width="380" height="90" rx="8" fill="#F5EDE0"/>
<rect x="180" y="160" width="440" height="110" rx="20" fill="#6B4C3B"/>
<rect x="190" y="170" width="420" height="90" rx="15" fill="#8B6347"/>
<rect x="200" y="450" width="40" height="60" rx="8" fill="#5C3D2E"/>
<rect x="560" y="450" width="40" height="60" rx="8" fill="#5C3D2E"/>
<text x="400" y="560" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">GIƯỜNG NGỦ ĐƠN</text>
<text x="400" y="600" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Thiết Kế Tiện Dụng</text>
</svg>''',
    'TuQuanAo': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F0EB"/>
<rect x="120" y="80" width="560" height="450" rx="15" fill="#E8E0D8"/>
<rect x="130" y="90" width="250" height="430" rx="10" fill="#D4C8BC"/>
<rect x="420" y="90" width="250" height="430" rx="10" fill="#D4C8BC"/>
<rect x="380" y="90" width="40" height="430" rx="5" fill="#C4956A"/>
<rect x="140" y="300" width="110" height="8" rx="4" fill="#8B6347"/>
<rect x="260" y="300" width="110" height="8" rx="4" fill="#8B6347"/>
<rect x="140" y="400" width="110" height="8" rx="4" fill="#8B6347"/>
<rect x="260" y="400" width="110" height="8" rx="4" fill="#8B6347"/>
<rect x="430" y="300" width="110" height="8" rx="4" fill="#8B6347"/>
<rect x="550" y="300" width="110" height="8" rx="4" fill="#8B6347"/>
<rect x="430" y="400" width="110" height="8" rx="4" fill="#8B6347"/>
<rect x="550" y="400" width="110" height="8" rx="4" fill="#8B6347"/>
<text x="400" y="575" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">TỦ QUẦN ÁO</text>
</svg>''',
    'BanTrangDiem': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F0EB"/>
<rect x="180" y="320" width="440" height="200" rx="15" fill="#E8E0D8"/>
<rect x="200" y="340" width="400" height="160" rx="10" fill="#D4C8BC"/>
<rect x="340" y="120" width="120" height="200" rx="60" fill="#C4956A"/>
<rect x="360" y="140" width="80" height="160" rx="40" fill="#E8F4F8" opacity="0.8"/>
<rect x="200" y="520" width="40" height="60" rx="8" fill="#8B6347"/>
<rect x="560" y="520" width="40" height="60" rx="8" fill="#8B6347"/>
<circle cx="250" cy="420" r="25" fill="#C4956A" opacity="0.4"/>
<circle cx="550" cy="420" r="25" fill="#C4956A" opacity="0.4"/>
<text x="400" y="580" font-family="Segoe UI,Arial" font-size="26" fill="#5C3D2E" text-anchor="middle" font-weight="bold">BÀN TRANG ĐIỂM</text>
</svg>''',
    'GaGiuong': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F0EB"/>
<rect x="100" y="150" width="600" height="360" rx="20" fill="#E8E0D8"/>
<rect x="120" y="170" width="560" height="320" rx="15" fill="#F5F5F5"/>
<rect x="120" y="170" width="560" height="120" rx="15" fill="#F5F5F5"/>
<rect x="130" y="180" width="540" height="100" rx="10" fill="#F0F8FF"/>
<rect x="140" y="190" width="80" height="80" rx="10" fill="#E8F0F8"/>
<rect x="240" y="190" width="80" height="80" rx="10" fill="#E8F0F8"/>
<rect x="480" y="190" width="80" height="80" rx="10" fill="#E8F0F8"/>
<rect x="580" y="190" width="80" height="80" rx="10" fill="#E8F0F8"/>
<text x="400" y="570" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">GA GIƯỜNG CAO CẤP</text>
<text x="400" y="605" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Cotton 100% Mềm Mát</text>
</svg>''',
    'KeDauGiuong': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F0E8E0"/>
<rect x="220" y="120" width="360" height="400" rx="15" fill="#C4956A"/>
<rect x="240" y="140" width="320" height="120" rx="10" fill="#E8D8C4"/>
<rect x="240" y="280" width="320" height="120" rx="10" fill="#E8D8C4"/>
<rect x="240" y="420" width="320" height="80" rx="10" fill="#D4A574"/>
<rect x="250" y="150" width="140" height="100" rx="5" fill="#F5EDE0"/>
<rect x="410" y="150" width="140" height="100" rx="5" fill="#F5EDE0"/>
<rect x="250" y="290" width="140" height="100" rx="5" fill="#F5EDE0"/>
<rect x="410" y="290" width="140" height="100" rx="5" fill="#F5EDE0"/>
<text x="400" y="570" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">KỆ ĐẦU GIƯỜNG</text>
<text x="400" y="605" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Gỗ Sồi Tự Nhiên</text>
</svg>''',
    'Den': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#1A1A2E"/>
<rect x="340" y="120" width="120" height="280" rx="20" fill="#C4956A"/>
<rect x="350" y="130" width="100" height="260" rx="15" fill="#FFD700" opacity="0.3"/>
<ellipse cx="400" cy="200" rx="50" ry="50" fill="#FFF8DC" opacity="0.8"/>
<ellipse cx="400" cy="200" rx="35" ry="35" fill="#FFFFFF" opacity="0.9"/>
<rect x="380" y="400" width="40" height="140" rx="10" fill="#C4956A"/>
<ellipse cx="400" cy="540" rx="80" ry="20" fill="#C4956A" opacity="0.4"/>
<text x="400" y="580" font-family="Segoe UI,Arial" font-size="28" fill="#FFD700" text-anchor="middle" font-weight="bold">ĐÈN NGỦ LED</text>
</svg>''',
    'BanAn': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F0E8E0"/>
<ellipse cx="400" cy="260" rx="320" ry="120" fill="#C4956A"/>
<ellipse cx="400" cy="250" rx="300" ry="100" fill="#D4A574"/>
<rect x="370" y="350" width="60" height="180" rx="10" fill="#8B6347"/>
<rect x="310" y="500" width="180" height="30" rx="8" fill="#6B4C3B"/>
<rect x="200" y="480" width="50" height="80" rx="10" fill="#C4956A"/>
<rect x="550" y="480" width="50" height="80" rx="10" fill="#C4956A"/>
<text x="400" y="580" font-family="Segoe UI,Arial" font-size="30" fill="#5C3D2E" text-anchor="middle" font-weight="bold">BÀN ĂN GIA ĐÌNH</text>
<text x="400" y="615" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Gỗ Sồi Tự Nhiên</text>
</svg>''',
    'GheAn': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F0EB"/>
<rect x="250" y="200" width="300" height="300" rx="20" fill="#8B6347"/>
<rect x="260" y="210" width="280" height="200" rx="15" fill="#D4A574"/>
<rect x="270" y="220" width="260" height="180" rx="10" fill="#C4956A"/>
<rect x="300" y="500" width="30" height="60" rx="8" fill="#6B4C3B"/>
<rect x="470" y="500" width="30" height="60" rx="8" fill="#6B4C3B"/>
<rect x="250" y="100" width="40" height="120" rx="15" fill="#8B6347"/>
<rect x="510" y="100" width="40" height="120" rx="15" fill="#8B6347"/>
<text x="400" y="590" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">GHẾ ĂN ĐỆM</text>
<text x="400" y="620" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Phong Cách Lịch Sự</text>
</svg>''',
    'BanLamViec': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F5F5"/>
<rect x="80" y="200" width="640" height="260" rx="15" fill="#E8E0D8"/>
<rect x="100" y="220" width="600" height="220" rx="10" fill="#D4C8BC"/>
<rect x="100" y="460" width="30" height="100" rx="8" fill="#444"/>
<rect x="670" y="460" width="30" height="100" rx="8" fill="#444"/>
<rect x="200" y="460" width="30" height="100" rx="8" fill="#444"/>
<rect x="570" y="460" width="30" height="100" rx="8" fill="#444"/>
<rect x="500" y="280" width="180" height="120" rx="8" fill="#C4956A"/>
<rect x="510" y="290" width="160" height="100" rx="5" fill="#D4A574"/>
<rect x="100" y="350" width="80" height="60" rx="5" fill="#8B6347"/>
<text x="400" y="590" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">BÀN LÀM VIỆC</text>
<text x="400" y="625" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Thiết Kế Hiện Đại</text>
</svg>''',
    'GheVanPhong': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F5F5"/>
<rect x="260" y="80" width="280" height="320" rx="30" fill="#333"/>
<rect x="280" y="100" width="240" height="280" rx="20" fill="#2A2A2A" opacity="0.3"/>
<rect x="260" y="380" width="280" height="80" rx="20" fill="#333"/>
<rect x="350" y="460" width="100" height="80" rx="10" fill="#444"/>
<rect x="300" y="540" width="200" height="20" rx="8" fill="#555"/>
<rect x="200" y="150" width="30" height="200" rx="10" fill="#333"/>
<rect x="570" y="150" width="30" height="200" rx="10" fill="#333"/>
<text x="400" y="590" font-family="Segoe UI,Arial" font-size="28" fill="#333" text-anchor="middle" font-weight="bold">GHẾ VĂN PHÒNG</text>
<text x="400" y="625" font-family="Segoe UI,Arial" font-size="18" fill="#666" text-anchor="middle">Ergonomic Lưới Mesh</text>
</svg>''',
    'KeSach': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F0E8E0"/>
<rect x="220" y="60" width="360" height="480" rx="10" fill="#C4956A"/>
<rect x="230" y="70" width="340" height="100" rx="5" fill="#E8D8C4"/>
<rect x="230" y="180" width="340" height="100" rx="5" fill="#E8D8C4"/>
<rect x="230" y="290" width="340" height="100" rx="5" fill="#E8D8C4"/>
<rect x="230" y="400" width="340" height="130" rx="5" fill="#E8D8C4"/>
<rect x="240" y="80" width="20" height="80" rx="3" fill="#8B6347"/>
<rect x="265" y="90" width="15" height="70" rx="2" fill="#C4956A"/>
<rect x="285" y="85" width="18" height="75" rx="3" fill="#6B4C3B"/>
<rect x="240" y="190" width="20" height="80" rx="3" fill="#8B6347"/>
<rect x="265" y="200" width="15" height="70" rx="2" fill="#C4956A"/>
<text x="400" y="580" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">KỆ SÁCH</text>
<text x="400" y="615" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Phong Cách Tối Giản</text>
</svg>''',
    'Tranh': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F0EB"/>
<rect x="80" y="100" width="200" height="350" rx="5" fill="#8B6347"/>
<rect x="90" y="110" width="180" height="330" rx="3" fill="#C4956A"/>
<rect x="300" y="100" width="200" height="350" rx="5" fill="#8B6347"/>
<rect x="310" y="110" width="180" height="330" rx="3" fill="#D4A574"/>
<rect x="520" y="100" width="200" height="350" rx="5" fill="#8B6347"/>
<rect x="530" y="110" width="180" height="330" rx="3" fill="#E8D8C4"/>
<circle cx="180" cy="250" r="80" fill="#F0E8E0" opacity="0.5"/>
<circle cx="400" cy="250" r="80" fill="#F0E8E0" opacity="0.5"/>
<circle cx="620" cy="250" r="80" fill="#F0E8E0" opacity="0.5"/>
<text x="400" y="520" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">TRANH TREO TƯỜNG</text>
<text x="400" y="555" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Canvas Cao Cấp</text>
</svg>''',
    'BinhHoa': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F0EB"/>
<ellipse cx="400" cy="200" rx="120" ry="150" fill="#E8E0D8"/>
<ellipse cx="400" cy="190" rx="100" ry="130" fill="#F5F5F5"/>
<ellipse cx="400" cy="80" rx="40" ry="30" fill="#D4C8BC"/>
<rect x="380" y="50" width="40" height="50" rx="5" fill="#C4956A"/>
<ellipse cx="400" cy="530" rx="120" ry="30" fill="#E8E0D8" opacity="0.5"/>
<circle cx="250" cy="200" r="60" fill="#D4A574" opacity="0.2"/>
<circle cx="550" cy="300" r="80" fill="#C4956A" opacity="0.15"/>
<text x="400" y="580" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">BÌNH HOA GỐM</text>
<text x="400" y="615" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Trang Trí Sang Trọng</text>
</svg>''',
    'CayCanh': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F0EB"/>
<rect x="280" y="380" width="240" height="160" rx="20" fill="#C4956A"/>
<rect x="300" y="400" width="200" height="120" rx="15" fill="#8B6347"/>
<circle cx="400" cy="300" r="100" fill="#5A8F5A"/>
<circle cx="340" cy="260" r="60" fill="#6BAF6B"/>
<circle cx="460" cy="270" r="55" fill="#4A7F4A"/>
<circle cx="400" cy="220" r="50" fill="#6BAF6B"/>
<circle cx="350" cy="320" r="45" fill="#4A7F4A"/>
<circle cx="450" cy="310" r="50" fill="#5A8F5A"/>
<rect x="385" y="350" width="30" height="60" rx="5" fill="#8B6347"/>
<text x="400" y="580" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">CÂY CẢNH TRANG TRÍ</text>
<text x="400" y="615" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Xanh Mát Tự Nhiên</text>
</svg>''',
    'BanNgoaiTroi': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#E8F4E8"/>
<ellipse cx="400" cy="260" rx="320" ry="120" fill="#8B6347"/>
<ellipse cx="400" cy="250" rx="300" ry="100" fill="#C4956A"/>
<rect x="370" y="350" width="60" height="180" rx="10" fill="#6B4C3B"/>
<rect x="310" y="500" width="180" height="30" rx="8" fill="#5C3D2E"/>
<circle cx="400" cy="80" r="60" fill="#FFD700" opacity="0.3"/>
<circle cx="400" cy="80" r="40" fill="#FFD700" opacity="0.5"/>
<text x="400" y="580" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">BÀN NGOÀI TRỜI</text>
<text x="400" y="615" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Gỗ Acacia Tự Nhiên</text>
</svg>''',
    'GheNgoaiTroi': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#E8F4E8"/>
<rect x="240" y="200" width="320" height="300" rx="20" fill="#C4956A"/>
<rect x="260" y="220" width="280" height="200" rx="15" fill="#D4A574"/>
<rect x="280" y="240" width="240" height="160" rx="10" fill="#E8D8C4"/>
<rect x="280" y="100" width="40" height="140" rx="15" fill="#8B6347"/>
<rect x="480" y="100" width="40" height="140" rx="15" fill="#8B6347"/>
<rect x="300" y="500" width="30" height="60" rx="8" fill="#6B4C3B"/>
<rect x="470" y="500" width="30" height="60" rx="8" fill="#6B4C3B"/>
<circle cx="400" cy="80" r="50" fill="#87CEEB" opacity="0.3"/>
<text x="400" y="590" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">GHẾ NGOÀI TRỜI</text>
<text x="400" y="625" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Nan Gỗ Có Đệm</text>
</svg>''',
    'GuongPhongTam': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#E8F4F8"/>
<ellipse cx="400" cy="280" rx="250" ry="220" fill="#444"/>
<ellipse cx="400" cy="270" rx="230" ry="200" fill="#A8D8EA"/>
<ellipse cx="400" cy="260" rx="210" ry="180" fill="#C8E8F8" opacity="0.7"/>
<ellipse cx="320" cy="200" rx="40" ry="30" fill="#FFFFFF" opacity="0.4"/>
<circle cx="400" cy="80" r="60" fill="#FFD700" opacity="0.2"/>
<rect x="180" y="50" width="440" height="20" rx="5" fill="#C4956A"/>
<text x="400" y="560" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">GƯƠNG PHÒNG TẮM</text>
<text x="400" y="595" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Có Đèn LED Cảm Ứng</text>
</svg>''',
    'KePhongTam': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F5F0EB"/>
<rect x="220" y="80" width="360" height="440" rx="15" fill="#C0C0C0"/>
<rect x="230" y="90" width="340" height="120" rx="10" fill="#D8D8D8"/>
<rect x="230" y="220" width="340" height="120" rx="10" fill="#D8D8D8"/>
<rect x="230" y="350" width="340" height="120" rx="10" fill="#D8D8D8"/>
<rect x="240" y="100" width="320" height="20" rx="5" fill="#A0A0A0"/>
<rect x="240" y="230" width="320" height="20" rx="5" fill="#A0A0A0"/>
<rect x="240" y="360" width="320" height="20" rx="5" fill="#A0A0A0"/>
<text x="400" y="570" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">KỆ PHÒNG TẮM</text>
<text x="400" y="605" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Inox 304 Chống Gỉ</text>
</svg>''',
    'TuBep': '''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#F0E8E0"/>
<rect x="80" y="120" width="640" height="400" rx="15" fill="#E8E0D8"/>
<rect x="100" y="140" width="300" height="180" rx="10" fill="#D4C8BC"/>
<rect x="420" y="140" width="280" height="180" rx="10" fill="#D4C8BC"/>
<rect x="100" y="340" width="600" height="160" rx="10" fill="#C4956A"/>
<rect x="110" y="350" width="280" height="60" rx="5" fill="#E8D8C4"/>
<rect x="410" y="350" width="280" height="60" rx="5" fill="#E8D8C4"/>
<rect x="110" y="420" width="280" height="60" rx="5" fill="#E8D8C4"/>
<rect x="410" y="420" width="280" height="60" rx="5" fill="#E8D8C4"/>
<text x="400" y="570" font-family="Segoe UI,Arial" font-size="28" fill="#5C3D2E" text-anchor="middle" font-weight="bold">TỦ BẾP</text>
<text x="400" y="605" font-family="Segoe UI,Arial" font-size="18" fill="#8B6347" text-anchor="middle">Thiết Kế Hiện Đại</text>
</svg>''',
}

folder_map = {
    'Sofa': 'Sofa', 'BanTra': 'BanTra', 'KeTV': 'KeTV', 'KeTrungBay': 'KeTrungBay',
    'Rem': 'Rem', 'Tham': 'Tham', 'Goi': 'Goi', 'Giuong': 'Giuong',
    'GiuongDon': 'GiuongDon', 'TuQuanAo': 'TuQuanAo', 'BanTrangDiem': 'BanTrangDiem',
    'GaGiuong': 'GaGiuong', 'KeDauGiuong': 'KeDauGiuong', 'Den': 'Den',
    'BanAn': 'BanAn', 'GheAn': 'GheAn', 'BanLamViec': 'BanLamViec',
    'GheVanPhong': 'GheVanPhong', 'KeSach': 'KeSach', 'Tranh': 'Tranh',
    'BinhHoa': 'BinhHoa', 'CayCanh': 'CayCanh', 'BanNgoaiTroi': 'BanNgoaiTroi',
    'GheNgoaiTroi': 'GheNgoaiTroi', 'GuongPhongTam': 'GuongPhongTam',
    'KePhongTam': 'KePhongTam', 'TuBep': 'TuBep',
}

count = 0
for name, svg in templates.items():
    folder = folder_map.get(name, name)
    folder_path = os.path.join(base, folder)
    os.makedirs(folder_path, exist_ok=True)
    for i in range(1, 5):
        filepath = os.path.join(folder_path, f'{name}0{i}.svg')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg)
        count += 1

print(f'Done! Created {count} SVG placeholder images.')

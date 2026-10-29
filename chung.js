// Hàm dùng chung cho trang chủ (index.html) và trang bài viết (bai.html).
// Dữ liệu bài nằm ở du-lieu/bai-viet.js (window.BAI_VIET), nạp trước file này.
'use strict';
var KIND = { news: 'Tin tức', event: 'Sự kiện', activity: 'Hoạt động', honor: 'Vinh danh' };
// ---------- Đơn vị: 5 văn phòng khu vực và 1 ban; bài không gắn đơn vị là tin toàn công ty ----------
var UNITS = [['cao-lanh-lap-vo', 'Ban Cao Lãnh + Lấp Vò'], ['sa-dec', 'VPKV Sa Đéc'], ['hong-ngu', 'VPKV Hồng Ngự'], ['thap-muoi', 'VPKV Tháp Mười'], ['thanh-binh', 'VPKV Thanh Bình'], ['tan-hong', 'VPKV Tân Hồng']];
var UNIT = {};
UNITS.forEach(function (u) { UNIT[u[0]] = u[1]; });
function matchFilter(p, muc, unit) { return (!muc || p.kind === muc) && (!unit || p.unit === unit); }
function filterTitle(muc, unit) { return [muc ? KIND[muc] : '', unit ? UNIT[unit] : ''].filter(Boolean).join(' · ') || 'Mới nhất'; }
// Nút lọc: Tất cả · Tin tức · Sự kiện · Hoạt động · [Các VPKV ▾] · Vinh danh. active=false khi đang tìm kiếm.
function chipsHTML(muc, unit, active) {
  var chip = function (k, name) { return '<button class="chip" type="button" data-muc="' + k + '" aria-pressed="' + (active && (k ? muc === k : !muc && !unit)) + '">' + name + '</button>'; };
  var sel = '<label class="chip chip-sel' + (active && unit ? ' on' : '') + '"><select data-unit aria-label="Lọc theo văn phòng khu vực"><option value="">Các VPKV</option>' +
    UNITS.map(function (u) { return '<option value="' + u[0] + '"' + (unit === u[0] ? ' selected' : '') + '>' + esc(u[1]) + '</option>'; }).join('') + '</select></label>';
  return chip('', 'Tất cả') + NAV.slice(0, 3).map(function (n) { return chip(n[0], n[1]); }).join('') + sel + chip(NAV[3][0], NAV[3][1]);
}
// ---------- Văn phòng khu vực: địa chỉ, điện thoại, địa bàn, giờ làm việc (người dùng cung cấp 2026-10-29) ----------
var UNIT_INFO = {"cao-lanh-lap-vo": {"addr": "Tòa nhà Viettel, 267 Ngô Thì Nhậm, Cao Lãnh, Đồng Tháp", "phone": "0277 3854 142", "area": "Cao Lãnh, Lấp Vò, Lai Vung", "hours": "Sáng 7h30 – 12h00 · Chiều 13h30 – 17h00"}, "sa-dec": {"addr": "530 Nguyễn Sinh Sắc, Sa Đéc, Đồng Tháp", "phone": "", "area": "Sa Đéc, Châu Thành, Lai Vung", "hours": "Sáng 7h30 – 12h00 · Chiều 13h30 – 17h00"}, "hong-ngu": {"addr": "115 Phan Bội Châu, Hồng Ngự, Đồng Tháp", "phone": "", "area": "Hồng Ngự", "hours": "Sáng 7h30 – 12h00 · Chiều 13h30 – 17h00"}, "thap-muoi": {"addr": "15B Lê Lợi, Khóm 1, Tháp Mười, Đồng Tháp", "phone": "", "area": "Tháp Mười", "hours": "Sáng 7h30 – 12h00 · Chiều 13h30 – 17h00"}, "thanh-binh": {"addr": "332 Lê Văn Nhung, Khóm Tân Đông, Thanh Bình, Đồng Tháp", "phone": "", "area": "Thanh Bình, Tam Nông", "hours": "Sáng 7h30 – 12h00 · Chiều 13h30 – 17h00"}, "tan-hong": {"addr": "Đường Trần Phú, Khóm 3, Tân Hồng, Đồng Tháp", "phone": "", "area": "Tân Hồng", "hours": "Sáng 7h30 – 12h00 · Chiều 13h30 – 17h00"}};
var PIN_MAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
function mapsHref(u) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(UNIT_INFO[u].addr); }
function telHref(phone) { return 'tel:' + phone.replace(/\D/g, ''); }
function officeCard(u) {
  var f = UNIT_INFO[u], row = function (k, v) { return v ? '<dt>' + k + '</dt><dd>' + v + '</dd>' : ''; };
  return '<article class="office"><h3>' + esc(UNIT[u]) + '</h3><dl>' + row('Địa bàn', esc(f.area)) + row('Địa chỉ', esc(f.addr)) +
    row('Điện thoại', f.phone ? '<a href="' + telHref(f.phone) + '">' + esc(f.phone) + '</a>' : '') + row('Giờ làm việc', esc(f.hours)) + '</dl>' +
    '<p class="office-act"><a class="pill" href="' + mapsHref(u) + '" target="_blank" rel="noopener">' + PIN_MAP + '<span>Chỉ đường</span></a><a class="pill" href="' + unitHref(u) + '">Xem tin</a></p></article>';
}
function officesHTML() { return UNITS.map(function (u) { return officeCard(u[0]); }).join(''); }
// Dòng thông tin trên đầu danh sách khi đang lọc theo một đơn vị.
function officeStrip(u) {
  var f = UNIT_INFO[u]; if (!f) return '';
  return '<span>' + esc(f.addr) + '</span>' + (f.phone ? '<a href="' + telHref(f.phone) + '">' + esc(f.phone) + '</a>' : '') + '<span>' + esc(f.hours) + '</span>' +
    '<a href="' + mapsHref(u) + '" target="_blank" rel="noopener">Chỉ đường</a>';
}
// Menu thả xuống "Các VPKV" trên đầu trang: đóng khi bấm ra ngoài hoặc chọn xong.
function navDdInit() {
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.nav-dd[open]').forEach(function (d) { if (!d.contains(e.target) || e.target.closest('a')) d.removeAttribute('open'); });
  });
}
var WD = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
var $ = function (s, r) { return (r || document).querySelector(s); };

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
// Ảnh là đường dẫn tương đối trong thư mục anh/ của website.
function okId(p) { return typeof p === 'string' && /^anh\/[A-Za-z0-9_\-.\/]+\.(jpe?g|png|webp)$/i.test(p) && p.indexOf('..') < 0; }
function blob(p) { return okId(p) ? p : ''; }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function todayISO() { return iso(new Date()); }
function parseD(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
function fmtD(s) { var d = parseD(s); return d ? pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() : ''; }
function wd(s) { var d = parseD(s); return d ? WD[d.getDay()] : ''; }
function daysFrom(s) { var d = parseD(s); return d ? Math.round((d - parseD(todayISO())) / 864e5) : 0; }
function icon(n) { return '<svg aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('show'); }, 3200); }
function clean(p) {
  var d = p.data || {};
  var kind = KIND[d.kind] ? d.kind : 'news';
  var photos = Array.isArray(d.photos) ? d.photos.filter(function (x) { return x && okId(x.src); }).slice(0, 200).map(function (x) { return { id: x.src, caption: String(x.caption || '').slice(0, 200), cover: !!x.cover }; }) : [];
  return { id: p.id, kind: kind, title: String(d.title || 'Chưa có tiêu đề').slice(0, 200), excerpt: String(d.excerpt || '').slice(0, 400), body: String(d.body || '').slice(0, 20000),
    date: parseD(d.date) ? d.date : todayISO(), time: /^\d{2}:\d{2}$/.test(d.time) ? d.time : '', timeEnd: /^\d{2}:\d{2}$/.test(d.timeEnd) ? d.timeEnd : '',
    unit: UNIT[d.unit] ? d.unit : '', place: String(d.place || '').slice(0, 200), photos: photos, featured: !!d.featured, sample: !!d.sample, createdAt: String(d.createdAt || '') };
}
function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// Vân quả cầu theo logo: vài vòng tròn lớn nghiêng khác nhau, chấm sáng tại giao điểm.
function norm(a) { var l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
var CIRCLES = [[0.18, 0.96, 0.2], [0.92, 0.28, 0.27], [-0.62, 0.48, 0.62], [0.52, -0.42, 0.74], [-0.28, -0.78, 0.55], [0.72, 0.62, -0.3]].map(function (n) {
  n = norm(n); var u = norm(cross(n, Math.abs(n[0]) < .9 ? [1, 0, 0] : [0, 1, 0])); return { n: n, u: u, v: cross(n, u) };
});
var NODES = [];
CIRCLES.forEach(function (a, i) { CIRCLES.slice(i + 1).forEach(function (b) {
  var c = norm(cross(a.n, b.n));
  // Gộp giao điểm quá gần nhau (ba vòng cắt gần một chỗ) thành một chấm.
  [c, [-c[0], -c[1], -c[2]]].forEach(function (q) { if (!NODES.some(function (m) { return m[0] * q[0] + m[1] * q[1] + m[2] * q[2] > 0.985; })) NODES.push(q); });
}); });
function sphere(rot, tilt, steps) {
  var cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
  function T(p) { var x = p[0] * cr - p[2] * sr, z = p[0] * sr + p[2] * cr, y = p[1] * ct - z * st; return [x, y, p[1] * st + z * ct]; }
  return {
    arcs: CIRCLES.map(function (c) { var out = []; for (var i = 0; i <= steps; i++) { var t = i / steps * Math.PI * 2, a = Math.cos(t), b = Math.sin(t); out.push(T([c.u[0] * a + c.v[0] * b, c.u[1] * a + c.v[1] * b, c.u[2] * a + c.v[2] * b])); } return out; }),
    nodes: NODES.map(T)
  };
}
// Ảnh bìa tự sinh khi bài chưa có ảnh: quả cầu vàng đồng như logo trên nền màu chuyên mục.
function art(p) {
  var h = hash(p.id + p.title), r = function (n) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; return h % n; };
  var bg = { news: '#0678ad', event: '#8f1f4a', activity: '#1f5a3a', honor: '#0b2e4a' }[p.kind];
  var cx = 220 + r(160), cy = 120 + r(80), R = 150 + r(60), g = sphere(r(628) / 100, 0.3 + r(30) / 100, 72), s = '';
  g.arcs.forEach(function (arc) {
    var d = '', on = false;
    arc.forEach(function (q) { if (q[2] > 0.02) { d += (on ? 'L' : 'M') + (cx + q[0] * R).toFixed(1) + ' ' + (cy + q[1] * R).toFixed(1); on = true; } else on = false; });
    if (d) s += '<path d="' + d + '" fill="none" stroke="#fff6e0" stroke-opacity=".85" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
  });
  g.nodes.forEach(function (q) { if (q[2] > 0.12) s += '<circle cx="' + (cx + q[0] * R).toFixed(1) + '" cy="' + (cy + q[1] * R).toFixed(1) + '" r="5.5" fill="#fffaf0"/>'; });
  var gid = 'g' + (hash(p.id) % 1e6) + '_' + (art.n = (art.n || 0) + 1);
  return '<svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="' + gid + '" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="#f6e2a8"/><stop offset=".5" stop-color="#b48b34"/><stop offset="1" stop-color="#4e3a0c"/></radialGradient></defs>' +
    '<rect width="480" height="300" fill="' + bg + '"/><circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="url(#' + gid + ')"/>' + s + '</svg>';
}
function media(p, eager) { var c = coverOf(p) || p.photos[0]; return c ? '<img src="' + thumb(c.id) + '" alt="' + esc(c.caption || p.title) + '"' + (eager ? '' : ' loading="lazy"') + '>' : art(p); }
function byDateDesc(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : (a.createdAt < b.createdAt ? 1 : -1); }
function eventStart(p) { var d = parseD(p.date); if (!d) return null; var t = (p.time || '07:30').split(':'); d.setHours(+t[0], +t[1]); return d; }

// Nội dung bài: các đoạn cách nhau một dòng trống. Cú pháp định dạng (thanh công cụ chèn sẵn):
//   **đậm**  *nghiêng*  __gạch chân__  [chữ](https://…)  ## Tiêu đề mục  - danh sách  1. danh sách  > trích dẫn
//   [giữa] / [phải] / [đều] ở đầu đoạn để căn lề; dòng riêng "[ảnh 2]" hoặc "[ảnh 3, 4]" để chèn ảnh (số theo thứ tự ảnh).
var MARK_LINE = /^\s*\[(?:ảnh|anh|hình|hinh)\s*([\d\s,]+)\]\s*$/i;
var ALIGN = /^\[(giữa|phải|đều|trái)\]\s*/i;
var ALIGN_CLS = { 'giữa': 'al-center', 'phải': 'al-right', 'đều': 'al-justify', 'trái': '' };
// t đã được esc(): chỉ thêm thẻ định dạng, link chỉ nhận http(s).
function inlineFmt(t) {
  return t.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_\n]+)__/g, '<u>$1</u>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
}
// Chữ thuần (bỏ mã ảnh và ký hiệu định dạng) cho khung xem trước khi rê chuột.
function stripMarks(t) {
  return String(t || '').split('\n').filter(function (l) { return !MARK_LINE.test(l); }).map(function (l) {
    return l.replace(ALIGN, '').replace(/^\s*(#{2,3}|[-•]|\d+[.)]|>)\s*/, '')
      .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1').replace(/\*\*|__/g, '').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2');
  }).join('\n');
}
// srcOf: lấy đường dẫn ảnh (mặc định theo mã ảnh; khung xem trước dùng ảnh chưa tải lên).
function renderBody(p, photos, srcOf) {
  srcOf = srcOf || function (ph) { return blob(ph.id); };
  var used = {}, html = '';
  String(p.body || '').split(/\n\s*\n/).forEach(function (block) {
    var buf = [], cls = '', list = null, quote = [];
    function flushP() { var t = buf.join('\n').trim(); if (t) html += '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + inlineFmt(esc(t)).replace(/\n/g, '<br>') + '</p>'; buf = []; cls = ''; }
    function flushL() { if (list) html += '<' + list.tag + '>' + list.items.map(function (x) { return '<li>' + inlineFmt(esc(x)) + '</li>'; }).join('') + '</' + list.tag + '>'; list = null; }
    function flushQ() { if (quote.length) html += '<blockquote>' + inlineFmt(esc(quote.join('\n').trim())).replace(/\n/g, '<br>') + '</blockquote>'; quote = []; }
    function flushAll() { flushP(); flushL(); flushQ(); }
    block.split('\n').forEach(function (line) {
      var m = MARK_LINE.exec(line), mm;
      var nums = m ? m[1].split(',').map(function (x) { return parseInt(x, 10); }).filter(function (n) { return n >= 1 && n <= photos.length; }) : [];
      if (nums.length) {
        flushAll();
        var figs = nums.map(function (n) {
          used[n - 1] = true;
          var ph = photos[n - 1];
          return '<figure class="inl"><button type="button" data-aphoto="' + (n - 1) + '" aria-label="Xem ảnh ' + n + '"><img src="' + esc(srcOf(ph)) + '" alt="' + esc(ph.caption || p.title || '') + '" loading="lazy"></button>' +
            (ph.caption ? '<figcaption>' + esc(ph.caption) + '</figcaption>' : '') + '</figure>';
        }).join('');
        html += nums.length > 1 ? '<div class="inl-row" style="--n:' + Math.min(nums.length, 4) + '">' + figs + '</div>' : figs;
        return;
      }
      if ((mm = /^\s*#{2,3}\s+(.+)$/.exec(line))) { flushAll(); html += '<h2 class="sub">' + inlineFmt(esc(mm[1].trim())) + '</h2>'; return; }
      if ((mm = /^\s*[-•]\s+(.+)$/.exec(line))) { flushP(); flushQ(); if (!list || list.tag !== 'ul') { flushL(); list = { tag: 'ul', items: [] }; } list.items.push(mm[1]); return; }
      if ((mm = /^\s*\d+[.)]\s+(.+)$/.exec(line))) { flushP(); flushQ(); if (!list || list.tag !== 'ol') { flushL(); list = { tag: 'ol', items: [] }; } list.items.push(mm[1]); return; }
      if ((mm = /^\s*>\s?(.*)$/.exec(line))) { flushP(); flushL(); quote.push(mm[1]); return; }
      flushL(); flushQ();
      if (!buf.length && (mm = ALIGN.exec(line))) { cls = ALIGN_CLS[mm[1].toLowerCase()] || ''; line = line.slice(mm[0].length); }
      buf.push(line);
    });
    flushAll();
  });
  return { html: html, used: used };
}
// Ngắt dòng tiêu đề kiểu tiếng Việt: giữ liền các cụm từ (Bảo Việt Nhân Thọ, Bộ Tài chính, trái tim…),
// số với đơn vị, tên người, từ nối với chữ sau, không để một chữ lẻ ở dòng cuối; ưu tiên ngắt sau dấu gạch/phẩy.
// Trả về HTML đã esc, dùng thay esc(title) ở mọi tiêu đề; CSS text-wrap: pretty lấp đầy dòng.
var VN_CUM = ['bảo việt nhân thọ đồng tháp', 'khoảnh khắc', 'tin tức', 'triệu trái tim', 'nhận bằng khen', 'bảo việt nhân thọ', 'bảo việt', 'nhân thọ', 'đồng tháp', 'bộ tài chính', 'tài chính', 'bằng khen', 'tổng công ty', 'công ty',
  'tư vấn viên', 'khách hàng', 'khai trương', 'trụ sở mới', 'trụ sở', 'chương trình', 'tuyển dụng', 'vinh danh', 'vinh dự', 'sự kiện', 'hội nghị',
  'vàng son', 'trái tim', 'chung nhịp', 'phó giám đốc phòng', 'giám đốc phòng', 'phó giám đốc', 'giám đốc', 'hồng ngự', 'cao lãnh', 'sa đéc', 'lập nghiệp', 'thiện nguyện', 'đào tạo',
  'hoạt động', 'kinh doanh', 'xuất sắc', 'mục tiêu', 'đón nhận', 'tri ân', 'thành công', 'sức mạnh', 'đoàn kết', 'đồng lòng', 'văn phòng',
  'khu vực', 'cán bộ', 'nhân viên', 'tân binh', 'sơ kết', 'tổng kết', 'kỷ niệm', 'chúc mừng', 'ra mắt', 'sản phẩm', 'bảo hiểm', 'quyền lợi'];
var VN_NOI = 'và|của|cho|tại|với|các|những|một|từ|về|trong|theo|để|là|anh|chị|ông|bà|lớp|ngày|tháng|năm|quý';
var VN_RE = VN_CUM.sort(function (a, b) { return b.length - a.length; }).map(function (c) { var re = new RegExp('(^|[^\\p{L}])(' + c.replace(/ /g, '\\s') + ')(?![\\p{L}])', 'giu'); re.words = c.split(' ').length; return re; });
function vnGlue(t, lite) {
  // lite: chỉ giữ cụm ngắn (≤ 3 chữ) và số; dùng khi màn hình hẹp không chứa nổi cả cụm dài.
  var NB = ' ', s = String(t || '').replace(/[\s ]+/g, ' ').trim();
  var caps = s === s.toUpperCase();
  VN_RE.forEach(function (re) { if (lite && re.words > 4) return; s = s.replace(re, function (m, a, b) { return a + b.replace(/\s/g, NB); }); });
  s = s.replace(/(\d[\d/.,]*)\s(?=\S)/g, '$1' + NB);
  s = s.replace(/(\S)\s(\d+)(?=[\s,.;]|$)/g, '$1' + NB + '$2');
  if (lite === true) return s;                       // 'fill': bỏ cụm dài nhưng vẫn giữ tên riêng, chữ viết tắt, hư từ
  s = s.replace(new RegExp('(^|\\s)(' + VN_NOI + ')\\s(?=\\S)', 'giu'), '$1$2' + NB);
  if (!caps) s = s.replace(/\p{Lu}\p{Ll}*(?:\s\p{Lu}\p{Ll}*){1,3}/gu, function (m) { return m.replace(/\s/g, NB); });
  if (!caps) s = s.replace(/([^\s,;:–—-])\s(\p{Lu}{2,})(?=\s|$)/gu, '$1' + NB + '$2'); // chữ viết tắt (BOSS, PTKD) đi liền chữ trước, không nối qua dấu câu
  s = s.replace(/\s([–—-])\s/g, NB + '$1 ');
  s = s.replace(/\s(\S+)$/, NB + '$1');
  return s;
}
function vnHeadline(t) { return esc(vnGlue(t)); }
function vnShort(t) { return esc(vnGlue(t, true)); }   // thẻ nhỏ, cột hẹp: chỉ giữ cụm ngắn để không tràn
// Ngắt dòng tối ưu cho tiêu đề lớn (banner, trang bài), cỡ chữ cố định cho đồng bộ:
// đo độ rộng từng cụm ngay trên trang, xét mọi cách chia dòng, chọn cách ít dòng nhất rồi các dòng đều nhau nhất;
// ngắt sau dấu gạch/phẩy/hai chấm được cộng điểm. Cụm dài hơn khung thì tách theo cụm con, rồi mới tới từng chữ.
// Cho phép thu nhỏ tối đa 10% nếu nhờ đó bớt được một dòng; quá số dòng thì giảm cỡ chữ.
function fitMeasurer(el) {
  var probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0';
  el.appendChild(probe);
  var cache = {};
  return { w: function (t) { if (!(t in cache)) { probe.textContent = t; cache[t] = probe.getBoundingClientRect().width; } return cache[t]; },
           done: function () { probe.remove(); } };
}
function fitPlan(el, text, W, maxLines) {
  var M = fitMeasurer(el), sp = M.w('a a') - M.w('aa'), chunks = [], tail = {};
  text.split(' ').forEach(function (c) {
    if (!c) return;
    if (M.w(c) <= W) { chunks.push(c); return; }
    vnGlue(c.replace(/ /g, ' '), true).split(' ').forEach(function (d) {
      if (M.w(d) <= W) chunks.push(d); else d.split(' ').forEach(function (x) { if (x) chunks.push(x); });
    });
    tail[chunks.length - 1] = true;                     // phần đuôi của cụm dài bị tách: nên kết thúc dòng tại đây
  });
  var w = chunks.map(M.w), n = chunks.length, INF = 1e18, best = [], from = [];
  M.done();
  for (var k = 0; k <= maxLines; k++) { best.push(new Array(n + 1).fill(INF)); from.push(new Array(n + 1).fill(-1)); }
  best[0][0] = 0;
  for (k = 1; k <= maxLines; k++) for (var j = 1; j <= n; j++) {
    var len = -sp;
    for (var i = j - 1; i >= 0; i--) {
      len += w[i] + sp;
      if (len > W && j - i > 1) break;
      if (best[k - 1][i] >= INF) continue;
      var slack = Math.max(0, W - len) / W, cost = (j < n ? slack * slack : (len < W * 0.15 ? 0.3 : 0)) + (len > W ? 10 : 0);   // lấp đầy các dòng trên, dòng cuối tự do (chỉ tránh một chữ mồ côi)
      if (j < n && /[,–—:;\-]$/.test(chunks[j - 1])) cost -= 0.12;    // ngắt sau dấu câu: đẹp
      if (j < n && /^[-–—]/.test(chunks[j])) cost += 0.5;              // không để dấu gạch mở đầu dòng
      if (j < n && tail[j - 1]) cost -= 0.15;
      cost *= Math.pow(3, 1 - k);                       // dòng trên nặng ký hơn: lấp đầy dòng 1 trước, rồi dòng 2…
      if (best[k - 1][i] + cost < best[k][j]) { best[k][j] = best[k - 1][i] + cost; from[k][j] = i; }
    }
  }
  for (k = 1; k <= maxLines; k++) if (best[k][n] < INF) {
    var lines = [], jj = n;
    for (var kk = k; kk >= 1; kk--) { var ii = from[kk][jj]; lines.unshift(chunks.slice(ii, jj).join(' ')); jj = ii; }
    return lines;
  }
  return null;
}
function fitBreak(el, maxLines) {
  if (!el || !el.clientWidth) return;
  if (el.dataset.src == null) el.dataset.src = el.textContent;
  el.style.fontSize = ''; el.style.display = 'block'; el.style.webkitLineClamp = 'unset'; el.style.overflow = 'visible';
  el.textContent = '';
  var text = vnGlue(el.dataset.src, 'fill'), W = el.clientWidth - 2, base = parseFloat(getComputedStyle(el).fontSize), size = base, lines = null;
  while (!(lines = fitPlan(el, text, W, maxLines)) && size > 20) { size = Math.max(20, size - 2); el.style.fontSize = size + 'px'; }
  if (lines && lines.length > 1 && size === base) {      // chưa bị thu nhỏ: thử thu 10% để bớt một dòng
    el.style.fontSize = (size * 0.9) + 'px';
    var fewer = fitPlan(el, text, W, lines.length - 1);
    if (fewer) { lines = fewer; size = size * 0.9; } else el.style.fontSize = '';
  }
  if (!lines) { el.style.fontSize = size + 'px'; lines = fitPlan(el, text, W, 8); }   // cỡ nhỏ nhất vẫn quá dài: thêm dòng, vẫn giữ cụm từ
  if (!lines) { el.textContent = el.dataset.src; return; }
  el.innerHTML = lines.map(function (l) { return '<span class="ln">' + esc(l) + '</span>'; }).join('');
}
function fitAll() {
  var narrow = window.innerWidth < 760;
  document.querySelectorAll('.hero h1').forEach(function (h) { fitBreak(h, 4); });
  document.querySelectorAll('.art h1').forEach(function (h) { fitBreak(h, narrow ? 5 : 3); });
}
(function () {
  if (typeof addEventListener !== 'function') return; // chạy trong Node (công cụ tạo trang tĩnh) thì bỏ qua
  var t = 0;
  addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fitAll, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitAll(); });
})();
// Mỗi bài có trang tĩnh riêng <mã-bài>.html (tạo bằng cong-cu/tao-trang-tinh.js) để Google đọc được.
function postHref(id) { return encodeURIComponent(id) + '.html'; }
// Ảnh nhỏ do dong-dau-phien-ban.py tạo cạnh ảnh gốc.
function thumb(id) { var s = blob(id); return /\.jpe?g$/i.test(s) ? s.replace(/\.jpe?g$/i, '-nho.jpg') : s; }
function mucHref(kind) { return 'index.html?muc=' + kind + '#moi-nhat'; }
function unitHref(unit) { return 'index.html?dv=' + unit + '#moi-nhat'; }
var HOME_HREF = 'index.html';
function loadPosts() {
  return (Array.isArray(window.BAI_VIET) ? window.BAI_VIET : []).map(function (d, i) { return clean({ id: /^[A-Za-z0-9_-]{1,80}$/.test(d && d.id) ? d.id : 'bai-' + i, data: d }); });
}
// Album ảnh (du-lieu/album.js, window.ALBUM) do công cụ đồng bộ sinh từ bản nội bộ.
function loadAlbums() {
  return (Array.isArray(window.ALBUM) ? window.ALBUM : []).map(function (a) {
    return { id: String(a.id || ''), name: String(a.name || 'Album').slice(0, 120), pinned: !!a.pinned, createdAt: String(a.createdAt || ''),
      photos: (Array.isArray(a.photos) ? a.photos : []).filter(function (x) { return x && okId(x.src); }).map(function (x) { return { id: x.src, caption: String(x.caption || '').slice(0, 200) }; }) };
  }).filter(function (a) { return a.id && a.photos.length; });
}
function setToday() { var now = new Date(); var el = $('#today'); if (el) el.textContent = WD[now.getDay()] + ', ' + pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear(); }

// ---------- Xem ảnh lớn ----------
var lb = { list: [], i: 0 };
// current: mã bài đang đọc; không hiện link "Đọc bài viết" về chính bài đó.
function openLB(list, i, current) { lb.list = list; lb.i = i; lb.current = current || ''; showLB(); var d = $('#lightbox'); if (!d.open) d.showModal(); }
function showLB() {
  var ph = lb.list[lb.i]; if (!ph) return;
  $('#lb-img').src = blob(ph.id); $('#lb-img').alt = ph.caption || ph.post.title;
  $('#lb-cap').innerHTML = '<div>' + esc(ph.caption || '') + '</div><div class="num" style="opacity:.7">' + (lb.i + 1) + ' / ' + lb.list.length + ' · ' + esc(ph.album || ph.post.title) + '</div>' + (ph.post.id && ph.post.id !== lb.current ? '<a href="' + postHref(ph.post.id) + '">Đọc bài viết</a>' : '');
  $('#lb-prev').hidden = $('#lb-next').hidden = lb.list.length < 2;
}
function stepLB(d) { lb.i = (lb.i + d + lb.list.length) % lb.list.length; showLB(); }

function initLightbox() {
  $('#lb-prev').addEventListener('click', function () { stepLB(-1); });
  $('#lb-next').addEventListener('click', function () { stepLB(1); });
  swipeInit($('#lightbox'), stepLB);
  document.addEventListener('keydown', function (e) { if ($('#lightbox').open && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) stepLB(e.key === 'ArrowLeft' ? -1 : 1); });
  document.addEventListener('click', function (e) { var c = e.target.closest('[data-close]'); if (c) { var d = c.closest('dialog'); if (d) d.close(); } });
  document.querySelectorAll('dialog').forEach(function (d) { d.addEventListener('click', function (e) { if (e.target === d) d.close(); }); });
}

// ---------- Khung xem trước khi rê chuột vào link bài ----------
// Chỉ bật với chuột (máy tính); trên điện thoại chạm vào là chuyển trang luôn.
var Peek = (function () {
  var box = null, timer = 0, cur = null, getPost = null;
  function snippet(p) {
    if (p.excerpt) return { text: p.excerpt };
    var t = stripMarks(p.body).replace(/\s+/g, ' ').trim();
    if (!t) return null;
    // Bài càng dài càng hiện nhiều dòng (2 đến 7), dòng cuối mờ dần.
    var lines = Math.max(2, Math.min(7, Math.round(t.length / 110)));
    return { text: t.slice(0, lines * 95 + 60), lines: lines };
  }
  function build(p) {
    var s = snippet(p);
    return '<span class="pk-img">' + media(p, true) + '</span><span class="pk-b"><span class="pk-k">' + KIND[p.kind] + ' · ' + esc(fmtD(p.date)) + (p.photos.length > 1 ? ' · ' + p.photos.length + ' ảnh' : '') + '</span>' +
      '<b class="pk-t">' + esc(p.title) + '</b>' +
      (s ? '<span class="pk-x' + (s.lines ? ' fade" style="--l:' + s.lines : '') + '">' + esc(s.text) + '</span>' : '') +
      '<span class="pk-go">Bấm để đọc bài →</span></span>';
  }
  function place(el) {
    var r = el.getBoundingClientRect(), w = box.offsetWidth, h = box.offsetHeight, vw = innerWidth, vh = innerHeight, g = 14, x, y;
    if (r.right + g + w <= vw - 8) { x = r.right + g; y = r.top + r.height / 2 - h / 2; }
    else if (r.left - g - w >= 8) { x = r.left - g - w; y = r.top + r.height / 2 - h / 2; }
    else { x = r.left + r.width / 2 - w / 2; y = r.bottom + g + h <= vh - 8 ? r.bottom + g : r.top - g - h; }
    box.style.left = Math.round(Math.max(8, Math.min(vw - w - 8, x))) + 'px';
    box.style.top = Math.round(Math.max(8, Math.min(vh - h - 8, y))) + 'px';
  }
  function show(el) {
    var p = getPost(el.dataset.open); if (!p) return;
    cur = el; box.innerHTML = build(p); box.hidden = false; place(el);
    requestAnimationFrame(function () { if (cur === el) box.classList.add('on'); });
  }
  function hide() { clearTimeout(timer); cur = null; if (box) { box.classList.remove('on'); box.hidden = true; } }
  function init(fn) {
    if (!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
    getPost = fn;
    box = document.createElement('div'); box.className = 'peek'; box.hidden = true; box.setAttribute('aria-hidden', 'true');
    document.body.appendChild(box);
    document.addEventListener('pointerover', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var el = e.target.closest('[data-open]');
      if (!el || el === cur) return;
      clearTimeout(timer); timer = setTimeout(function () { show(el); }, 220);
    });
    document.addEventListener('pointerout', function (e) {
      var el = e.target.closest('[data-open]');
      if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return;
      hide();
    });
    addEventListener('scroll', hide, { passive: true });
    document.addEventListener('pointerdown', hide);
  }
  return { init: init, hide: hide };
})();

// ---------- Giao diện tạp chí: tin chính, thẻ bài, thư viện ảnh, trang bài ----------
// Chỉ dùng thẻ inline (span) bên trong thẻ bài và lưới, để bộ dựng trang tĩnh thay nội dung theo id an toàn.
// Mỗi trang tự định nghĩa postHref(id), mucHref(kind), HOME_HREF và blob(id).
var ICON = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>'
};
var NAV = [['news', 'Tin tức'], ['event', 'Sự kiện'], ['activity', 'Hoạt động'], ['honor', 'Vinh danh']];

// Ảnh poster hiện trọn (không cắt chữ trên poster); phần trống phủ bằng chính ảnh đó làm mờ.
// Ảnh bìa: ảnh được tick “Làm ảnh bìa” khi đăng bài; không tick thì thẻ bài dùng ảnh đầu, trang bài không hiện ảnh to ở đầu.
function coverOf(p) { for (var i = 0; i < p.photos.length; i++) if (p.photos[i].cover) return p.photos[i]; return null; }
// big: tin chính và ảnh bìa trang bài dùng ảnh gốc; thẻ bài dùng ảnh nhỏ.
function photoBox(p, eager, big) {
  var c = coverOf(p) || p.photos[0];
  if (!c) return '<span class="ph">' + art(p) + '</span>';
  var src = esc(big ? blob(c.id) : thumb(c.id)), lazy = eager ? '' : ' loading="lazy"';
  return '<span class="ph"><img class="blur" src="' + src + '" alt="" aria-hidden="true"' + lazy + '><img class="fg" src="' + src + '" alt="' + esc(c.caption || p.title) + '"' + lazy + '></span>';
}
function whenText(p) { return wd(p.date) + ', ' + fmtD(p.date) + (p.time ? ' · ' + p.time + (p.timeEnd ? '–' + p.timeEnd : '') : ''); }
function card(p) {
  var n = daysFrom(p.date), soon = p.kind === 'event' && n >= 0;
  return '<a class="card" href="' + postHref(p.id) + '" data-open="' + esc(p.id) + '">' + photoBox(p) +
    '<span class="kick k-' + p.kind + '">' + KIND[p.kind] + (p.unit ? ' · ' + UNIT[p.unit] : '') + (soon ? ' · ' + (n === 0 ? 'Hôm nay' : n === 1 ? 'Ngày mai' : 'Còn ' + n + ' ngày') : '') + (p.sample ? ' · Mẫu' : '') + '</span>' +
    '<h3>' + vnShort(p.title) + '</h3>' + (snippet(p, 200) ? '<span class="sn">' + esc(snippet(p, 200)) + '</span>' : '') +
    '<span class="meta"><span>' + esc(wd(p.date)) + ', ' + esc(fmtD(p.date)) + '</span>' + (p.photos.length > 1 ? '<span>' + p.photos.length + ' ảnh</span>' : '') + '</span></a>';
}
// Bỏ dòng đầu nội dung nếu nó chỉ nhắc lại tiêu đề (bài Facebook hay mở đầu bằng tiêu đề kèm biểu tượng).
function sameText(a, b) { var f = function (s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ''); }; a = f(a); b = f(b); return !!a && !!b && (a.indexOf(b) === 0 || b.indexOf(a) === 0); }
function snippet(p, n) {
  if (p.excerpt) return p.excerpt;
  var lines = stripMarks(p.body).split('\n').filter(function (l) { return l.trim(); });
  if (lines.length > 1 && sameText(lines[0], p.title)) lines.shift();
  var t = lines.join(' ').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).replace(/\s\S*$/, '') + '…' : t;
}
// Tin chính: sự kiện sắp diễn ra gần nhất, nếu không có thì bài được ghim, rồi tới bài mới nhất.
function pickTop(posts) {
  var t = todayISO();
  var up = posts.filter(function (p) { return p.kind === 'event' && p.date >= t; }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : (a.time < b.time ? -1 : 1); })[0];
  var top = up || posts.filter(function (p) { return p.featured; })[0] || posts[0] || null;
  return { top: top, up: !!up && top === up };
}
function cdHTML(p) {
  var s = Math.max(0, Math.floor((eventStart(p) - Date.now()) / 1000));
  return [[Math.floor(s / 86400), 'ngày'], [Math.floor(s / 3600) % 24, 'giờ'], [Math.floor(s / 60) % 60, 'phút'], [s % 60, 'giây']]
    .map(function (x) { return '<span><b>' + pad(x[0]) + '</b>' + x[1] + '</span>'; }).join('');
}
function heroHTML(top, isUp) {
  if (!top) return '';
  var info = '<span>' + esc(whenText(top)) + '</span>' + (top.place ? '<span>' + esc(top.place.replace(/\.$/, '')) + '</span>' : '');
  return '<div class="wrap">' +
    '<a class="hero-pic" href="' + postHref(top.id) + '" tabindex="-1" aria-hidden="true">' + photoBox(top, true, true) + '</a>' +
    '<div class="hero-txt"><span class="kick k-' + top.kind + '">' + (isUp ? 'Sắp diễn ra' : KIND[top.kind]) + '</span>' +
    '<h1>' + vnHeadline(top.title) + '</h1>' +
    '<p class="lead">' + esc(snippet(top, 260)) + '</p>' +
    '<p class="meta stack">' + info + '</p>' +
    (isUp ? '<p class="cd" id="cd" aria-label="Thời gian còn lại đến sự kiện">' + cdHTML(top) + '</p>' : '') +
    '<a class="go" href="' + postHref(top.id) + '">Đọc bài ' + ICON.arrow + '</a></div></div>';
}
function allPhotos(posts) {
  var list = [];
  posts.forEach(function (p) { p.photos.forEach(function (ph) { list.push({ id: ph.id, caption: ph.caption, post: p }); }); });
  return list;
}
// Lưới ảnh: ảnh đầu lớn, số ảnh chọn sao cho các hàng luôn đầy (5, 9, 13…).
function galCount(n, limit) { var k = Math.min(n, limit); return k < 5 ? k : k - ((k - 5) % 4); }
function galHTML(photos, limit) {
  return photos.slice(0, galCount(photos.length, limit)).map(function (ph, i) {
    return '<button type="button" data-ph="' + i + '" aria-label="Xem ảnh ' + (i + 1) + '"><img src="' + esc(i === 0 ? blob(ph.id) : thumb(ph.id)) + '" alt="' + esc(ph.caption || ph.post.title) + '" loading="lazy"></button>';
  }).join('');
}
// Trang bài: tiêu đề rộng, cột chữ hẹp dễ đọc, ảnh bìa, lưới ảnh còn lại, bài khác. tools: nút riêng của bản nội bộ (sửa, xoá).
function postHTML(p, posts, tools) {
  var rb = renderBody(p, p.photos), rest = [], c = coverOf(p), ci = p.photos.indexOf(c);
  // Ảnh bìa đã hiện to ở đầu bài thì bỏ chỗ chèn trùng ảnh đó trong nội dung.
  if (ci >= 0 && rb.used[ci]) rb.html = rb.html.replace(new RegExp('<figure class="inl"><button type="button" data-aphoto="' + ci + '"[\\s\\S]*?</figure>'), '');
  for (var i = 0; i < p.photos.length; i++) if (!rb.used[i] && i !== ci) rest.push(i);
  var info = '<span>' + esc(whenText(p)) + '</span>' + (p.place ? '<span>' + esc(p.place.replace(/\.$/, '')) + '</span>' : '') + (p.photos.length > 1 ? '<span>' + p.photos.length + ' ảnh</span>' : '');
  var others = posts.filter(function (x) { return x.id !== p.id; });
  var rel = others.filter(function (x) { return x.kind === p.kind; }).concat(others.filter(function (x) { return x.kind !== p.kind; })).slice(0, 3);
  return '<article>' +
    '<header class="art"><nav class="crumb" aria-label="Vị trí"><a href="' + HOME_HREF + '">Trang chủ</a><span aria-hidden="true">/</span><a class="kick k-' + p.kind + '" href="' + mucHref(p.kind) + '">' + KIND[p.kind] + '</a>' + (p.unit ? '<span aria-hidden="true">/</span><a class="kick unit" href="' + unitHref(p.unit) + '">' + UNIT[p.unit] + '</a>' : '') + (p.sample ? '<span class="kick">Bài mẫu</span>' : '') + '</nav>' +
    '<h1' + (p.title.length > 56 ? ' class="long"' : '') + '>' + vnHeadline(p.title) + '</h1>' +
    (p.excerpt ? '<p class="lead">' + esc(p.excerpt) + '</p>' : '') +
    '<p class="meta">' + info + '</p></header>' +
    (c ? '<figure class="cover"><button type="button" data-aphoto="' + ci + '" aria-label="Xem ảnh lớn">' + photoBox(p, true, true) + '</button>' + (c.caption ? '<figcaption>' + esc(c.caption) + '</figcaption>' : '') + '</figure>' : '') +
    (rb.html ? '<div class="prose">' + rb.html + '</div>' : '') +
    (rest.length ? '<section class="photos" aria-label="Hình ảnh"><h2>Hình ảnh</h2><p class="gal">' + rest.map(function (k) {
      return '<button type="button" data-aphoto="' + k + '" aria-label="Xem ảnh ' + (k + 1) + '"><img src="' + esc(thumb(p.photos[k].id)) + '" alt="' + esc(p.photos[k].caption || p.title) + '" loading="lazy"></button>';
    }).join('') + '</p></section>' : '') +
    '<p class="share"><span class="share-l">Chia sẻ</span>' + shareHTML() + (tools || '') + '</p>' +
    '</article>' +
    (rel.length ? '<section class="sec related" aria-labelledby="h-rel"><div class="wrap"><div class="sec-h"><h2 id="h-rel">Bài khác</h2><a class="more" href="' + HOME_HREF + '">Xem tất cả ' + ICON.arrow + '</a></div><div class="grid">' + rel.map(card).join('') + '</div></div></section>' : '');
}
function themeInit() {
  var root = document.documentElement, saved = null;
  try { saved = localStorage.getItem('bt-theme'); } catch (e) {}
  if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  $('#b-theme').addEventListener('click', function () {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('bt-theme', root.dataset.theme); } catch (e) {}
  });
}
// Zalo: điện thoại mở bảng chia sẻ của máy (có Zalo, Messenger…); máy tính không có bảng này thì chép link để dán vào Zalo.
function shareZalo(btn) {
  var label = btn.querySelector('span'), url = SHARE_URL(), title = document.title;
  if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
  var done = function () { label.textContent = 'Đã chép link, dán vào Zalo'; setTimeout(function () { label.textContent = 'Zalo'; }, 2400); };
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () {}); else done();
}
// Nút lên đầu trang: hiện khi đã cuộn xuống xa.
function toTopInit() {
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'to-top'; b.hidden = true; b.setAttribute('aria-label', 'Lên đầu trang');
  b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(b);
  addEventListener('scroll', function () { b.hidden = window.scrollY < 900; }, { passive: true });
}
// Vuốt trái/phải trên ảnh phóng to để chuyển ảnh (điện thoại).
function swipeInit(el, step) {
  var x = null, y = 0;
  el.addEventListener('touchstart', function (e) { x = e.touches[0].clientX; y = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchend', function (e) {
    if (x == null) return;
    var dx = e.changedTouches[0].clientX - x, dy = e.changedTouches[0].clientY - y; x = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1);
  });
}
// ---------- Album ảnh trong Khoảnh khắc: album ghim đứng trước, rồi tới album mới tạo ----------
var PIN_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.6 2.6l5.8 5.8-2.1.7-3.6 3.6.7 4.9-1.9 1.9-3.9-3.9-5.3 5.3-1.2-1.2 5.3-5.3-3.9-3.9 1.9-1.9 4.9.7 3.6-3.6z"/></svg>';
function sortAlbums(list) { return list.slice().sort(function (a, b) { return (b.pinned - a.pinned) || (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0); }); }
function defaultAlbum(albums) { var p = sortAlbums(albums).filter(function (a) { return a.pinned; })[0]; return p ? p.id : ''; }
// Ảnh lấy từ bài thì vẫn dẫn được về bài đó khi xem ảnh lớn.
function albumPhotos(al, posts) {
  var by = {};
  posts.forEach(function (p) { p.photos.forEach(function (ph) { by[ph.id] = p; }); });
  return al.photos.map(function (ph) { return { id: ph.id, caption: ph.caption, post: by[ph.id] || { id: '', title: al.name }, album: al.name }; });
}
function albumChipsHTML(albums, cur) {
  return '<button class="chip" type="button" data-album="" aria-pressed="' + !cur + '">Tất cả ảnh</button>' + sortAlbums(albums).map(function (a) {
    return '<button class="chip" type="button" data-album="' + esc(a.id) + '" aria-pressed="' + (cur === a.id) + '"' + (a.pinned ? ' title="Album được ghim"' : '') + '>' + (a.pinned ? PIN_ICON : '') + esc(a.name) + '<span class="n">' + a.photos.length + '</span></button>';
  }).join('');
}
var ZALO_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="20" height="18" rx="5" fill="#0068ff"/><text x="12" y="15.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="7.5" font-weight="700" fill="#fff">Zalo</text></svg>';
var FB_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#1877f2"/><path d="M13.4 21v-6.6h2.2l.3-2.6h-2.5v-1.6c0-.7.2-1.3 1.3-1.3h1.3V6.6a17 17 0 0 0-2-.1c-2 0-3.3 1.2-3.3 3.4v1.9H8.5v2.6h2.2V21z" fill="#fff"/></svg>';
function SHARE_URL() { return location.href.split('#')[0]; }
function shareHTML() {
  return '<button class="pill" type="button" data-act="zalo">' + ZALO_ICON + '<span>Zalo</span></button>' +
    '<a class="pill" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(SHARE_URL()) + '" target="_blank" rel="noopener">' + FB_ICON + '<span>Facebook</span></a>';
}

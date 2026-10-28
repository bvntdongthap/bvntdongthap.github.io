// Hàm dùng chung cho trang chủ (index.html) và trang bài viết (bai.html).
// Dữ liệu bài nằm ở du-lieu/bai-viet.js (window.BAI_VIET), nạp trước file này.
'use strict';
var KIND = { news: 'Tin tức', event: 'Sự kiện', activity: 'Hoạt động', honor: 'Vinh danh' };
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
  var photos = Array.isArray(d.photos) ? d.photos.filter(function (x) { return x && okId(x.src); }).slice(0, 200).map(function (x) { return { id: x.src, caption: String(x.caption || '').slice(0, 200) }; }) : [];
  return { id: p.id, kind: kind, title: String(d.title || 'Chưa có tiêu đề').slice(0, 200), excerpt: String(d.excerpt || '').slice(0, 400), body: String(d.body || '').slice(0, 20000),
    date: parseD(d.date) ? d.date : todayISO(), time: /^\d{2}:\d{2}$/.test(d.time) ? d.time : '', timeEnd: /^\d{2}:\d{2}$/.test(d.timeEnd) ? d.timeEnd : '',
    place: String(d.place || '').slice(0, 200), photos: photos, featured: !!d.featured, sample: !!d.sample, createdAt: String(d.createdAt || '') };
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
function media(p, eager) { var c = p.photos[0]; return c ? '<img src="' + blob(c.id) + '" alt="' + esc(c.caption || p.title) + '"' + (eager ? '' : ' loading="lazy"') + '>' : art(p); }
function byDateDesc(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : (a.createdAt < b.createdAt ? 1 : -1); }
function eventStart(p) { var d = parseD(p.date); if (!d) return null; var t = (p.time || '07:30').split(':'); d.setHours(+t[0], +t[1]); return d; }
function cardHTML(p) {
  var fresh = daysFrom(p.date) >= -7 && daysFrom(p.date) <= 0, isUp = p.kind === 'event' && daysFrom(p.date) >= 0;
  var ribbon = p.sample ? '<span class="ribbon gold">Mẫu</span>' : isUp ? '<span class="ribbon">Sắp tới</span>' : fresh ? '<span class="ribbon">Mới</span>' : '';
  var facts = p.kind === 'event'
    ? '<span>' + icon('clock') + esc(p.time ? p.time + (p.timeEnd ? '–' + p.timeEnd : '') : wd(p.date)) + '</span>' + (p.place ? '<span>' + icon('pin') + esc(p.place) + '</span>' : '')
    : '<span>' + icon('cal') + esc(wd(p.date)) + '</span>' + (p.photos.length ? '<span>' + icon('img') + p.photos.length + ' ảnh</span>' : '') + (p.excerpt ? '' : '');
  var when = p.kind === 'event' && daysFrom(p.date) >= 0 ? '<em>' + (daysFrom(p.date) === 0 ? 'Hôm nay' : 'Còn ' + daysFrom(p.date) + ' ngày') + '</em>' + esc(fmtD(p.date)) : esc(fmtD(p.date));
  return '<a href="' + postHref(p.id) + '" class="pcard" data-open="' + esc(p.id) + '"><span class="lab k-' + p.kind + '">' + KIND[p.kind] + '</span>' +
    '<span class="pic">' + ribbon + media(p) + '<h3>' + esc(p.title) + '</h3></span>' +
    '<span class="facts">' + facts + '</span>' +
    '<span class="pfoot"><span class="when">' + when + '</span><span class="detail">Xem chi tiết</span></span></a>';
}
function itemHTML(p) {
  return '<a href="' + postHref(p.id) + '" class="item" data-open="' + esc(p.id) + '"><span class="th">' + media(p) + '</span><span><b>' + esc(p.title) + '</b><small>' + esc(fmtD(p.date)) + (p.sample ? ' · <span class="t-sample">Mẫu</span>' : '') + '</small>' + (p.excerpt ? '<p>' + esc(p.excerpt) + '</p>' : '') + '</span></a>';
}

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
function eviHTML(p) {
  var d = parseD(p.date), n = daysFrom(p.date);
  return '<a href="' + postHref(p.id) + '" class="evi" data-open="' + esc(p.id) + '"><span class="d"><b>' + pad(d.getDate()) + '</b><span>Th ' + (d.getMonth() + 1) + '</span></span><span><strong>' + esc(p.title) + '</strong><small>' + esc(wd(p.date)) + (p.time ? ' · ' + esc(p.time) : '') + ' · <span class="left">' + (n === 0 ? 'Hôm nay' : n === 1 ? 'Ngày mai' : 'Còn ' + n + ' ngày') + '</span></small></span></a>';
}
// Mỗi bài có trang tĩnh riêng <mã-bài>.html (tạo bằng cong-cu/tao-trang-tinh.js) để Google đọc được.
function postHref(id) { return encodeURIComponent(id) + '.html'; }
function loadPosts() {
  return (Array.isArray(window.BAI_VIET) ? window.BAI_VIET : []).map(function (d, i) { return clean({ id: /^[A-Za-z0-9_-]{1,80}$/.test(d && d.id) ? d.id : 'bai-' + i, data: d }); });
}
function setToday() { var now = new Date(); var el = $('#today'); if (el) el.textContent = WD[now.getDay()] + ', ' + pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear(); }

// ---------- Xem ảnh lớn ----------
var lb = { list: [], i: 0 };
// current: mã bài đang đọc; không hiện link "Đọc bài viết" về chính bài đó.
function openLB(list, i, current) { lb.list = list; lb.i = i; lb.current = current || ''; showLB(); var d = $('#lightbox'); if (!d.open) d.showModal(); }
function showLB() {
  var ph = lb.list[lb.i]; if (!ph) return;
  $('#lb-img').src = blob(ph.id); $('#lb-img').alt = ph.caption || ph.post.title;
  $('#lb-cap').innerHTML = '<div>' + esc(ph.caption || '') + '</div><div class="num" style="opacity:.7">' + (lb.i + 1) + ' / ' + lb.list.length + ' · ' + esc(ph.post.title) + '</div>' + (ph.post.id !== lb.current ? '<a href="' + postHref(ph.post.id) + '">Đọc bài viết</a>' : '');
  $('#lb-prev').hidden = $('#lb-next').hidden = lb.list.length < 2;
}
function stepLB(d) { lb.i = (lb.i + d + lb.list.length) % lb.list.length; showLB(); }

function initLightbox() {
  $('#lb-prev').addEventListener('click', function () { stepLB(-1); });
  $('#lb-next').addEventListener('click', function () { stepLB(1); });
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

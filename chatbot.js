// Chatbot nhận yêu cầu: hỏi theo kịch bản (nhu cầu, khu vực, họ tên, điện thoại, giờ liên hệ, lời nhắn),
// người xem đồng ý rồi mới gửi về Google Sheet của đơn vị qua Apps Script. Không dùng AI, không tự tư vấn.
// Cần chung.js nạp trước (UNITS, UNIT_INFO, esc). Chưa có CHATBOT_URL thì không hiện nút.
'use strict';
var CHATBOT_URL = 'https://script.google.com/macros/s/AKfycbwRPXx8eoD6voAr-RbwRfa5S_uwVrDUxVCXAEd0TmoRFtscUgXFKeTNYDoojAMQF8jb6A/exec';   // Apps Script trong Sheet "Bản tin BVNT Đồng Tháp – Yêu cầu từ chatbot"
var CHATBOT_HOTLINE = '0277 3854 142';

(function () {
  if (!CHATBOT_URL || typeof document === 'undefined') return;
  var NEEDS = ['Tư vấn bảo hiểm', 'Ứng tuyển tư vấn viên / quản lý', 'Hỗ trợ hợp đồng', 'Khác'];
  var TIMES = ['Buổi sáng', 'Buổi chiều', 'Lúc nào cũng được'];
  var I = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
    tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    again: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    go: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };
  var tel = 'tel:' + CHATBOT_HOTLINE.replace(/\D/g, '');
  // Bé Sen – linh vật của chatbot: búp sen hồng có khuôn mặt, chớp mắt, lắc cánh, vẫy tay, nhún nhảy.
  var senN = 0;
  function sen(cls) {
    var k = 'sen' + (++senN);
    return '<svg class="sen ' + (cls || '') + '" viewBox="0 0 120 120" aria-hidden="true"><defs>' +
      '<linearGradient id="' + k + 'p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd0e1"/><stop offset=".55" stop-color="#ff8db4"/><stop offset="1" stop-color="#e2558a"/></linearGradient>' +
      '<radialGradient id="' + k + 'f" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#ffe6d2"/></radialGradient></defs>' +
      '<ellipse class="sen-shadow" cx="60" cy="113" rx="28" ry="3.6"/>' +
      '<g class="sen-body">' +
        '<g class="sen-petals">' +
          '<path class="sen-p sen-p3" d="M60 74C36 72 18 52 19 34c17 5 33 21 41 40z" fill="url(#' + k + 'p)"/>' +
          '<path class="sen-p sen-p4" d="M60 74c24-2 42-22 41-40-17 5-33 21-41 40z" fill="url(#' + k + 'p)"/>' +
          '<path class="sen-p sen-p1" d="M60 70C40 60 33 31 45 15c11 13 17 34 15 55z" fill="url(#' + k + 'p)"/>' +
          '<path class="sen-p sen-p2" d="M60 70c20-10 27-39 15-55-11 13-17 34-15 55z" fill="url(#' + k + 'p)"/>' +
          '<path class="sen-p sen-p5" d="M60 66c-8-17-7-44 0-58 7 14 8 41 0 58z" fill="#ffa8c8"/>' +
        '</g>' +
        '<ellipse cx="60" cy="98" rx="37" ry="10.5" fill="#2f7a48"/>' +
        '<path d="M60 98L60 88.5" stroke="#2f7a48" stroke-width="3"/>' +
        '<ellipse cx="60" cy="96" rx="33" ry="8" fill="#4f9f63"/>' +
        '<path d="M34 96.5q26 6 52 0" fill="none" stroke="#8fd19e" stroke-width="2" stroke-linecap="round" opacity=".8"/>' +
        '<path class="sen-arm-l" d="M37 82c-9 3-15-2-14-8 7-1 12 2 14 8z" fill="#5fae73"/>' +
        '<path class="sen-arm-r" d="M83 82c9 3 15-2 14-8-7-1-12 2-14 8z" fill="#5fae73"/>' +
        '<circle cx="60" cy="71" r="24" fill="url(#' + k + 'f)" stroke="#f4cdb0" stroke-width="1.4"/>' +
        '<circle cx="60" cy="47.5" r="3.2" fill="#f2c14e"/>' +
        '<g class="sen-eyes"><ellipse cx="51" cy="69" rx="3.5" ry="4.4" fill="#3b2a2c"/><ellipse cx="69" cy="69" rx="3.5" ry="4.4" fill="#3b2a2c"/>' +
          '<circle cx="52.4" cy="67.2" r="1.3" fill="#fff"/><circle cx="70.4" cy="67.2" r="1.3" fill="#fff"/></g>' +
        '<ellipse cx="44.5" cy="77" rx="4.6" ry="2.7" fill="#ff8fb0" opacity=".55"/><ellipse cx="75.5" cy="77" rx="4.6" ry="2.7" fill="#ff8fb0" opacity=".55"/>' +
        '<path class="sen-mouth" d="M55 78q5 5.5 10 0" fill="none" stroke="#c4456f" stroke-width="2.3" stroke-linecap="round"/>' +
      '</g>' +
      '<g class="sen-spark"><path d="M101 21l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path class="sen-s2" d="M17 25l1.5 3.6 3.6 1.4-3.6 1.4-1.5 3.6-1.4-3.6-3.6-1.4 3.6-1.4z"/></g>' +
      '</svg>';
  }

  var fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'cb-fab'; fab.setAttribute('aria-label', 'Trò chuyện với Sen BVL DTH');
  fab.innerHTML = sen();
  var box = document.createElement('section');
  box.className = 'cb'; box.hidden = true; box.setAttribute('aria-label', 'Trò chuyện với Sen BVL DTH – trợ lý Bảo Việt Nhân Thọ Đồng Tháp');
  box.innerHTML = '<header class="cb-head"><span class="cb-ava" aria-hidden="true">' + sen('cb-head-sen') + '</span><span class="cb-who"><b>Sen BVL DTH</b><small>Trợ lý Bảo Việt Nhân Thọ Đồng Tháp</small></span>' +
    '<a class="cb-hb" href="' + tel + '" title="Gọi ' + CHATBOT_HOTLINE + '" aria-label="Gọi ' + CHATBOT_HOTLINE + '">' + I.tel + '</a>' +
    '<button class="cb-hb" type="button" data-cb="again" title="Bắt đầu lại" aria-label="Bắt đầu lại">' + I.again + '</button>' +
    '<button class="cb-hb" type="button" data-cb="close" title="Thu nhỏ" aria-label="Thu nhỏ">' + I.x + '</button></header>' +
    '<div class="cb-log" aria-live="polite"></div><div class="cb-quick"></div>' +
    '<form class="cb-input" autocomplete="off"><input type="text" disabled aria-label="Nhập câu trả lời" placeholder="Chọn một mục ở trên…">' +
    '<input type="text" name="website" class="cb-trap" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<button type="submit" disabled aria-label="Gửi">' + I.go + '</button></form>' +
    '<p class="cb-foot">Thông tin chỉ dùng để Bảo Việt Nhân Thọ Đồng Tháp liên hệ hỗ trợ anh/chị.</p>';
  document.body.appendChild(fab); document.body.appendChild(box);
  document.body.classList.add('has-cb');
  var log = box.querySelector('.cb-log'), qk = box.querySelector('.cb-quick'), form = box.querySelector('.cb-input'),
    inp = form.querySelector('input'), trap = form.querySelector('.cb-trap'), go = form.querySelector('button');
  var data = {}, step = null;

  function down() { log.scrollTop = log.scrollHeight; }
  function add(html, cls) { var d = document.createElement('div'); d.className = cls; d.innerHTML = html; log.appendChild(d); down(); return d; }
  // Sen "gõ" một chút rồi trả lời; tin nhắn của Sen đi kèm khuôn mặt bé Sen, miệng cử động khi đang gõ.
  var headSen = null;
  function say(lines, then) {
    var row = add('<span class="cb-face">' + sen('sen-talk') + '</span><span class="cb-col"><span class="cb-typing"><i></i><i></i><i></i></span></span>', 'cb-row');
    var col = row.querySelector('.cb-col');
    headSen = headSen || box.querySelector('.cb-head-sen'); headSen.classList.add('sen-talk');
    setTimeout(function () {
      col.innerHTML = ''; row.querySelector('.sen').classList.remove('sen-talk'); headSen.classList.remove('sen-talk');
      [].concat(lines).forEach(function (l) {
        var d = document.createElement('div');
        if (typeof l === 'string') { d.className = 'cb-msg cb-bot'; d.innerHTML = l; col.appendChild(d); }
        else { d.className = 'cb-card'; d.innerHTML = l.html; log.appendChild(d); }
      });
      if (!col.children.length) row.remove();   // chỉ có thẻ thông tin: bỏ khuôn mặt trống
      down(); if (then) then();
    }, 700);
  }
  function me(t) { add(esc(t), 'cb-msg cb-me'); }
  function quick(opts, onPick) {
    qk.innerHTML = opts.map(function (o, i) { return '<button type="button" data-i="' + i + '">' + esc(o) + '</button>'; }).join('');
    qk.onclick = function (e) { var b = e.target.closest('[data-i]'); if (!b) return; qk.innerHTML = ''; me(opts[+b.dataset.i]); onPick(+b.dataset.i, opts[+b.dataset.i]); };
  }
  function ask(ph, type, fn) { inp.disabled = go.disabled = false; inp.type = type || 'text'; inp.placeholder = ph; inp.value = ''; inp.focus(); step = fn; }
  function lock() { inp.disabled = go.disabled = true; inp.placeholder = 'Chọn một mục ở trên…'; step = null; }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (!step) return;
    var v = inp.value.trim(), fn = step, err = fn.check ? fn.check(v) : (v ? '' : 'Anh/chị nhập giúp em nhé.');
    me(v || '…'); if (err) return say(err);
    lock(); fn(v);
  });

  function start() {
    data = {}; log.innerHTML = ''; qk.innerHTML = ''; lock();
    say(['Xin chào anh/chị! Em là <b>Sen</b> – trợ lý nhỏ của Bảo Việt Nhân Thọ Đồng Tháp.', 'Anh/chị cần Sen hỗ trợ việc gì ạ?'], function () {
      quick(NEEDS, function (i, v) { data.need = v; askUnit(); });
    });
  }
  function askUnit() {
    say('Anh/chị ở gần khu vực nào để em chuyển cho văn phòng gần nhất ạ?', function () {
      quick(UNITS.map(function (u) { return u[1]; }).concat(['Chưa rõ']), function (i, v) {
        var u = UNITS[i]; data.unit = v;
        if (!u) return askName();
        var f = UNIT_INFO[u[0]];
        say([{ html: '<h4>' + esc(u[1]) + '</h4><dl><dt>Địa bàn</dt><dd>' + esc(f.area) + '</dd><dt>Địa chỉ</dt><dd>' + esc(f.addr) + '</dd>' +
          (f.phone ? '<dt>Điện thoại</dt><dd><a href="tel:' + f.phone.replace(/\D/g, '') + '">' + esc(f.phone) + '</a></dd>' : '') + '<dt>Giờ làm việc</dt><dd>' + esc(f.hours) + '</dd></dl>' +
          '<p><a href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(f.addr) + '" target="_blank" rel="noopener">Chỉ đường đến văn phòng →</a></p>' }], askName);
      });
    });
  }
  function askName() {
    say('Anh/chị cho em xin họ tên để tiện xưng hô ạ?', function () {
      var f = function (v) { data.name = v; askPhone(); };
      f.check = function (v) { return v.length >= 2 ? '' : 'Anh/chị nhập giúp em họ tên nhé.'; };
      ask('Ví dụ: Nguyễn Văn An', 'text', f);
    });
  }
  function askPhone() {
    say('Cảm ơn ' + esc(data.name.split(/\s+/).pop()) + '. Số điện thoại để tư vấn viên gọi lại là số nào ạ?', function () {
      var f = function (v) { data.phone = v; askTime(); };
      f.check = function (v) { return /^(0|\+?84)\d{9}$/.test(v.replace(/[\s.\-]/g, '')) ? '' : 'Số điện thoại chưa đúng, anh/chị kiểm tra lại giúp em (10 số, ví dụ 0912 345 678).'; };
      ask('Ví dụ: 0912 345 678', 'tel', f);
    });
  }
  function askTime() {
    say('Anh/chị tiện nghe máy vào lúc nào ạ?', function () { quick(TIMES, function (i, v) { data.time = v; askNote(); }); });
  }
  function askNote() {
    say('Anh/chị có muốn nhắn thêm gì không ạ? (có thể bỏ qua)', function () {
      quick(['Bỏ qua'], function () { data.note = ''; lock(); summary(); });
      var f = function (v) { qk.innerHTML = ''; data.note = v; summary(); };
      f.check = function () { return ''; };
      ask('Ví dụ: muốn tìm hiểu bảo hiểm cho con', 'text', f);
    });
  }
  function summary() {
    lock();
    var rows = [['Nhu cầu', data.need], ['Khu vực', data.unit], ['Họ tên', data.name], ['Điện thoại', data.phone], ['Liên hệ', data.time]].concat(data.note ? [['Lời nhắn', data.note]] : []);
    say(['Em xin xác nhận lại thông tin:', { html: '<dl>' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' +
      '<label class="cb-consent"><input type="checkbox"> Tôi đồng ý để Bảo Việt Nhân Thọ Đồng Tháp lưu và sử dụng thông tin trên để liên hệ hỗ trợ, theo quy định về bảo vệ dữ liệu cá nhân.</label>' +
      '<button class="cb-send" type="button" disabled>Gửi yêu cầu</button>' }], function () {
      var cards = log.querySelectorAll('.cb-card'), card = cards[cards.length - 1], agree = card.querySelector('input'), send = card.querySelector('.cb-send');
      agree.addEventListener('change', function () { send.disabled = !agree.checked; });
      send.addEventListener('click', function () { submit(send, agree); });
    });
  }
  function submit(send, agree) {
    send.disabled = true; agree.disabled = true; send.textContent = 'Đang gửi…';
    var payload = { need: data.need, unit: data.unit, name: data.name, phone: data.phone, time: data.time, note: data.note || '', agree: true, page: location.pathname, website: trap.value };
    var fail = function (code) {
      send.textContent = 'Gửi lại'; send.disabled = false;
      say(code === 'limit' ? 'Số điện thoại này đã gửi nhiều lần trong giờ qua. Anh/chị vui lòng gọi ' + CHATBOT_HOTLINE + ' để được hỗ trợ ngay ạ.'
        : 'Em chưa gửi được yêu cầu, anh/chị bấm "Gửi lại" hoặc gọi ' + CHATBOT_HOTLINE + ' giúp em ạ.');
    };
    // Gửi dạng text/plain để trình duyệt không cần hỏi trước (Apps Script nhận được và trả JSON).
    fetch(CHATBOT_URL, { method: 'POST', body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) return fail(j && j.error);
        send.textContent = 'Đã gửi';
        say(['Em đã nhận yêu cầu của anh/chị. Tư vấn viên ' + (data.unit !== 'Chưa rõ' ? 'của ' + esc(data.unit) + ' ' : '') + 'sẽ gọi lại trong giờ làm việc.', 'Cảm ơn anh/chị đã quan tâm Bảo Việt Nhân Thọ Đồng Tháp!'],
          function () { quick(['Gửi yêu cầu khác'], start); });
      })
      .catch(function () { fail(); });
  }

  // Lời chào nhỏ cạnh bé Sen sau vài giây (mỗi phiên xem chỉ hiện một lần).
  var hi = null, seen = false;
  try { seen = sessionStorage.getItem('cb-hi') === '1'; } catch (e) {}
  if (!seen) setTimeout(function () {
    if (!box.hidden) return;
    hi = document.createElement('div'); hi.className = 'cb-hi';
    hi.innerHTML = '<button type="button" aria-label="Đóng lời chào">×</button>Chào anh/chị! Em là <b>Sen BVL DTH</b>. Cần tư vấn hay ứng tuyển, cứ hỏi Sen nha!';
    document.body.appendChild(hi);
    hi.addEventListener('click', function (e) { closeHi(); if (!e.target.closest('button')) fab.click(); });
  }, 3500);
  function closeHi() { if (hi) { hi.remove(); hi = null; } try { sessionStorage.setItem('cb-hi', '1'); } catch (e) {} }
  fab.addEventListener('click', function () { closeHi(); box.hidden = false; fab.hidden = true; if (!log.children.length) start(); });
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cb]'); if (!b) return;
    if (b.dataset.cb === 'close') { box.hidden = true; fab.hidden = false; } else start();
  });
})();

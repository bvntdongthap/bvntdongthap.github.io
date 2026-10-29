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

  var fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'cb-fab'; fab.setAttribute('aria-label', 'Mở khung hỗ trợ');
  fab.innerHTML = '<span class="cb-dot" aria-hidden="true"></span>' + I.chat + '<span>Cần hỗ trợ?</span>';
  var box = document.createElement('section');
  box.className = 'cb'; box.hidden = true; box.setAttribute('aria-label', 'Khung hỗ trợ Bảo Việt Nhân Thọ Đồng Tháp');
  box.innerHTML = '<header class="cb-head"><span class="cb-ava" aria-hidden="true">BV</span><span class="cb-who"><b>Bảo Việt Nhân Thọ Đồng Tháp</b><small>Phản hồi trong giờ làm việc</small></span>' +
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
  function say(lines, then) {
    var t = add('<i></i><i></i><i></i>', 'cb-typing');
    setTimeout(function () { t.remove(); [].concat(lines).forEach(function (l) { typeof l === 'string' ? add(l, 'cb-msg cb-bot') : add(l.html, 'cb-card'); }); if (then) then(); }, 600);
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
    say(['Xin chào anh/chị! Em là trợ lý của Bảo Việt Nhân Thọ Đồng Tháp.', 'Anh/chị cần hỗ trợ việc gì ạ?'], function () {
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

  fab.addEventListener('click', function () { box.hidden = false; fab.hidden = true; if (!log.children.length) start(); });
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cb]'); if (!b) return;
    if (b.dataset.cb === 'close') { box.hidden = true; fab.hidden = false; } else start();
  });
})();

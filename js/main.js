(function () {
  'use strict';

  // ---- Site settings: edit these ----
  var CONFIG = {
    // Paste your Calendly event link (e.g. 'https://calendly.com/your-name/30min').
    // While empty, the built-in email request form below is used instead.
    calendlyUrl: 'https://calendly.com/chrisenussbaum/lets-chat',
    email: 'chrisenussbaum@gmail.com',
    timezone: 'America/Los_Angeles',
    daysAhead: 21,                 // how far ahead people can book
    workDays: [1, 2, 3, 4, 5],     // 0 = Sun ... 6 = Sat
    slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'], // start times, PT
    callMinutes: 30,
    minLeadHours: 24               // earliest bookable time from now
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var pad = function (n) { return String(n).padStart(2, '0'); };

  // ---- Nav ----
  var toggle = $('.nav__toggle'), menu = $('#menu');
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  });
  $('#year').textContent = new Date().getFullYear();

  // ---- Reveal on scroll ----
  var revealEls = document.querySelectorAll('.card, .steps li, .job, .project, .sample, .more, .facts li, .contact__card');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  // ---- "Book this" buttons preselect the service ----
  var serviceSelect = $('#serviceSelect');
  document.querySelectorAll('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.getAttribute('data-service');
      Array.prototype.forEach.call(serviceSelect.options, function (o) { if (o.text === v) serviceSelect.value = o.value || o.text; });
    });
  });

  // ---- Booking ----
  // Slots are computed in Pacific Time by converting a PT wall-clock time to a UTC instant.
  function ptOffsetMinutes(utcMs) {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: CONFIG.timezone, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(new Date(utcMs)).reduce(function (a, p) { a[p.type] = p.value; return a; }, {});
    var asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    return (asUtc - utcMs) / 60000;
  }
  function ptToUtcMs(y, m, d, hh, mm) {
    var guess = Date.UTC(y, m, d, hh, mm);
    var off = ptOffsetMinutes(guess);
    var ms = guess - off * 60000;
    // re-check near DST changes
    var off2 = ptOffsetMinutes(ms);
    return off2 === off ? ms : guess - off2 * 60000;
  }

  var datesEl = $('#dates'), timesEl = $('#times'), hint = $('#timeHint');
  var state = { date: null, time: null };

  function ptParts(d) {
    var p = new Intl.DateTimeFormat('en-US', { timeZone: CONFIG.timezone, year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(d).reduce(function (a, x) { a[x.type] = +x.value; return a; }, {});
    return p;
  }

  function buildDates() {
    var now = new Date();
    var base = ptParts(now);
    var earliest = now.getTime() + CONFIG.minLeadHours * 3600000;
    var count = 0;
    for (var i = 0; i <= CONFIG.daysAhead; i++) {
      var dt = new Date(Date.UTC(base.year, base.month - 1, base.day + i, 12));
      if (CONFIG.workDays.indexOf(dt.getUTCDay()) === -1) continue;
      var y = dt.getUTCFullYear(), m = dt.getUTCMonth(), d = dt.getUTCDate();
      var anyFree = CONFIG.slots.some(function (s) {
        var t = s.split(':');
        return ptToUtcMs(y, m, d, +t[0], +t[1]) >= earliest;
      });
      if (!anyFree) continue;
      var key = y + '-' + pad(m + 1) + '-' + pad(d);
      var label = document.createElement('label');
      label.className = 'chip';
      label.innerHTML = '<input type="radio" name="date" value="' + key + '"><span>' +
        dt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }) + '<b>' + d + '</b>' +
        dt.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) + '</span>';
      datesEl.appendChild(label);
      count++;
    }
    if (!count) datesEl.textContent = 'No online slots open right now. Please call or email instead.';
  }

  function buildTimes(dateKey) {
    var p = dateKey.split('-').map(Number);
    var earliest = Date.now() + CONFIG.minLeadHours * 3600000;
    timesEl.innerHTML = '';
    CONFIG.slots.forEach(function (s) {
      var t = s.split(':').map(Number);
      var free = ptToUtcMs(p[0], p[1] - 1, p[2], t[0], t[1]) >= earliest;
      var h12 = ((t[0] + 11) % 12) + 1, ap = t[0] < 12 ? 'AM' : 'PM';
      var label = document.createElement('label');
      label.className = 'chip';
      label.innerHTML = '<input type="radio" name="time" value="' + s + '"' + (free ? '' : ' disabled') + '><span>' + h12 + ':' + pad(t[1]) + ' ' + ap + '</span>';
      timesEl.appendChild(label);
    });
    hint.textContent = 'All times are Pacific Time.';
    state.time = null;
  }

  datesEl.addEventListener('change', function (e) {
    if (e.target.name === 'date') { state.date = e.target.value; buildTimes(state.date); }
  });
  timesEl.addEventListener('change', function (e) {
    if (e.target.name === 'time') state.time = e.target.value;
  });
  buildDates();

  function fmtIcsUtc(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function showErr(el, msg) { el.textContent = msg; el.hidden = !msg; }
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var lastBooking = null;

  $('#bookingForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, err = $('#formError');
    var name = f.name.value.trim(), email = f.email.value.trim();
    if (!state.date) return showErr(err, 'Please choose a date.');
    if (!state.time) return showErr(err, 'Please choose a time.');
    if (!name) return showErr(err, 'Please enter your name.');
    if (!emailRe.test(email)) return showErr(err, 'Please enter a valid email address.');
    showErr(err, '');

    var dp = state.date.split('-').map(Number), tp = state.time.split(':').map(Number);
    var startMs = ptToUtcMs(dp[0], dp[1] - 1, dp[2], tp[0], tp[1]);
    var human = new Date(startMs).toLocaleString('en-US', {
      timeZone: CONFIG.timezone, weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
    }) + ' PT';

    var body = [
      'Hi Chris,', '',
      'I would like to book a free ' + CONFIG.callMinutes + '-minute intro call.', '',
      'When: ' + human,
      'Service: ' + f.service.value,
      'Format: ' + f.method.value,
      'Name: ' + name,
      'Email: ' + email,
      'Phone: ' + (f.phone.value.trim() || 'n/a'), '',
      'About my project:', (f.notes.value.trim() || 'n/a')
    ].join('\n');
    var subject = 'Call request: ' + human + ' (' + name + ')';
    var href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    lastBooking = { startMs: startMs, name: name, service: f.service.value };
    $('#mailLink').href = href;
    $('#confirmText').textContent = 'Your request for ' + human + ' is ready. Press the button to send it from your email app. I will reply to confirm.';
    f.hidden = true;
    var c = $('#confirm'); c.hidden = false; c.focus();
    c.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.location.href = href;
  });

  $('#againBtn').addEventListener('click', function () {
    $('#confirm').hidden = true; $('#bookingForm').hidden = false;
  });

  $('#icsBtn').addEventListener('click', function () {
    if (!lastBooking) return;
    var end = lastBooking.startMs + CONFIG.callMinutes * 60000;
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Chris Nussbaum//Booking//EN', 'BEGIN:VEVENT',
      'UID:' + lastBooking.startMs + '@chrisnussbaum', 'DTSTAMP:' + fmtIcsUtc(Date.now()),
      'DTSTART:' + fmtIcsUtc(lastBooking.startMs), 'DTEND:' + fmtIcsUtc(end),
      'SUMMARY:Intro call with Chris Nussbaum (requested)',
      'DESCRIPTION:Service: ' + lastBooking.service.replace(/[,;\n]/g, ' ') + '\\nPending confirmation by email.',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'call-with-chris.ics';
    document.body.appendChild(a); a.click(); a.remove();
  });

  // ---- Calendly (replaces the email request form when calendlyUrl is set) ----
  var calendlyStarted = false;
  function startCalendly(service) {
    var wrap = $('#calendlyWrap'), embed = $('#calendlyEmbed');
    var url;
    try { url = new URL(CONFIG.calendlyUrl); } catch (e) { return; }
    if (url.hostname !== 'calendly.com' && !/\.calendly\.com$/.test(url.hostname)) return;
    url.searchParams.set('hide_gdpr_banner', '1');
    url.searchParams.set('primary_color', 'b4561f');
    if (service && service !== 'Not sure yet') url.searchParams.set('utm_content', service);
    $('#bookingForm').hidden = true;
    $('#confirm').hidden = true;
    wrap.hidden = false;
    $('#bookIntro').textContent = 'Pick a day and time that works for you. You\'ll get an instant confirmation and calendar invite.';
    function init() {
      embed.innerHTML = '';
      window.Calendly.initInlineWidget({ url: url.toString(), parentElement: embed });
    }
    if (window.Calendly) return init();
    if (calendlyStarted) return;
    calendlyStarted = true;
    var sc = document.createElement('script');
    sc.src = 'https://assets.calendly.com/assets/external/widget.js';
    sc.async = true;
    sc.onload = init;
    sc.onerror = function () { calendlyStarted = false; };
    document.head.appendChild(sc);
  }
  if (CONFIG.calendlyUrl) {
    startCalendly();
    // "Book this" buttons pass the chosen service to Calendly as utm_content
    document.querySelectorAll('[data-service]').forEach(function (a) {
      a.addEventListener('click', function () { startCalendly(a.getAttribute('data-service')); });
    });
  }

  // ---- Quick contact form (opens a pre-filled email) ----
  $('#contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, err = $('#contactError');
    if (!f.name.value.trim() || !f.message.value.trim()) return showErr(err, 'Please add your name and a message.');
    if (!emailRe.test(f.email.value.trim())) return showErr(err, 'Please enter a valid email address.');
    showErr(err, '');
    var body = f.message.value.trim() + '\n\n-- ' + f.name.value.trim() + ' (' + f.email.value.trim() + ')';
    window.location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Website message from ' + f.name.value.trim()) + '&body=' + encodeURIComponent(body);
  });
})();

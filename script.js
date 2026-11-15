document.documentElement.classList.add('js');

var OPEN_HOUR = 10;
var CLOSE_HOUR = 22;
var WEEKDAYS = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

// Время и день недели в Астане, независимо от часового пояса посетителя
function astanaTime(date) {
  var parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Almaty',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23'
  }).formatToParts(date);

  var result = {};
  parts.forEach(function (part) { result[part.type] = part.value; });
  return {
    hour: Number(result.hour) % 24,
    minute: Number(result.minute),
    day: WEEKDAYS[result.weekday]
  };
}

function grossStatus(date) {
  var hour = astanaTime(date).hour;
  var open = hour >= OPEN_HOUR && hour < CLOSE_HOUR;
  return {
    open: open,
    word: open ? 'Открыто' : 'Закрыто',
    text: open ? 'Открыто до 22:00' : 'Откроемся в 10:00'
  };
}

var firstRender = true;

function renderStatus() {
  var now = new Date();
  var status = grossStatus(now);

  var box = document.querySelector('[data-status]');
  var boxText = document.querySelector('[data-status-text]');
  if (box && boxText) {
    box.classList.toggle('is-open', status.open);
    boxText.textContent = status.text;
  }

  var sign = document.querySelector('[data-sign]');
  var word = document.querySelector('[data-sign-word]');
  var caption = document.querySelector('[data-sign-caption]');
  if (sign && word && caption) {
    sign.classList.toggle('is-open', status.open);
    sign.classList.toggle('is-closed', !status.open);
    if (firstRender && status.open) sign.classList.add('is-flicker');
    word.textContent = status.word;
    caption.textContent = status.text;
  }
  firstRender = false;
}

renderStatus();
setInterval(renderStatus, 60 * 1000);

/* ---------- Вкладки прайса ---------- */
(function () {
  var tablist = document.querySelector('.tabs');
  if (!tablist) return;

  var tabs = Array.prototype.slice.call(tablist.querySelectorAll('.tabs__btn'));
  var panels = tabs.map(function (tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  });

  tablist.hidden = false;
  tabs.forEach(function (tab, i) {
    tab.setAttribute('role', 'tab');
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].setAttribute('tabindex', '0');
  });

  function select(index, moveFocus) {
    tabs.forEach(function (tab, i) {
      var active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (moveFocus) tabs[index].focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(i, false); });
    tab.addEventListener('keydown', function (event) {
      var next = null;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== null) {
        event.preventDefault();
        select(next, true);
      }
    });
  });

  select(0, false);
})();

/* ---------- Появление заголовков секций ---------- */
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (item) { item.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  items.forEach(function (item) { observer.observe(item); });
})();

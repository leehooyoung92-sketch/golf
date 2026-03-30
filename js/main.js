/* ============================================
   포지티브인베스트먼트 LP 초청 골프 세미나 - Main JS
   ============================================ */

// Google Apps Script 배포 URL (배포 후 교체 필요)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbys3Yv0lzFfnvcSpmhXei6FcRMlRCwRViM7PkrVluxa43ncc4wQMNiX6d_OeQyLAt_V/exec';

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCountdown();
  initLocationTabs();
  initFormConditionals();
  initFormSubmission();
  initModal();
});

/* --- Scroll Reveal --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* --- D-Day Countdown (두 행사 동시 표시) --- */
function initCountdown() {
  const timers = [
    {
      date: new Date('2026-06-10T10:30:00+09:00'),
      els: {
        days: document.getElementById('cd1-days'),
        hours: document.getElementById('cd1-hours'),
        minutes: document.getElementById('cd1-minutes'),
        seconds: document.getElementById('cd1-seconds')
      },
      group: document.getElementById('countdown-lakeside')
    },
    {
      date: new Date('2026-06-12T10:30:00+09:00'),
      els: {
        days: document.getElementById('cd2-days'),
        hours: document.getElementById('cd2-hours'),
        minutes: document.getElementById('cd2-minutes'),
        seconds: document.getElementById('cd2-seconds')
      },
      group: document.getElementById('countdown-gapyeong')
    }
  ];

  function update() {
    const now = new Date();
    timers.forEach(timer => {
      const diff = timer.date - now;
      if (diff <= 0) {
        timer.group.querySelector('.countdown-display').innerHTML =
          '<p class="countdown-ended">행사가 종료되었습니다</p>';
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      timer.els.days.textContent = String(days).padStart(2, '0');
      timer.els.hours.textContent = String(hours).padStart(2, '0');
      timer.els.minutes.textContent = String(minutes).padStart(2, '0');
      timer.els.seconds.textContent = String(seconds).padStart(2, '0');
    });
  }

  update();
  setInterval(update, 1000);
}

/* --- Location Tabs --- */
function initLocationTabs() {
  const tabs = document.querySelectorAll('.location-tabs .venue-tab');
  const maps = {
    lakeside: document.getElementById('map-lakeside'),
    gapyeong: document.getElementById('map-gapyeong')
  };
  const infos = {
    lakeside: document.getElementById('info-lakeside'),
    gapyeong: document.getElementById('info-gapyeong')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.map;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      Object.entries(maps).forEach(([k, el]) => {
        if (k === key) {
          el.classList.remove('hidden');
          if (el._kakaoMap) {
            el._kakaoMap.relayout();
          }
          if (el._pendingVenue) {
            createKakaoMap(el, el._pendingVenue);
            delete el._pendingVenue;
          }
        } else {
          el.classList.add('hidden');
        }
      });

      Object.entries(infos).forEach(([k, el]) => {
        if (k === key) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
    });
  });
}

/* --- Form Conditionals (Designated Driver) --- */
function initFormConditionals() {
  const driveRadios = document.querySelectorAll('input[name="drive"]');
  const driveFields = document.getElementById('drive-fields');
  const carnum = document.getElementById('carnum');
  const address = document.getElementById('address');

  driveRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === '예' && radio.checked) {
        driveFields.classList.add('show');
      } else if (radio.value === '아니오' && radio.checked) {
        driveFields.classList.remove('show');
        carnum.value = '';
        address.value = '';
      }
    });
  });
}

/* --- Form Validation & Submission --- */
function initFormSubmission() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  const submitBtn = form.querySelector('.submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dateInput = form.querySelector('input[name="date"]:checked');
    if (!dateInput) {
      showAlert('참석 날짜를 선택해주세요.');
      return;
    }

    const name = form.name.value.trim();
    if (!name) {
      showAlert('성함을 입력하세요.');
      form.name.focus();
      return;
    }

    const driveInput = form.querySelector('input[name="drive"]:checked');
    if (!driveInput) {
      showAlert('대리운전 이용 여부를 선택해주세요.');
      return;
    }

    if (driveInput.value === '예') {
      if (!form.carnum.value.trim()) {
        showAlert('차량번호를 입력하세요.');
        form.carnum.focus();
        return;
      }
      if (!form.address.value.trim()) {
        showAlert('자택주소를 입력하세요.');
        form.address.focus();
        return;
      }
    }

    if (!form.agree.checked) {
      showAlert('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    const formData = {
      date: dateInput.value,
      name: name,
      drive: driveInput.value,
      carnum: form.carnum.value.trim(),
      address: form.address.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = '전송 중...';

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const rsvpSection = document.getElementById('rsvp');
      rsvpSection.innerHTML =
        '<div class="container success-message">' +
          '<h2>회신 완료</h2>' +
          '<p>' + escapeHtml(name) + '님,<br>참석 회신이 완료되었습니다.<br>감사합니다!</p>' +
        '</div>';
    } catch (err) {
      showAlert('전송에 실패했습니다. 다시 시도해주세요.');
      submitBtn.disabled = false;
      submitBtn.textContent = '참석 회신하기';
    }
  });
}

/* --- Modal --- */
function initModal() {
  const modal = document.getElementById('consent-modal');
  const openBtn = document.getElementById('open-consent');
  const closeBtn = document.getElementById('close-consent');
  const backdrop = modal.querySelector('.modal-backdrop');

  openBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
}

/* --- Utility --- */
function showAlert(message) {
  alert(message);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

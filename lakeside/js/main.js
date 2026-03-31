/* ============================================
   레이크사이드CC - Main JS
   ============================================ */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbys3Yv0lzFfnvcSpmhXei6FcRMlRCwRViM7PkrVluxa43ncc4wQMNiX6d_OeQyLAt_V/exec';

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCountdown();
  initFormConditionals();
  initFormSubmission();
  initModal();
});

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

function initCountdown() {
  const target = new Date('2026-06-10T10:30:00+09:00');
  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds')
  };
  const group = document.getElementById('countdown-main');

  function update() {
    const diff = target - new Date();
    if (diff <= 0) {
      group.querySelector('.countdown-display').innerHTML =
        '<p class="countdown-ended">행사가 종료되었습니다</p>';
      return;
    }
    els.days.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
    els.hours.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    els.minutes.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    els.seconds.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

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

function initFormSubmission() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;
  const submitBtn = form.querySelector('.submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    if (!name) { showAlert('성함을 입력하세요.'); form.name.focus(); return; }

    const driveInput = form.querySelector('input[name="drive"]:checked');
    if (!driveInput) { showAlert('대리운전 이용 여부를 선택해주세요.'); return; }

    if (driveInput.value === '예') {
      if (!form.carnum.value.trim()) { showAlert('차량번호를 입력하세요.'); form.carnum.focus(); return; }
      if (!form.address.value.trim()) { showAlert('자택주소를 입력하세요.'); form.address.focus(); return; }
    }

    if (!form.agree.checked) { showAlert('개인정보 수집 및 이용에 동의해주세요.'); return; }

    const formData = {
      date: form.querySelector('input[name="date"]').value,
      name: name,
      drive: driveInput.value,
      carnum: form.carnum.value.trim(),
      address: form.address.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = '전송 중...';

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      document.getElementById('rsvp').innerHTML =
        '<div class="container success-message"><h2>회신 완료</h2>' +
        '<p>' + escapeHtml(name) + '님,<br>참석 회신이 완료되었습니다.<br>감사합니다!</p></div>';
    } catch (err) {
      showAlert('전송에 실패했습니다. 다시 시도해주세요.');
      submitBtn.disabled = false;
      submitBtn.textContent = '참석 회신하기';
    }
  });
}

function initModal() {
  const modal = document.getElementById('consent-modal');
  const openBtn = document.getElementById('open-consent');
  const closeBtn = document.getElementById('close-consent');
  const backdrop = modal.querySelector('.modal-backdrop');

  openBtn.addEventListener('click', () => { modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; });
  function closeModal() { modal.classList.add('hidden'); document.body.style.overflow = ''; }
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
}

function showAlert(message) { alert(message); }
function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }

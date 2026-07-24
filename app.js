const channel = new BroadcastChannel('cmb-event-control');
const appState = { state: 1, activeOrbs: [], count: 10, showcase: 0 };
let displayWindow;
const socket = window.cmbSocket;
const orbMarkup = (active, label) => `<div class="display-orb ${active ? 'spinning' : ''}" aria-label="Điểm chạm ${label}"><svg class="orb-svg" viewBox="0 0 200 200" aria-hidden="true"><g class="orbit-track"><circle class="outer-glow" cx="100" cy="100" r="84"/><circle class="outer-solid" cx="100" cy="100" r="84"/><circle class="dash-ring" cx="100" cy="100" r="91"/><circle class="arc" cx="100" cy="100" r="76"/><circle class="inner-ring" cx="100" cy="100" r="63"/><circle class="inner-halo" cx="100" cy="100" r="56"/><circle class="node" cx="100" cy="8" r="4"/><circle class="node" cx="192" cy="100" r="4"/><circle class="node" cx="100" cy="192" r="4"/><circle class="node" cx="8" cy="100" r="4"/></g></svg><span class="orb-label">CMB</span></div>`;

const touchControls = document.getElementById('touchControls');
touchControls.innerHTML = Array.from({ length: 7 }, (_, i) => `
  <button class="touch-btn" data-orb="${i + 1}"><span class="touch-orb"></span><b>Điểm chạm ${i + 1}</b><small>Sẵn sàng</small></button>`).join('');

// The touch controls are relevant only to Screen 1, so place them immediately
// after its scenario card instead of after the other screen choices.
const stateCardsContainer = document.querySelector('.state-cards');
const firstStateCard = document.querySelector('.state-card[data-state="1"]');
const interactionPanel = document.querySelector('.interaction-panel');
if (stateCardsContainer && firstStateCard && interactionPanel) {
  const firstStateWrap = document.createElement('div');
  firstStateWrap.className = 'state-card-single';
  stateCardsContainer.parentNode.insertBefore(firstStateWrap, stateCardsContainer);
  firstStateWrap.appendChild(firstStateCard);
  interactionPanel.classList.add('state-1-panel');
  stateCardsContainer.parentNode.insertBefore(interactionPanel, stateCardsContainer);
}
if (stateCardsContainer) {
  const showcaseControls = document.createElement('div');
  showcaseControls.className = 'showcase-controls';
  showcaseControls.innerHTML = '<h3>03 / NỘI DUNG TRÌNH CHIẾU</h3><div class="showcase-thumbs"><button class="showcase-thumb" data-showcase="0"><img src="erp.png" alt="Ứng dụng quản trị"><span>Ứng dụng quản trị</span></button><button class="showcase-thumb" data-showcase="1"><img src="website.png" alt="Website mới"><span>Website mới</span></button><button class="showcase-thumb" data-showcase="2"><img src="mobile.png" alt="Ứng dụng di động"><span>Ứng dụng di động</span></button></div>';
  stateCardsContainer.appendChild(showcaseControls);
}
document.querySelector('.state-card[data-state="3"] small').textContent = 'Ứng dụng quản trị · Website mới · Ứng dụng di động';

const showcaseSlides = [
  { title: 'HỆ SINH THÁI ỨNG DỤNG QUẢN TRỊ', image: 'website.png', label: 'ERP' },
  { title: 'WEBSITE MỚI', image: 'website.png', label: 'Website' },
  { title: 'ỨNG DỤNG DI ĐỘNG', image: 'mobile.png', label: 'Mobile' }
];
function showcaseMarkup(index) {
  const slide = showcaseSlides[index] || showcaseSlides[0];
  const dots = showcaseSlides.map((_, i) => '<i class="' + (i === index ? 'active' : '') + '"></i>').join('');
  return '<div class="screen app-showcase"><div class="showcase-copy"><p>' + slide.label + '</p><h3>' + slide.title + '</h3></div><div class="product-frame"><img src="' + slide.image + '" alt="' + slide.title + '"></div><div class="showcase-progress">' + dots + '</div></div>';
}
function countdownSceneMarkup(count) {
  const counter = count > 0
    ? '<div class="count-overlay"><b>' + count + '</b></div>'
    : '<div class="count-overlay ready"><b>SẴN SÀNG RA MẮT</b></div>';
  return '<div class="screen tech-scene count-tech-scene"><div class="screen-bg"></div>' + counter + '<div class="touch-link"></div><div class="orb-row">' + Array.from({length: 7}, (_, i) => orbMarkup(true, i + 1)).join('') + '</div></div>';
}
function mountScreen(target, html, smoothShowcase) {
  const oldScreen = target.querySelector('.app-showcase');
  if (!smoothShowcase || !oldScreen) { target.innerHTML = html; return; }
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const nextScreen = holder.firstElementChild;
  nextScreen.classList.add('showcase-enter');
  oldScreen.classList.add('showcase-exit');
  target.appendChild(nextScreen);
  setTimeout(() => oldScreen.remove(), 720);
}

function screenMarkup(state, activeOrbs = [], count = 10, showcase = 0) {
  if (state === 3) return showcaseMarkup(showcase);
  if (state === 2) return countdownSceneMarkup(count);
  return `<div class="screen tech-scene"><div class="screen-bg"></div><div class="circuit-board" aria-hidden="true"></div><div class="world-map" aria-hidden="true"></div><div class="city-line" aria-hidden="true"></div><div class="digital-wave" aria-hidden="true"></div><div class="floor-grid" aria-hidden="true"></div><div class="display-top"><div class="display-kicker">CMB GIỚI THIỆU</div><div class="display-title">RA MẮT</div><div class="display-subtitle">HỆ THỐNG ỨNG DỤNG QUẢN TRỊ · ỨNG DỤNG DI ĐỘNG · WEBSITE MỚI</div></div><div class="touch-link" aria-hidden="true"></div><div class="orb-row">${Array.from({length:7},(_,i)=>orbMarkup(activeOrbs.includes(i+1),i+1)).join('')}</div></div>`;
}
function render(emitSocket = true) {
  mountScreen(document.getElementById('miniDisplay'), screenMarkup(appState.state, appState.activeOrbs, appState.count, appState.showcase), appState.state === 3);
  document.getElementById('stateLabel').textContent = `TRẠNG THÁI 0${appState.state}`;
  document.querySelectorAll('.state-card').forEach(el => el.classList.toggle('active', +el.dataset.state === appState.state));
  document.querySelector('.showcase-controls')?.classList.toggle('visible', appState.state === 3);
  document.querySelectorAll('.touch-btn').forEach(el => { const active=appState.activeOrbs.includes(+el.dataset.orb); el.classList.toggle('active',active); el.querySelector('small').textContent=active?'Đang xoay':'Sẵn sàng'; });
  channel.postMessage({ type:'state', payload:appState });
  if (emitSocket && socket?.connected) socket.emit('event-state', appState);
}
function selectState(state) { clearInterval(countdownTimer); clearInterval(showcaseTimer); appState.state = state; appState.count = 10; appState.showcase = 0; render(); if (state === 2) startCountdown(); if (state === 3) startShowcase(); }
document.querySelectorAll('.state-card').forEach(btn => btn.addEventListener('click', () => selectState(+btn.dataset.state)));
document.querySelector('.showcase-controls')?.addEventListener('click', e => { const button = e.target.closest('.showcase-thumb'); if (!button) return; clearInterval(countdownTimer); clearInterval(showcaseTimer); appState.state = 3; appState.showcase = +button.dataset.showcase; render(); startShowcase(); });
touchControls.addEventListener('click', e => { const btn=e.target.closest('.touch-btn'); if(!btn) return; const n=+btn.dataset.orb; appState.activeOrbs=appState.activeOrbs.includes(n)?appState.activeOrbs.filter(x=>x!==n):[...appState.activeOrbs,n]; render(); });
document.getElementById('resetAll').addEventListener('click', ()=>{appState.activeOrbs=[];render()});
document.getElementById('activateAll').addEventListener('click', ()=>{appState.activeOrbs=[1,2,3,4,5,6,7];render()});
document.getElementById('openDisplay').addEventListener('click',()=>{ const displayUrl = new URL('index.html', window.location.href); const socketUrl = new URLSearchParams(window.location.search).get('socket'); if (socketUrl) displayUrl.searchParams.set('socket', socketUrl); displayWindow=window.open(displayUrl.toString(),'cmb-display','noopener=false'); if(!displayWindow) alert('Trình duyệt đang chặn cửa sổ màn hình lớn. Hãy cho phép pop-up và thử lại.'); });
let countdownTimer, showcaseTimer;
function startCountdown(){clearInterval(countdownTimer); countdownTimer=setInterval(()=>{if(appState.state!==2){clearInterval(countdownTimer);return}if(appState.count>0){appState.count--;render();if(appState.count===0){clearInterval(countdownTimer);setTimeout(()=>selectState(3),1300)}}},1500)}
function startShowcase(){clearInterval(showcaseTimer);showcaseTimer=setInterval(()=>{if(appState.state!==3||appState.showcase>=2){clearInterval(showcaseTimer);return}appState.showcase++;render()},10000)}
channel.onmessage = e => { if(e.data?.type === 'request-state') render(false); };
socket?.on('event-state', (nextState) => { Object.assign(appState, nextState); render(false); });
render();

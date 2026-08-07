const channel = new BroadcastChannel('cmb-event-control');
const defaultTouchPoints = [{id:1,x:8,y:84},{id:2,x:20,y:84},{id:3,x:32,y:84},{id:4,x:44,y:84},{id:5,x:56,y:84},{id:6,x:68,y:84},{id:7,x:80,y:84},{id:8,x:92,y:84}];
const countdownIntervals = [1000, 800, 500];
const appState = { state: 1, activeOrbs: [], count: 10, showcase: 0, musicEnabled: true, countdownSoundEnabled: true, countdownInterval: 1000, touchRowY: 62, touchPoints: defaultTouchPoints };
let displayWindow;
const socket = window.cmbSocket;
const openDisplayButton = document.getElementById('openDisplay');
const musicToggle = document.createElement('button');
musicToggle.id = 'toggleMusic';
musicToggle.type = 'button';
musicToggle.className = 'music-btn';
const countdownSoundToggle = document.createElement('button');
countdownSoundToggle.id = 'toggleCountdownSound';
countdownSoundToggle.type = 'button';
countdownSoundToggle.className = 'music-btn';
countdownSoundToggle.title = 'Bat/tat am thanh dem nguoc';
const headerActions = document.createElement('div');
headerActions.className = 'header-actions';
const pageHeader = openDisplayButton.parentNode;
pageHeader.insertBefore(headerActions, openDisplayButton); headerActions.append(musicToggle, countdownSoundToggle, openDisplayButton);
const orbMarkup = (active, label) => `<div class="display-orb ${active ? 'spinning' : ''}" aria-label="Điểm chạm ${label}"><svg class="orb-svg" viewBox="0 0 200 200" aria-hidden="true"><g class="orbit-track"><circle class="outer-glow" cx="100" cy="100" r="84"/><circle class="outer-solid" cx="100" cy="100" r="84"/><circle class="dash-ring" cx="100" cy="100" r="91"/><circle class="arc" cx="100" cy="100" r="76"/><circle class="inner-ring" cx="100" cy="100" r="63"/><circle class="inner-halo" cx="100" cy="100" r="56"/><circle class="node" cx="100" cy="8" r="4"/><circle class="node" cx="192" cy="100" r="4"/><circle class="node" cx="100" cy="192" r="4"/><circle class="node" cx="8" cy="100" r="4"/></g></svg><span class="orb-label">${label}</span></div>`;

const touchControls = document.getElementById('touchControls');
function renderTouchControls() {
  touchControls.innerHTML = appState.touchPoints.map((point, index) => '<button class="touch-btn" data-orb="' + point.id + '"><span class="remove-point" data-remove="' + point.id + '" title="Xóa điểm chạm">×</span><span class="touch-orb"></span><b>Điểm chạm ' + (index + 1) + '</b><small>Sẵn sàng</small></button>').join('');
}
function pointOrbMarkup(point, active) {
  return orbMarkup(active, point.id).replace('aria-label=', 'data-point-id="' + point.id + '" style="left:' + point.x + '%;top:' + point.y + '%" aria-label=');
}
touchControls.innerHTML = Array.from({ length: 8 }, (_, i) => `
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
const workspace = document.querySelector('.workspace');
const stateSection = document.querySelector('.state-section');
const previewSection = document.querySelector('.preview-section');
const previewHeading = previewSection?.querySelector('.preview-heading');
if (workspace && stateSection && previewSection) {
  const twoColumnLayout = document.createElement('div');
  twoColumnLayout.className = 'control-preview-layout';
  const controlColumn = document.createElement('div');
  controlColumn.className = 'control-column';
  workspace.insertBefore(twoColumnLayout, stateSection);
  twoColumnLayout.append(controlColumn, previewSection);
  controlColumn.appendChild(stateSection);
}
function placeDisplayActions() {
  if (window.innerWidth > 700 && previewHeading) previewHeading.after(headerActions);
  else pageHeader.append(headerActions);
}
placeDisplayActions();
window.addEventListener('resize', placeDisplayActions);
if (stateCardsContainer) {
  const showcaseControls = document.createElement('div');
  showcaseControls.className = 'showcase-controls';
  showcaseControls.innerHTML = '<h3>03 / NỘI DUNG TRÌNH CHIẾU</h3><div class="showcase-thumbs"><button class="showcase-thumb" data-showcase="0"><img src="website.png" alt="Website mới"><span>Website mới</span></button><button class="showcase-thumb" data-showcase="1"><img src="mobile.png" alt="Mobile App"><span>Mobile App</span></button><button class="showcase-thumb" data-showcase="2"><img src="erp.png" alt="Hệ thống quản trị"><span>Hệ thống quản trị</span></button><button class="showcase-thumb" data-showcase="3"><span>✦ Tổng kết 3 ứng dụng</span></button></div>';
  stateCardsContainer.appendChild(showcaseControls);
  const finalStateCard = document.querySelector('.state-card[data-state="4"]');
  if (finalStateCard) showcaseControls.after(finalStateCard);
}
document.querySelector('.state-card[data-state="3"] small').textContent = 'Website mới · Mobile App · Hệ thống quản trị';

const showcaseSlides = [
  { title: 'WEBSITE MỚI', image: 'website.png' },
  { title: 'MOBILE APP', image: 'mobile.png' },
  { title: 'HỆ THỐNG QUẢN TRỊ', image: 'erp.png' },
  { title: 'HỆ SINH THÁI ỨNG DỤNG CMB', overview: true }
];
function showcaseMarkup(index) {
  const slide = showcaseSlides[index] || showcaseSlides[0];
  if (slide.overview) return '<div class="screen app-showcase"><div class="showcase-copy"><h3>' + slide.title + '</h3></div><div class="apps-overview"><figure><img src="website.png" alt="Website mới"><figcaption>Website mới</figcaption></figure><figure><img src="mobile.png" alt="Mobile App"><figcaption>Mobile App</figcaption></figure><figure><img src="erp.png" alt="Hệ thống quản trị"><figcaption>Hệ thống quản trị</figcaption></figure></div></div>';
  const dots = showcaseSlides.map((_, i) => '<i class="' + (i === index ? 'active' : '') + '"></i>').join('');
  return '<div class="screen app-showcase"><div class="showcase-copy"><p>' + slide.label + '</p><h3>' + slide.title + '</h3></div><div class="product-frame"><img src="' + slide.image + '" alt="' + slide.title + '"></div><div class="showcase-progress">' + dots + '</div></div>';
}
function countdownSceneMarkup(count) {
  const counter = count > 0
    ? '<div class="count-overlay"><b>' + count + '</b></div>'
    : '<div class="count-overlay ready"><b>SẴN SÀNG RA MẮT</b></div>';
  return '<div class="screen tech-scene count-tech-scene"><div class="screen-bg"></div>' + counter + '<div class="touch-link" style="top:' + appState.touchRowY + '%;bottom:auto"></div><div class="orb-row" style="top:' + appState.touchRowY + '%;bottom:auto;transform:translateY(-50%)">' + appState.touchPoints.map((_, i) => orbMarkup(true, i + 1)).join('') + '</div></div>';
}
function mountScreen(target, html, smoothShowcase, celebrate = false) {
  const oldScreen = target.querySelector('.app-showcase');
  if (!smoothShowcase || !oldScreen) { target.innerHTML = html; if (celebrate) requestAnimationFrame(() => window.startFireworks?.(target)); else window.stopFireworks?.(target); return; }
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const nextScreen = holder.firstElementChild;
  nextScreen.classList.add('showcase-enter');
  oldScreen.classList.add('showcase-exit');
  target.appendChild(nextScreen);
  if (celebrate) requestAnimationFrame(() => window.startFireworks?.(target)); else window.stopFireworks?.(target);
  setTimeout(() => oldScreen.remove(), 720);
}
function screenOneMarkup(activeOrbs) {
  return '<div class="screen tech-scene"><div class="screen-bg"></div><div class="touch-link" style="top:' + appState.touchRowY + '%;bottom:auto"></div><div class="orb-row" style="top:' + appState.touchRowY + '%;bottom:auto;transform:translateY(-50%)">' + appState.touchPoints.map(point => orbMarkup(activeOrbs.includes(point.id), point.id)).join('') + '</div></div>';
}

function finalScreenMarkup() {
  return '<div class="screen final-screen"><img src="images/final.jpg" alt="Man hinh ket thuc"></div>';
}
function screenMarkup(state, activeOrbs = [], count = 10, showcase = 0) {
  if (state === 1) return screenOneMarkup(activeOrbs);
  if (state === 3) return showcaseMarkup(showcase);
  if (state === 2) return countdownSceneMarkup(count);
  if (state === 4) return finalScreenMarkup();
  return `<div class="screen tech-scene"><div class="screen-bg"></div><div class="circuit-board" aria-hidden="true"></div><div class="world-map" aria-hidden="true"></div><div class="city-line" aria-hidden="true"></div><div class="digital-wave" aria-hidden="true"></div><div class="floor-grid" aria-hidden="true"></div><div class="display-top"><div class="display-kicker">CMB GIỚI THIỆU</div><div class="display-title">RA MẮT</div><div class="display-subtitle">HỆ THỐNG ỨNG DỤNG QUẢN TRỊ · ỨNG DỤNG DI ĐỘNG · WEBSITE MỚI</div></div><div class="touch-link" aria-hidden="true"></div><div class="orb-row">${Array.from({length:8},(_,i)=>orbMarkup(activeOrbs.includes(i+1),i+1)).join('')}</div></div>`;
}
function render(emitSocket = true) {
function markCountdownTen(target) {
  const overlay = target.querySelector('.count-overlay');
  overlay?.classList.toggle('count-ten', overlay.querySelector('b')?.textContent.trim() === '10');
}
  const miniDisplay = document.getElementById('miniDisplay');
  mountScreen(miniDisplay, screenMarkup(appState.state, appState.activeOrbs, appState.count, appState.showcase), appState.state === 3, appState.state === 3);
  markCountdownTen(miniDisplay);
  renderTouchControls();
  document.getElementById('stateLabel').textContent = `TRẠNG THÁI 0${appState.state}`;
  document.querySelectorAll('.state-card').forEach(el => el.classList.toggle('active', +el.dataset.state === appState.state));
  document.querySelector('.showcase-controls')?.classList.toggle('visible', appState.state === 3);
  musicToggle.innerHTML = appState.musicEnabled ? '&#128266; T&#7855;t nh&#7841;c' : '&#128263; B&#7853;t nh&#7841;c';
  musicToggle.classList.toggle('muted', !appState.musicEnabled);
  countdownSoundToggle.innerHTML = appState.countdownSoundEnabled ? '&#9201; T&#7855;t tick' : '&#128263; B&#7853;t tick';
  countdownSoundToggle.classList.toggle('muted', !appState.countdownSoundEnabled);
  document.querySelectorAll('[data-countdown-interval]').forEach(button => button.classList.toggle('active', +button.dataset.countdownInterval === appState.countdownInterval));
  document.querySelectorAll('.touch-btn').forEach(el => { const active=appState.activeOrbs.includes(+el.dataset.orb); el.classList.toggle('active',active); el.querySelector('small').textContent=active?'Đang xoay':'Sẵn sàng'; });
  document.querySelectorAll('[data-touch-row-y]').forEach(button => button.classList.toggle('active', +button.dataset.touchRowY === appState.touchRowY));
  channel.postMessage({ type:'state', payload:appState });
  if (emitSocket && socket?.connected) socket.emit('event-state', appState);
}
function selectState(state) { clearInterval(countdownTimer); clearInterval(showcaseTimer); appState.state = state; appState.count = 10; appState.showcase = 0; render(); if (state === 2) startCountdown(); if (state === 3) startShowcase(); }
musicToggle.addEventListener('click', () => { appState.musicEnabled = !appState.musicEnabled; render(); });
document.querySelectorAll('.state-card').forEach(btn => btn.addEventListener('click', () => selectState(+btn.dataset.state)));
countdownSoundToggle.addEventListener('click', () => { appState.countdownSoundEnabled = !appState.countdownSoundEnabled; render(); });
document.querySelector('.countdown-speed-options')?.addEventListener('click', event => { const button = event.target.closest('[data-countdown-interval]'); if (!button) return; const interval = +button.dataset.countdownInterval; if (!countdownIntervals.includes(interval)) return; appState.countdownInterval = interval; render(); if (appState.state === 2) startCountdown(); });
document.querySelector('.showcase-controls')?.addEventListener('click', e => { const button = e.target.closest('.showcase-thumb'); if (!button) return; clearInterval(countdownTimer); clearInterval(showcaseTimer); appState.state = 3; appState.showcase = +button.dataset.showcase; render(); startShowcase(); });
touchControls.addEventListener('click', e => { const remove=e.target.closest('[data-remove]'); if(remove){const id=+remove.dataset.remove;appState.touchPoints=appState.touchPoints.filter(point=>point.id!==id);appState.activeOrbs=appState.activeOrbs.filter(pointId=>pointId!==id);render();return}const btn=e.target.closest('.touch-btn'); if(!btn) return; const n=+btn.dataset.orb; appState.activeOrbs=appState.activeOrbs.includes(n)?appState.activeOrbs.filter(x=>x!==n):[...appState.activeOrbs,n]; render(); });
document.getElementById('resetAll').addEventListener('click', ()=>{appState.activeOrbs=[];render()});
document.getElementById('activateAll').addEventListener('click', ()=>{appState.activeOrbs=appState.touchPoints.map(point=>point.id);render()});
document.getElementById('addPoint').addEventListener('click', ()=>{const id=Math.max(0,...appState.touchPoints.map(point=>point.id))+1;appState.touchPoints=[...appState.touchPoints,{id,x:50,y:68}];render()});
document.querySelector('.touch-position-presets')?.addEventListener('click', event => { const button = event.target.closest('[data-touch-row-y], [data-touch-row-nudge]'); if (!button) return; appState.touchRowY = button.dataset.touchRowY ? +button.dataset.touchRowY : Math.max(8, Math.min(92, appState.touchRowY + +button.dataset.touchRowNudge)); render(); });
function enablePointDrag(container) {
  let pointId = null;
  const move = (event) => { if (pointId === null) return; const box=container.getBoundingClientRect(); const x=Math.max(4,Math.min(96,(event.clientX-box.left)/box.width*100)); const y=Math.max(8,Math.min(92,(event.clientY-box.top)/box.height*100)); const point=appState.touchPoints.find(item=>item.id===pointId); if(point){point.x=x;point.y=y;const orb=container.querySelector('[data-point-id="'+pointId+'"]');if(orb){orb.style.left=x+'%';orb.style.top=y+'%'}} };
  container.addEventListener('pointerdown', event => { const orb=event.target.closest('[data-point-id]'); if(!orb)return;pointId=+orb.dataset.pointId;container.setPointerCapture?.(event.pointerId);event.preventDefault(); });
  container.addEventListener('pointermove', move);
  container.addEventListener('pointerup', () => { if(pointId!==null){pointId=null;render()} });
}
enablePointDrag(document.getElementById('miniDisplay'));
let countdownTimer, showcaseTimer;
function openLargeDisplayWindow() {
  const displayUrl = new URL('index.html', window.location.href);
  const socketUrl = new URLSearchParams(window.location.search).get('socket');
  if (socketUrl) displayUrl.searchParams.set('socket', socketUrl);
  if (appState.state === 1 && appState.musicEnabled) displayUrl.searchParams.set('autoplayMusic', '1');
  const popupWidth = Math.min(1600, Math.max(960, Math.round(window.screen.availWidth * .8)));
  const popupHeight = Math.min(900, Math.max(540, Math.round(window.screen.availHeight * .8)));
  const popupFeatures = 'popup=yes,resizable=yes,scrollbars=no,width=' + popupWidth + ',height=' + popupHeight;
  displayWindow = window.open(displayUrl.toString(), 'cmb-display', popupFeatures);
  if (!displayWindow) { alert('Trình duyệt đang chặn cửa sổ màn hình lớn. Hãy cho phép pop-up và thử lại.'); return; }
  displayWindow.focus();
}
openDisplayButton.addEventListener('click', event => { event.preventDefault(); openLargeDisplayWindow(); });
function startCountdown(){clearInterval(countdownTimer);const interval=appState.countdownInterval;countdownTimer=setInterval(()=>{if(appState.state!==2){clearInterval(countdownTimer);return}if(appState.count>1){appState.count--;render();return}clearInterval(countdownTimer);selectState(3)},interval)}
function startShowcase(){clearInterval(showcaseTimer);showcaseTimer=setInterval(()=>{if(appState.state!==3){clearInterval(showcaseTimer);return}if(appState.showcase>=3){clearInterval(showcaseTimer);selectState(4);return}appState.showcase++;render()},6000)}
channel.onmessage = e => { if(e.data?.type === 'request-state') render(false); if(e.data?.type === 'state'){Object.assign(appState,e.data.payload);render(false)} };
socket?.on('event-state', (nextState) => { Object.assign(appState, nextState); render(false); });
render();

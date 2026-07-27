const channel = new BroadcastChannel('cmb-event-control');
const defaultTouchPoints = [{id:1,x:14,y:84},{id:2,x:27,y:84},{id:3,x:40,y:84},{id:4,x:53,y:84},{id:5,x:66,y:84},{id:6,x:79,y:84},{id:7,x:92,y:84}];
const appState = { state: 1, activeOrbs: [], count: 10, showcase: 0, touchPoints: defaultTouchPoints };
let displayWindow;
const socket = window.cmbSocket;
const orbMarkup = (active, label) => `<div class="display-orb ${active ? 'spinning' : ''}" aria-label="Điểm chạm ${label}"><svg class="orb-svg" viewBox="0 0 200 200" aria-hidden="true"><g class="orbit-track"><circle class="outer-glow" cx="100" cy="100" r="84"/><circle class="outer-solid" cx="100" cy="100" r="84"/><circle class="dash-ring" cx="100" cy="100" r="91"/><circle class="arc" cx="100" cy="100" r="76"/><circle class="inner-ring" cx="100" cy="100" r="63"/><circle class="inner-halo" cx="100" cy="100" r="56"/><circle class="node" cx="100" cy="8" r="4"/><circle class="node" cx="192" cy="100" r="4"/><circle class="node" cx="100" cy="192" r="4"/><circle class="node" cx="8" cy="100" r="4"/></g></svg><span class="orb-label">CMB</span></div>`;

const touchControls = document.getElementById('touchControls');
function renderTouchControls() {
  touchControls.innerHTML = appState.touchPoints.map((point, index) => '<button class="touch-btn" data-orb="' + point.id + '"><span class="remove-point" data-remove="' + point.id + '" title="Xóa điểm chạm">×</span><span class="touch-orb"></span><b>Điểm chạm ' + (index + 1) + '</b><small>Sẵn sàng</small></button>').join('');
}
function pointOrbMarkup(point, active) {
  return orbMarkup(active, point.id).replace('aria-label=', 'data-point-id="' + point.id + '" style="left:' + point.x + '%;top:' + point.y + '%" aria-label=');
}
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
  showcaseControls.innerHTML = '<h3>03 / NỘI DUNG TRÌNH CHIẾU</h3><div class="showcase-thumbs"><button class="showcase-thumb" data-showcase="0"><img src="website.png" alt="Website mới"><span>Website mới</span></button><button class="showcase-thumb" data-showcase="1"><img src="erp.png" alt="Ứng dụng quản trị"><span>Ứng dụng quản trị</span></button><button class="showcase-thumb" data-showcase="2"><img src="mobile.png" alt="Ứng dụng di động"><span>Ứng dụng di động</span></button><button class="showcase-thumb" data-showcase="3"><span>✦ Tổng kết 3 ứng dụng</span></button></div>';
  stateCardsContainer.appendChild(showcaseControls);
}
document.querySelector('.state-card[data-state="3"] small').textContent = 'Ứng dụng quản trị · Website mới · Ứng dụng di động';

const showcaseSlides = [
  { title: 'WEBSITE MỚI', image: 'website.png' },
  { title: 'HỆ SINH THÁI ỨNG DỤNG QUẢN TRỊ', image: 'erp.png' },
  { title: 'ỨNG DỤNG DI ĐỘNG', image: 'mobile.png' },
  { title: 'HỆ SINH THÁI ỨNG DỤNG CMB', overview: true }
];
function showcaseMarkup(index) {
  const slide = showcaseSlides[index] || showcaseSlides[0];
  if (slide.overview) return '<div class="screen app-showcase"><div class="showcase-copy"><h3>' + slide.title + '</h3></div><div class="apps-overview"><figure><img src="website.png" alt="Website mới"><figcaption>Website mới</figcaption></figure><figure><img src="erp.png" alt="Ứng dụng quản trị"><figcaption>Ứng dụng quản trị</figcaption></figure><figure><img src="mobile.png" alt="Ứng dụng di động"><figcaption>Ứng dụng di động</figcaption></figure></div></div>';
  const dots = showcaseSlides.map((_, i) => '<i class="' + (i === index ? 'active' : '') + '"></i>').join('');
  return '<div class="screen app-showcase"><div class="showcase-copy"><p>' + slide.label + '</p><h3>' + slide.title + '</h3></div><div class="product-frame"><img src="' + slide.image + '" alt="' + slide.title + '"></div><div class="showcase-progress">' + dots + '</div></div>';
}
function countdownSceneMarkup(count) {
  const counter = count > 0
    ? '<div class="count-overlay"><b>' + count + '</b></div>'
    : '<div class="count-overlay ready"><b>SẴN SÀNG RA MẮT</b></div>';
  return '<div class="screen tech-scene count-tech-scene"><div class="screen-bg"></div>' + counter + '<div class="touch-link"></div><div class="orb-row">' + Array.from({length: 7}, (_, i) => orbMarkup(true, i + 1)).join('') + '</div></div>';
}
function mountScreen(target, html, smoothShowcase, celebrate = false) {
  const oldScreen = target.querySelector('.app-showcase');
  if (!smoothShowcase || !oldScreen) { target.innerHTML = html; if (celebrate) requestAnimationFrame(() => window.startFireworks?.(target)); return; }
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const nextScreen = holder.firstElementChild;
  nextScreen.classList.add('showcase-enter');
  oldScreen.classList.add('showcase-exit');
  target.appendChild(nextScreen);
  if (celebrate) requestAnimationFrame(() => window.startFireworks?.(target));
  setTimeout(() => oldScreen.remove(), 720);
}
function screenOneMarkup(activeOrbs) {
  return '<div class="screen tech-scene"><div class="screen-bg"></div><div class="touch-link"></div><div class="orb-row custom-points">' + appState.touchPoints.map(point => pointOrbMarkup(point, activeOrbs.includes(point.id))).join('') + '</div></div>';
}

function screenMarkup(state, activeOrbs = [], count = 10, showcase = 0) {
  if (state === 1) return screenOneMarkup(activeOrbs);
  if (state === 3) return showcaseMarkup(showcase);
  if (state === 2) return countdownSceneMarkup(count);
  return `<div class="screen tech-scene"><div class="screen-bg"></div><div class="circuit-board" aria-hidden="true"></div><div class="world-map" aria-hidden="true"></div><div class="city-line" aria-hidden="true"></div><div class="digital-wave" aria-hidden="true"></div><div class="floor-grid" aria-hidden="true"></div><div class="display-top"><div class="display-kicker">CMB GIỚI THIỆU</div><div class="display-title">RA MẮT</div><div class="display-subtitle">HỆ THỐNG ỨNG DỤNG QUẢN TRỊ · ỨNG DỤNG DI ĐỘNG · WEBSITE MỚI</div></div><div class="touch-link" aria-hidden="true"></div><div class="orb-row">${Array.from({length:7},(_,i)=>orbMarkup(activeOrbs.includes(i+1),i+1)).join('')}</div></div>`;
}
function render(emitSocket = true) {
  mountScreen(document.getElementById('miniDisplay'), screenMarkup(appState.state, appState.activeOrbs, appState.count, appState.showcase), appState.state === 3, appState.state === 3);
  renderTouchControls();
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
touchControls.addEventListener('click', e => { const remove=e.target.closest('[data-remove]'); if(remove){const id=+remove.dataset.remove;appState.touchPoints=appState.touchPoints.filter(point=>point.id!==id);appState.activeOrbs=appState.activeOrbs.filter(pointId=>pointId!==id);render();return}const btn=e.target.closest('.touch-btn'); if(!btn) return; const n=+btn.dataset.orb; appState.activeOrbs=appState.activeOrbs.includes(n)?appState.activeOrbs.filter(x=>x!==n):[...appState.activeOrbs,n]; render(); });
document.getElementById('resetAll').addEventListener('click', ()=>{appState.activeOrbs=[];render()});
document.getElementById('activateAll').addEventListener('click', ()=>{appState.activeOrbs=appState.touchPoints.map(point=>point.id);render()});
document.getElementById('addPoint').addEventListener('click', ()=>{const id=Math.max(0,...appState.touchPoints.map(point=>point.id))+1;appState.touchPoints=[...appState.touchPoints,{id,x:50,y:68}];render()});
function enablePointDrag(container) {
  let pointId = null;
  const move = (event) => { if (pointId === null) return; const box=container.getBoundingClientRect(); const x=Math.max(4,Math.min(96,(event.clientX-box.left)/box.width*100)); const y=Math.max(8,Math.min(92,(event.clientY-box.top)/box.height*100)); const point=appState.touchPoints.find(item=>item.id===pointId); if(point){point.x=x;point.y=y;const orb=container.querySelector('[data-point-id="'+pointId+'"]');if(orb){orb.style.left=x+'%';orb.style.top=y+'%'}} };
  container.addEventListener('pointerdown', event => { const orb=event.target.closest('[data-point-id]'); if(!orb)return;pointId=+orb.dataset.pointId;container.setPointerCapture?.(event.pointerId);event.preventDefault(); });
  container.addEventListener('pointermove', move);
  container.addEventListener('pointerup', () => { if(pointId!==null){pointId=null;render()} });
}
enablePointDrag(document.getElementById('miniDisplay'));
document.getElementById('openDisplay').addEventListener('click',()=>{ const displayUrl = new URL('index.html', window.location.href); const socketUrl = new URLSearchParams(window.location.search).get('socket'); if (socketUrl) displayUrl.searchParams.set('socket', socketUrl); displayWindow=window.open(displayUrl.toString(),'cmb-display','noopener=false'); if(!displayWindow) alert('Trình duyệt đang chặn cửa sổ màn hình lớn. Hãy cho phép pop-up và thử lại.'); });
let countdownTimer, showcaseTimer;
function startCountdown(){clearInterval(countdownTimer); countdownTimer=setInterval(()=>{if(appState.state!==2){clearInterval(countdownTimer);return}if(appState.count>1){appState.count--;render();if(appState.count===1){clearInterval(countdownTimer);setTimeout(()=>selectState(3),1500)}}},1500)}
function startShowcase(){clearInterval(showcaseTimer);showcaseTimer=setInterval(()=>{if(appState.state!==3||appState.showcase>=3){clearInterval(showcaseTimer);return}appState.showcase++;render()},6000)}
channel.onmessage = e => { if(e.data?.type === 'request-state') render(false); if(e.data?.type === 'state'){Object.assign(appState,e.data.payload);render(false)} };
socket?.on('event-state', (nextState) => { Object.assign(appState, nextState); render(false); });
render();

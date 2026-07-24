(() => {
  const socketUrl = new URLSearchParams(window.location.search).get('socket') || window.CMB_SOCKET_URL;
  if (!socketUrl || !window.io) return;

  const socket = window.io(socketUrl, { transports: ['websocket', 'polling'] });
  window.cmbSocket = socket;
})();

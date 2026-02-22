(function() {
  var hostname = window.location.hostname;
  if (hostname === 'esg.video' || hostname === 'www.esg.video' || hostname.endsWith('.esg.video')) {
    if (window.location.pathname === '/') {
      window.location.replace('/videos');
    }
  }
})();

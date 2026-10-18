var API = '';
var pageSongs = [];
var pageInfo = { total: 0, page: 1, pages: 1, limit: 24 };
var entityItems = [];
var entityInfo = { total: 0, page: 1, pages: 1 };
var currentTab = 'songs';
var searchQuery = '';
var searchTimer = null;
var favOnly = false;
var browse = { movie: '', singer: '', lyricist: '' };
var favorites = {};
try { favorites = JSON.parse(localStorage.getItem('tamilLyricsFavs') || '{}'); } catch (e) { favorites = {}; }
var currentSong = null;
var singAlongLineIndex = 0;
function apiGet(path) {
  return fetch(API + path).then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  });
}
function buildSongsQuery(page) {
  var q = '/api/songs?page=' + page + '&limit=' + pageInfo.limit;
  if (searchQuery) q += (currentTab === 'lyrics' ? '&lq=' : '&q=') + encodeURIComponent(searchQuery);
  for (var k in browse) { if (browse[k]) q += '&' + k + '=' + encodeURIComponent(browse[k]); }
  return q;
}

var searchInput = document.getElementById('searchInput');
var searchForm = document.getElementById('searchForm');
var categoryList = document.getElementById('categoryList');
var browseRow = document.getElementById('browseRow');
var statsBar = document.getElementById('statsBar');
var songGrid = document.getElementById('songGrid');
var songsHeading = document.getElementById('songsHeading');
var emptyState = document.getElementById('emptyState');
var pager = document.getElementById('pager');
var prevPageBtn = document.getElementById('prevPage');
var nextPageBtn = document.getElementById('nextPage');
var pageInfoEl = document.getElementById('pageInfo');
var lyricsModal = document.getElementById('lyricsModal');
var closeModalBtn = document.getElementById('closeModal');
var modalTitle = document.getElementById('modalTitle');
var modalMeta = document.getElementById('modalMeta');
var modalCredits = document.getElementById('modalCredits');
var modalLyrics = document.getElementById('modalLyrics');
var modalYT = document.getElementById('modalYT');
var copyLyricsBtn = document.getElementById('copyLyrics');
var addFavoriteBtn = document.getElementById('addFavorite');
var singAlongBtn = document.getElementById('singAlongBtn');
var singAlongModal = document.getElementById('singAlongModal');
var exitSingAlongBtn = document.getElementById('exitSingAlong');
var singAlongTitle = document.getElementById('singAlongTitle');
var currentLine = document.getElementById('currentLine');
var fullLyrics = document.getElementById('fullLyrics');
var prevLineBtn = document.getElementById('prevLine');
var nextLineBtn = document.getElementById('nextLine');
var toast = document.getElementById('toast');
function init() {
  renderTabs();
  renderQuickRow();
  try {
    var saved = null;
    try { saved = localStorage.getItem('isaiPadalTheme'); } catch (e) {}
    setTheme(saved === 'dark');
  } catch (e) {}
  setupEventListeners();
  bindRichEvents();
  loadSongs();
  loadStats();
  loadSpotlight();
}
function setupEventListeners() {
  searchInput.addEventListener('input', function(e) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function() {
      searchQuery = e.target.value.toLowerCase().trim();
      favOnly = false;
      pageInfo.page = 1; entityInfo.page = 1;
      if (currentTab === 'songs' || currentTab === 'lyrics') loadSongs(); else loadEntities();
    }, 300);
  });
  searchForm.addEventListener('submit', function(e) { e.preventDefault(); });
  categoryList.addEventListener('click', function(e) {
    var btn = e.target.closest('.category-btn');
    if (!btn) return;
    switchTab(btn.dataset.key);
  });
  browseRow.addEventListener('change', function(e) {
    var sel = e.target.closest('select');
    if (!sel || !sel.dataset.field) return;
    browse[sel.dataset.field] = sel.value;
    favOnly = false;
    pageInfo.page = 1;
    loadSongs();
  });
  document.getElementById('clearBrowse').addEventListener('click', function() {
    for (var k in browse) browse[k] = '';
    var sels = browseRow.querySelectorAll('select');
    for (var i = 0; i < sels.length; i++) sels[i].value = '';
    searchInput.value = ''; searchQuery = '';
    favOnly = false; pageInfo.page = 1;
    loadSongs();
  });
  prevPageBtn.addEventListener('click', function() {
    if ((currentTab === 'songs' || currentTab === 'lyrics') && pageInfo.page > 1) { pageInfo.page--; loadSongs(); }
    else if (currentTab !== 'songs' && entityInfo.page > 1) { entityInfo.page--; loadEntities(); }
  });
  nextPageBtn.addEventListener('click', function() {
    if ((currentTab === 'songs' || currentTab === 'lyrics') && pageInfo.page < pageInfo.pages) { pageInfo.page++; loadSongs(); }
    else if (currentTab !== 'songs' && entityInfo.page < entityInfo.pages) { entityInfo.page++; loadEntities(); }
  });
  songGrid.addEventListener('click', function(e) {
    var dot = e.target.closest('.fav-dot');
    if (dot) return; // handled by rich handler below (avoids double toggle)
    var sc = e.target.closest('.song-card');
    var ec = e.target.closest('.entity-card');
    if (sc && sc.dataset.route) { openLyricsModal(sc.dataset.route); return; }
    if (ec) { jumpToEntitySongs(ec.dataset.kind, ec.dataset.name); }
  });
  songGrid.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    var sc = e.target.closest('.song-card');
    var ec = e.target.closest('.entity-card');
    if (sc && sc.dataset.route) openLyricsModal(sc.dataset.route);
    else if (ec) jumpToEntitySongs(ec.dataset.kind, ec.dataset.name);
  });
  closeModalBtn.addEventListener('click', closeLyricsModal);
  lyricsModal.addEventListener('click', function(e) { if (e.target === lyricsModal) closeLyricsModal(); });
  singAlongBtn.addEventListener('click', function() { closeLyricsModal(); openSingAlong(); });
  exitSingAlongBtn.addEventListener('click', closeSingAlong);
  singAlongModal.addEventListener('click', function(e) { if (e.target === singAlongModal) closeSingAlong(); });
  prevLineBtn.addEventListener('click', function() { navigateSingAlongLine(-1); });
  nextLineBtn.addEventListener('click', function() { navigateSingAlongLine(1); });
  copyLyricsBtn.addEventListener('click', copyLyrics);
  addFavoriteBtn.addEventListener('click', function() {
    if (!currentSong) return;
    toggleFavorite(currentSong.route || currentSong.id);
    updateFavoriteBtnState();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (lyricsModal.open) closeLyricsModal();
      if (singAlongModal.open) closeSingAlong();
    }
  });
}

var TABS = [
  { key: 'songs', label: 'Songs' },
  { key: 'lyrics', label: 'Lyrics' },
  { key: 'movies', label: 'Movies' },
  { key: 'singers', label: 'Singers' },
  { key: 'lyricists', label: 'Lyricists' },
  { key: 'actors', label: 'Actors' },
  { key: 'actresses', label: 'Actresses' },
  { key: 'music-directors', label: 'Music Directors' }
];
var ENTITY_ROUTE = {
  movies: '/api/movies', singers: '/api/singers', lyricists: '/api/lyricists',
  actors: '/api/actors', actresses: '/api/actresses', 'music-directors': '/api/music-directors'
};
var ENTITY_FIELD = {
  movies: 'movie', singers: 'singer', lyricists: 'lyricist',
  actors: 'actor', actresses: 'actress', 'music-directors': 'music_director'
};
function renderTabs() {
  var html = '';
  for (var i = 0; i < TABS.length; i++) {
    html += '<button class="category-btn' + (currentTab === TABS[i].key ? ' active' : '') + '" data-key="' + TABS[i].key + '">' + TABS[i].label + '</button>';
  }
  categoryList.innerHTML = html;
}
function switchTab(key) {
  currentTab = key;
  favOnly = false;
  pageInfo.page = 1; entityInfo.page = 1;
  renderTabs();
  browseRow.style.display = (key === 'songs' || key === 'lyrics') ? 'flex' : 'none';
  if (key === 'songs' || key === 'lyrics') loadSongs(); else loadEntities();
}
function loadStats() {
  apiGet('/api/stats').then(function(s) {
    statsCache = s;
    renderStatTiles(s);
    statsBar.textContent = 'Live localhost library · ' + fmtIN(s.songs) + ' songs · ' + fmtIN(s.movies) + ' movies · updated ' + (s.downloaded_at || '').slice(0, 10);
  }).catch(function() {
    getSample().then(function(S) {
      var st = { songs: S.songs.length, movies: deriveEntities(S, 'movies').length, singers: deriveEntities(S, 'singers').length, lyricists: deriveEntities(S, 'lyricists').length, downloaded_at: '' };
      renderStatTiles(st);
      statsBar.textContent = 'Demo sample · ' + fmtIN(S.songs.length) + ' songs (run localhost server for the full 19,080)';
    }).catch(function() { statsBar.textContent = 'Local data'; });
  });
}
function loadSongs() {
  songsHeading.textContent = 'Loading songs...';
  songGrid.innerHTML = skeletonHTML(8);
  emptyState.style.display = 'none'; pager.style.display = 'none'; if (typeof pagerTop !== 'undefined' && pagerTop) pagerTop.style.display = 'none';
  apiGet(buildSongsQuery(pageInfo.page)).then(function(d) {
    pageSongs = d.results;
    pageInfo.total = d.total; pageInfo.page = d.page; pageInfo.pages = d.pages;
    renderSongs();
  }).catch(function() {
    songsHeading.textContent = 'Start server: node D:\\Murugan\\server.js';
  });
}
function loadEntities() {
  songsHeading.textContent = 'Loading...';
  songGrid.innerHTML = '';
  var q = ENTITY_ROUTE[currentTab] + '?page=' + entityInfo.page + '&limit=24';
  if (searchQuery) q += '&q=' + encodeURIComponent(searchQuery);
  apiGet(q).then(function(d) {
    entityItems = d.results;
    entityInfo.total = d.total; entityInfo.page = d.page; entityInfo.pages = d.pages;
    renderEntities();
  }).catch(function() { songsHeading.textContent = 'Start server first'; });
}

function renderSongs() {
  var n = pageInfo.total;
  var _label = currentTab === 'lyrics' ? 'Lyrics' : 'All songs';
  songsHeading.textContent = (searchQuery ? n.toLocaleString('en-IN') + ' results in ' + _label.toLowerCase() : _label + ' · ' + n.toLocaleString('en-IN'));
  if (!pageSongs.length) {
    songGrid.style.display = 'none'; emptyState.style.display = 'block'; pager.style.display = 'none';
    return;
  }
  songGrid.style.display = 'grid'; emptyState.style.display = 'none'; pager.style.display = 'flex';
  var html = '';
  for (var i = 0; i < pageSongs.length; i++) {
    var s = pageSongs[i];
    var mv = (s.movie && s.movie.name) ? s.movie.name : '';
    var yr = (s.movie && s.movie.year) ? ' · ' + s.movie.year : '';
    var sg = (s.singers && s.singers.length) ? s.singers.slice(0, 2).join(', ') : '';
    var route = s.route || s.id;
    html += '<article class="song-card' + (i === 0 ? ' featured' : '') + '" data-route="' + escapeAttr(route) + '" tabindex="0" role="button" aria-label="View lyrics for ' + escapeAttr(s.title) + '">';
    html += cardArtHTML(s);
    html += favBadgeHTML(route);
    html += '<div class="card-body">';
    html += '<h3 class="song-title">' + escapeHtml(s.title) + '</h3>';
    html += '<p class="song-meta">' + escapeHtml(mv + yr) + '</p>';
    if (currentTab === 'lyrics' && s.snippet) html += '<p class="lyric-snippet">' + escapeHtml(s.snippet) + '…</p>';
    html += '<div class="song-tags">';
    if (sg) html += '<span class="song-tag">' + escapeHtml(sg) + '</span>';
    if (s.lyricist && s.lyricist.length) html += '<span class="song-tag">Lyrics: ' + escapeHtml(s.lyricist[0]) + '</span>';
    html += '</div></div></article>';
  }
  songGrid.innerHTML = html;
  syncPagers(n, pageInfo.page, pageInfo.pages);
  resultsSub.textContent = searchQuery ? 'Matching title, film, singer, lyricist.' : 'Page ' + pageInfo.page + ' · newest additions first.';
}
function renderEntities() {
  songsHeading.textContent = entityLabel(currentTab) + ' · ' + entityInfo.total.toLocaleString('en-IN');
  if (!entityItems.length) {
    songGrid.style.display = 'none'; emptyState.style.display = 'block'; pager.style.display = 'none';
    return;
  }
  songGrid.style.display = 'grid'; emptyState.style.display = 'none'; pager.style.display = 'flex';
  var html = '';
  for (var i = 0; i < entityItems.length; i++) {
    var e = entityItems[i];
    var nm = e.title || e.name || '';
    var cnt = (typeof e.songcount !== 'undefined' && e.songcount !== null) ? e.songcount + ' songs' : '';
    html += '<article class="song-card entity-card' + (i === 0 ? ' featured' : '') + '" data-kind="' + currentTab + '" data-name="' + escapeAttr(nm) + '" tabindex="0" role="button" aria-label="View songs for ' + escapeAttr(nm) + '">';
    if (e.avatar) html += '<div class="card-top"><img class="card-art entity-img" loading="lazy" src="' + escapeAttr(e.avatar) + '" alt=""></div>';
    else html += '<div class="card-top"><div class="card-art-fallback">' + escapeHtml(nm.charAt(0)) + '</div></div>';
    html += '<div class="card-body">';
    html += '<h3 class="song-title">' + escapeHtml(nm) + '</h3>';
    html += '<p class="song-meta">' + escapeHtml(cnt) + '</p>';
    html += '</div></article>';
  }
  songGrid.innerHTML = html;
  syncPagers(entityInfo.total, entityInfo.page, entityInfo.pages);
}
function entityLabel(k) {
  for (var i = 0; i < TABS.length; i++) if (TABS[i].key === k) return TABS[i].label;
  return k;
}
function jumpToEntitySongs(kind, name) {
  var field = ENTITY_FIELD[kind];
  if (!field) return;
  for (var k in browse) browse[k] = '';
  browse[field] = name;
  searchInput.value = ''; searchQuery = '';
  switchTab('songs');
}

function openLyricsModal(route) {
  if (!route || route === 'undefined') { showToast('Pick a song first'); return; }
  modalTitle.textContent = 'Loading...';
  modalLyrics.innerHTML = '';
  lyricsModal.showModal();
  apiGet('/api/song/' + encodeURIComponent(route)).then(function(s) {
    currentSong = s;
    modalTitle.textContent = s.title;
    var mv = (s.movie && s.movie.name) ? s.movie.name : '';
    var yr = (s.movie && s.movie.year) ? ' · ' + s.movie.year : '';
    modalMeta.textContent = mv + yr;
    modalCredits.innerHTML = creditChipsHTML(s);
    var poster = document.getElementById('modalPoster');
    if (poster) {
      if (s.movie && s.movie.avatar) { poster.src = s.movie.avatar; poster.style.display = 'block'; }
      else poster.style.display = 'none';
    }
    var lines = (s.lyrics || '').split('\n');
    var html = '';
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim()) html += '<p>' + escapeHtml(lines[i]) + '</p>';
    }
    modalLyrics.innerHTML = html || '<p>No lyrics available.</p>';
    modalYT.style.display = s.youtube_url ? 'inline-block' : 'none';
    modalYT.href = s.youtube_url || '#';
    updateFavoriteBtnState();
  }).catch(function() { modalTitle.textContent = 'Failed to load'; });
}
function closeLyricsModal() { lyricsModal.close(); currentSong = null; }
function toggleFavorite(route) {
  if (favorites[route]) delete favorites[route];
  else {
    var found = null;
    for (var i = 0; i < pageSongs.length; i++) {
      if ((pageSongs[i].route || pageSongs[i].id) === route) found = pageSongs[i];
    }
    favorites[route] = found ? found.title : route;
  }
  try { localStorage.setItem('tamilLyricsFavs', JSON.stringify(favorites)); } catch (e) {}
  if (favOnly) renderFavorites(); else renderSongs();
  if (currentSong && (currentSong.route || currentSong.id) === route) updateFavoriteBtnState();
}
function renderFavorites() {
  var keys = Object.keys(favorites);
  songsHeading.textContent = 'Favorites · ' + keys.length;
  if (!keys.length) {
    songGrid.style.display = 'none'; emptyState.style.display = 'block'; pager.style.display = 'none';
    return;
  }
  songGrid.style.display = 'grid'; emptyState.style.display = 'none'; pager.style.display = 'none';
  var html = '';
  for (var i = 0; i < keys.length; i++) {
    var rt = keys[i];
    html += '<article class="song-card" data-route="' + escapeAttr(rt) + '" tabindex="0" role="button">';
    html += '<div class="favorite-badge">Saved</div>';
    html += '<h3 class="song-title">' + escapeHtml(favorites[rt]) + '</h3>';
    html += '</article>';
  }
  songGrid.innerHTML = html;
}
function updateFavoriteBtnState() {
  if (!currentSong) return;
  var rt = currentSong.route || currentSong.id;
  addFavoriteBtn.textContent = favorites[rt] ? 'Saved' : 'Save';
}

function openSingAlong() {
  if (!currentSong) return;
  singAlongTitle.textContent = currentSong.title;
  singAlongLineIndex = 0;
  var lines = (currentSong.lyrics || '').split('\n').filter(function(l) { return l.trim(); });
  currentLine.textContent = lines[0] || '';
  fullLyrics.textContent = currentSong.lyrics || '';
  singAlongModal.showModal();
}
function closeSingAlong() { singAlongModal.close(); }
function navigateSingAlongLine(delta) {
  if (!currentSong) return;
  var lines = (currentSong.lyrics || '').split('\n').filter(function(l) { return l.trim(); });
  singAlongLineIndex = Math.max(0, Math.min(lines.length - 1, singAlongLineIndex + delta));
  currentLine.textContent = lines[singAlongLineIndex] || '';
}
function copyLyrics() {
  if (!currentSong) return;
  var s = currentSong;
  var mv = (s.movie && s.movie.name) ? s.movie.name : '';
  var text = s.title + '\n' + mv + '\n\n' + (s.lyrics || '');
  navigator.clipboard.writeText(text)
    .then(function() { showToast('Lyrics copied'); })
    .catch(function() { showToast('Copy failed'); });
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}
function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = (text === null || text === undefined) ? '' : String(text);
  return div.innerHTML;
}
function escapeAttr(text) {
  return escapeHtml(text).replace(/"/g, '&quot;');
}

function fillSelect(field, items) {
  var sel = browseRow.querySelector('select[data-field="' + field + '"]');
  if (!sel) return;
  var cur = browse[field] || '';
  sel.innerHTML = '<option value="">All ' + field + 's</option>';
  for (var i = 0; i < items.length; i++) {
    var nm = items[i].name || items[i].title || '';
    if (!nm) continue;
    var opt = document.createElement('option');
    opt.value = nm; opt.textContent = nm + (items[i].songcount ? ' (' + items[i].songcount + ')' : '');
    sel.appendChild(opt);
  }
  sel.value = cur;
}
function loadBrowseOptions() {
  apiGet('/api/movies?limit=100').then(function(d) { fillSelect('movie', d.results); }).catch(function() {});
  apiGet('/api/singers?limit=100').then(function(d) { fillSelect('singer', d.results); }).catch(function() {});
  apiGet('/api/lyricists?limit=100').then(function(d) { fillSelect('lyricist', d.results); }).catch(function() {});
}
loadBrowseOptions();

var statTiles = document.getElementById('statTiles');
var spotlightEl = document.getElementById('heroSpotlight');
var themeToggle = document.getElementById('themeToggle');
var resultsSub = document.getElementById('resultsSub');
var pagerTop = document.getElementById('pagerTop');
function fmtIN(n) { return Number(n || 0).toLocaleString('en-IN'); }
function setTheme(dark) {
  document.body.classList.toggle('dark', !!dark);
  if (typeof themeToggle !== 'undefined' && themeToggle) themeToggle.textContent = dark ? 'ON' : 'OFF';
  try { localStorage.setItem('isaiPadalTheme', dark ? 'dark' : 'light'); } catch (e) {}
}
function cardArtHTML(s, big) {
  var img = (s.movie && s.movie.avatar) ? s.movie.avatar : '';
  var letter = (s.title || '?').charAt(0);
  if (img) return '<div class="card-top"><img class="card-art" loading="lazy" src="' + escapeAttr(img) + '" alt=""></div>';
  return '<div class="card-top"><div class="card-art-fallback">' + escapeHtml(letter) + '</div></div>';
}
function favBadgeHTML(route) {
  return '<div class="favorite-badge">' + (favorites[route] ? 'Saved' : '') + '</div><div class="fav-dot" role="button" tabindex="0" aria-label="Toggle favorite">' + (favorites[route] ? '&#9733;' : '&#9734;') + '</div>';
}
function renderStatTiles(s) {
  if (typeof statTiles === 'undefined' || !statTiles) return;
  var tiles = [
    [s.songs, 'Songs'], [s.movies, 'Movies'],
    [s.singers, 'Singers'], [s.lyricists, 'Lyricists']
  ];
  var html = '';
  for (var i = 0; i < tiles.length; i++) {
    html += '<div class="stat-tile"><b>' + fmtIN(tiles[i][0]) + '</b><span>' + tiles[i][1] + '</span></div>';
  }
  statTiles.innerHTML = html;
}
function renderSpotlight(s) {
  if (!s) { spotlightEl.innerHTML = '<p class="spot-meta">Loading picks...</p>'; return; }
  var mv = (s.movie && s.movie.name) ? s.movie.name : '';
  var img = (s.movie && s.movie.avatar) ? '<img class="spot-poster" src="' + escapeAttr(s.movie.avatar) + '" alt="">' : '';
  var sg = (s.singers && s.singers.length) ? s.singers.slice(0, 3).join(', ') : '';
  spotlightEl.innerHTML = img + '<h3 class="spot-title">' + escapeHtml(s.title) + '</h3>' +
    '<p class="spot-meta">' + escapeHtml(mv) + '</p>' +
    (sg ? '<p class="spot-credits">' + escapeHtml(sg) + '</p>' : '') +
    '<button class="btn btn-outline" data-spot-route="' + escapeAttr(s.route || s.id) + '" type="button">Read lyrics</button>';
}
function loadSpotlight() {
  renderSpotlight(null);
  apiGet('/api/songs?limit=24').then(function(d) {
    if (d.results && d.results.length) {
      var withArt = d.results.filter(function(s) { return s.movie && s.movie.avatar; });
      var pool = withArt.length ? withArt : d.results;
      renderSpotlight(pool[Math.floor(Math.random() * pool.length)]);
    }
  }).catch(function() {});
}
function skeletonHTML(n) {
  var html = '';
  for (var i = 0; i < (n || 8); i++) html += '<div class="skel"></div>';
  return html;
}
function syncPagers(total, page, pages) {
  var label = 'Page ' + page + ' of ' + pages + ' · ' + fmtIN(total);
  pageInfoEl.textContent = label;
  var top = document.getElementById('pageInfoTop');
  if (top) top.textContent = label;
  prevPageBtn.disabled = page <= 1; nextPageBtn.disabled = page >= pages;
  var pt = document.getElementById('prevPageTop'), nt = document.getElementById('nextPageTop');
  if (pt) pt.disabled = page <= 1;
  if (nt) nt.disabled = page >= pages;
  var show = pages > 1;
  pager.style.display = show ? 'flex' : 'none';
  pagerTop.style.display = show ? 'flex' : 'none';
}
function creditChipsHTML(s) {
  function chip(label, val) {
    return '<span class="chip">' + escapeHtml(label + ': ' + val) + '</span>';
  }
  var html = '';
  if (s.singers && s.singers.length) html += chip('Singer', s.singers.slice(0, 3).join(', '));
  if (s.lyricist && s.lyricist.length) html += chip('Lyrics', s.lyricist.slice(0, 2).join(', '));
  if (s.music_director && s.music_director.length) html += chip('Music', s.music_director.slice(0, 2).join(', '));
  if (s.movie && s.movie.year) html += chip('Year', s.movie.year);
  return html;
}
function bindRichEvents() {
  themeToggle.addEventListener('click', function() {
    setTheme(!document.body.classList.contains('dark'));
  });
  var _sur = document.getElementById('surpriseBtn');
  if (_sur) _sur.addEventListener('click', function() {
    var total = pageInfo.total || 19080;
    var rnd = 1 + Math.floor(Math.random() * Math.min(total, 19080));
    apiGet('/api/songs?page=' + Math.ceil(rnd / 24) + '&limit=24').then(function(d) {
      var pick = d.results[rnd % d.results.length] || d.results[0];
      if (pick) openLyricsModal(pick.route || pick.id);
    }).catch(function() { showToast('Try again in a moment'); });
  });
  if (typeof spotlightEl !== 'undefined' && spotlightEl) spotlightEl.addEventListener('click', function(e) {
    var b = e.target.closest('[data-spot-route]');
    if (b) openLyricsModal(b.dataset.spotRoute);
  });
  songGrid.addEventListener('click', function(e) {
    var dot = e.target.closest('.fav-dot');
    if (dot) {
      var card = dot.closest('.song-card');
      if (card) { e.stopPropagation(); toggleFavorite(card.dataset.route); }
    }
  });
  function goTop(dir) {
    if ((currentTab === 'songs' || currentTab === 'lyrics') && ((dir < 0 && pageInfo.page > 1) || (dir > 0 && pageInfo.page < pageInfo.pages))) {
      pageInfo.page += dir; loadSongs(); window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentTab !== 'songs' && ((dir < 0 && entityInfo.page > 1) || (dir > 0 && entityInfo.page < entityInfo.pages))) {
      entityInfo.page += dir; loadEntities(); window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  var _pt = document.getElementById('prevPageTop');
  if (_pt) _pt.addEventListener('click', function() { goTop(-1); });
  var _nt = document.getElementById('nextPageTop');
  if (_nt) _nt.addEventListener('click', function() { goTop(1); });
}

function renderQuickRow() {
  var el = document.getElementById('quickRow');
  if (!el) return;
  var picks = ['A. R. Rahman', 'Anirudh Ravichander', 'Mersal', 'Vairamuthu', 'Shreya Ghoshal', 'Yuvan Shankar Raja'];
  var html = '';
  for (var i = 0; i < picks.length; i++) {
    html += '<button class="quick-chip" data-q="' + escapeAttr(picks[i]) + '" type="button">' + escapeHtml(picks[i]) + '</button>';
  }
  el.innerHTML = html;
  el.addEventListener('click', function(e) {
    var b = e.target.closest('.quick-chip');
    if (!b) return;
    searchInput.value = b.dataset.q;
    searchQuery = b.dataset.q.toLowerCase();
    favOnly = false;
    if (currentTab !== 'songs') switchTabSilent('songs');
    pageInfo.page = 1;
    loadSongs();
    document.getElementById('songs').scrollIntoView({ behavior: 'smooth' });
  });
}
function switchTabSilent(key) {
  currentTab = key;
  renderTabs();
  browseRow.style.display = (key === 'songs' || key === 'lyrics') ? 'flex' : 'none';
}

// ---- boot (must stay last: all helpers/elements declared above) ----
init();

// ---- Lyrics menu nav wiring + GitHub Pages demo fallback ----
(function() {
  var nav = document.querySelector('.nav-primary');
  if (nav) nav.addEventListener('click', function(e) {
    var a = e.target && e.target.closest ? e.target.closest('[data-tab]') : null;
    if (!a) return;
    e.preventDefault();
    switchTab(a.dataset.tab);
    var tgt = document.getElementById(a.dataset.tab === 'singers' || a.dataset.tab === 'movies' ? 'categories' : 'songs');
    if (tgt && tgt.scrollIntoView) tgt.scrollIntoView({ behavior: 'smooth' });
  });
})();

var SAMPLE_CACHE = null;
function getSample() {
  if (SAMPLE_CACHE) return Promise.resolve(SAMPLE_CACHE);
  return fetch('sample-data.json').then(function(r) {
    if (!r.ok) throw new Error('no sample');
    return r.json();
  }).then(function(j) { SAMPLE_CACHE = j; return j; });
}
var _apiGetRaw = apiGet;
apiGet = function(path) {
  return _apiGetRaw(path).catch(function() {
    return getSample().then(function(S) { return sampleRoute(S, path); });
  });
};
function sampleHay(s) {
  return [s.title, s.route, s.movie && s.movie.name,
    (s.singers || []).join(' '), (s.lyricist || []).join(' '),
    (s.music_director || []).join(' '), (s.actors || []).join(' '),
    (s.actresses || []).join(' ')].filter(Boolean).join(' ').toLowerCase();
}
function sampleCard(s) {
  return { id: s.id, title: s.title, route: s.route, published_on: s.published_on,
    movie: s.movie, music_director: s.music_director, lyricist: s.lyricist,
    singers: s.singers, actors: s.actors, actresses: s.actresses,
    tags: [], youtube_url: s.youtube_url, audio_url: null,
    has_lyrics: !!(s.lyrics && s.lyrics.length > 20),
    snippet: (s.lyrics || '').replace(/\s+/g, ' ').trim().slice(0, 160) };
}
function samplePaginate(arr, page, limit, map) {
  page = Math.max(1, page || 1); limit = Math.min(100, Math.max(1, limit || 24));
  return { total: arr.length, page: page, limit: limit,
    pages: Math.max(1, Math.ceil(arr.length / limit)),
    results: arr.slice((page - 1) * limit, page * limit).map(map || function(x) { return x; }) };
}

function deriveEntities(S, kind) {
  var seen = {};
  for (var i = 0; i < S.songs.length; i++) {
    var s = S.songs[i];
    if (kind === 'movies') {
      var m = s.movie || {};
      var k = m.route || m.name;
      if (!k) continue;
      if (!seen[k]) seen[k] = { name: m.name, title: m.name, route: m.route, avatar: m.avatar || null, year: m.year || null, songcount: 0 };
      seen[k].songcount++;
    } else {
      var field = kind === 'singers' ? 'singers' : kind === 'lyricists' ? 'lyricist'
        : kind === 'actors' ? 'actors' : kind === 'actresses' ? 'actresses' : 'music_director';
      var list = s[field] || [];
      for (var j = 0; j < list.length; j++) {
        var nm = list[j];
        if (!nm) continue;
        if (!seen[nm]) seen[nm] = { name: nm, title: nm, route: nm, avatar: null, songcount: 0 };
        seen[nm].songcount++;
      }
    }
  }
  return Object.keys(seen).map(function(k) { return seen[k]; })
    .sort(function(a, b) { return (b.songcount || 0) - (a.songcount || 0); });
}
function sampleRoute(S, path) {
  var u = new URL(path, 'http://demo/');
  var p = u.pathname, qp = u.searchParams;
  function g(n) { return qp.get(n) || ''; }
  if (p === '/api/stats') {
    return { songs: S.songs.length, movies: deriveEntities(S, 'movies').length,
      singers: deriveEntities(S, 'singers').length, lyricists: deriveEntities(S, 'lyricists').length,
      actors: deriveEntities(S, 'actors').length, actresses: deriveEntities(S, 'actresses').length,
      music_directors: deriveEntities(S, 'music-directors').length,
      source: 'demo sample (sample-data.json)', downloaded_at: '' };
  }
  if (p === '/api/songs') {
    var kw = g('q').toLowerCase(), lq = g('lq').toLowerCase();
    var mv = g('movie').toLowerCase(), sg = g('singer').toLowerCase(), ly = g('lyricist').toLowerCase();
    var ac = g('actor').toLowerCase(), as = g('actress').toLowerCase(), md = g('music_director').toLowerCase();
    var out = S.songs.filter(function(s) {
      if (kw) {
        var h = sampleHay(s);
        var words = kw.split(/\s+/).filter(Boolean);
        var ok = h.indexOf(kw) >= 0 || words.every(function(w) { return h.indexOf(w) >= 0; });
        if (!ok) return false;
      }
      if (lq && (s.lyrics || '').toLowerCase().indexOf(lq) < 0) return false;
      if (mv && (!s.movie || (s.movie.name || '').toLowerCase().indexOf(mv) < 0)) return false;
      if (sg && (s.singers || []).join(' ').toLowerCase().indexOf(sg) < 0) return false;
      if (ly && (s.lyricist || []).join(' ').toLowerCase().indexOf(ly) < 0) return false;
      if (ac && (s.actors || []).join(' ').toLowerCase().indexOf(ac) < 0) return false;
      if (as && (s.actresses || []).join(' ').toLowerCase().indexOf(as) < 0) return false;
      if (md && (s.music_director || []).join(' ').toLowerCase().indexOf(md) < 0) return false;
      return true;
    });
    return samplePaginate(out, parseInt(g('page') || '1', 10), parseInt(g('limit') || '24', 10), sampleCard);
  }
  if (p.indexOf('/api/song/') === 0) {
    var key = decodeURIComponent(p.slice(10));
    for (var i = 0; i < S.songs.length; i++) {
      if (S.songs[i].id === key || S.songs[i].route === key) return S.songs[i];
    }
    throw new Error('HTTP 404');
  }
  var kinds = { '/api/movies': 'movies', '/api/singers': 'singers', '/api/lyricists': 'lyricists', '/api/actors': 'actors', '/api/actresses': 'actresses', '/api/music-directors': 'music-directors' };
  if (kinds[p]) {
    var arr = deriveEntities(S, kinds[p]);
    var kq = g('q').toLowerCase();
    if (kq) arr = arr.filter(function(e) { return ((e.name || e.title || '') + ' ' + (e.route || '')).toLowerCase().indexOf(kq) >= 0; });
    return samplePaginate(arr, parseInt(g('page') || '1', 10), parseInt(g('limit') || '24', 10));
  }
  throw new Error('HTTP 404');
}

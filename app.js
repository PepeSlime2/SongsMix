const API_URL = 'https://songsmix.onrender.com';
const state = { tracks: [], filtered: [], currentIndex: -1, isPlaying: false, favorites: new Set(JSON.parse(localStorage.getItem('mixtape-favorites') || '[]')), audioContext: null, oscillator: null, gain: null, timer: null, startedAt: 0, elapsed: 0 };

const elements = {
  grid: document.querySelector('#music-grid'), empty: document.querySelector('#empty-state'), search: document.querySelector('#search-input'), decade: document.querySelector('#decade-select'), genre: document.querySelector('#genre-select'), decadePills: document.querySelector('#decade-pills'), status: document.querySelector('#status-message'), total: document.querySelector('#total-count'), decades: document.querySelector('#decade-count'), genres: document.querySelector('#genre-count'), playerTitle: document.querySelector('#player-title'), playerArtist: document.querySelector('#player-artist'), play: document.querySelector('#play-button'), previous: document.querySelector('#previous-button'), next: document.querySelector('#next-button'), favorite: document.querySelector('#favorite-button'), progress: document.querySelector('#progress-bar'), currentTime: document.querySelector('#current-time'), trackTime: document.querySelector('#track-time'), videoModal: document.querySelector('#video-modal'), videoFrame: document.querySelector('#youtube-frame'), videoTitle: document.querySelector('#video-title'), closeVideo: document.querySelector('#close-video')
};

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const decadeOf = (year) => Math.floor(year / 10) * 10;
const youtubeEmbedUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    const videoId = parsedUrl.hostname.includes('youtu.be') ? parsedUrl.pathname.slice(1) : parsedUrl.searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';
  } catch (error) {
    return '';
  }
};

async function loadTracks() {
  try {
    const response = await fetch(`${API_URL}/musicas`);
    if (!response.ok) throw new Error('API indisponível');
    state.tracks = await response.json();
    buildFilters();
    renderTracks();
    elements.status.textContent = '● catálogo sincronizado';
  } catch (error) {
    elements.status.textContent = '○ central offline';
    elements.grid.innerHTML = '<div class="loading-card">NÃO FOI POSSÍVEL SINTONIZAR.<span>inicie a API REST na porta 3000</span></div>';
  }
}

function buildFilters() {
  const decades = [...new Set(state.tracks.map((track) => decadeOf(track.ano)))].sort((a, b) => a - b);
  const genres = [...new Set(state.tracks.map((track) => track.genero))].sort();
  elements.decade.innerHTML = '<option value="all">TODAS</option>' + decades.map((decade) => `<option value="${decade}">${decade}</option>`).join('');
  elements.genre.innerHTML = '<option value="all">TODOS</option>' + genres.map((genre) => `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`).join('');
  elements.decadePills.innerHTML = decades.map((decade) => `<button class="decade-pill" data-decade="${decade}" type="button">${decade}s MIX</button>`).join('');
  elements.total.textContent = state.tracks.length;
  elements.decades.textContent = decades.length;
  elements.genres.textContent = genres.length;
}

function renderTracks() {
  const query = elements.search.value.trim().toLowerCase();
  const decade = elements.decade.value;
  const genre = elements.genre.value;
  state.filtered = state.tracks.filter((track) => {
    const matchesQuery = !query || `${track.titulo} ${track.artista}`.toLowerCase().includes(query);
    const matchesDecade = decade === 'all' || decadeOf(track.ano) === Number(decade);
    const matchesGenre = genre === 'all' || track.genero === genre;
    return matchesQuery && matchesDecade && matchesGenre;
  });
  elements.empty.hidden = state.filtered.length > 0;
  elements.grid.innerHTML = state.filtered.map((track) => `
    <article class="music-card">
      <div class="card-top"><div class="record-label">♫</div><div><span class="year">${track.ano}</span><button class="favorite ${state.favorites.has(track.id) ? 'is-favorite' : ''}" data-favorite="${track.id}" type="button" aria-label="Favoritar ${escapeHtml(track.titulo)}">♥</button></div></div>
      <h3>${escapeHtml(track.titulo)}</h3><p>${escapeHtml(track.artista)}</p><span class="genre-tag">${escapeHtml(track.genero)}</span>
      <button class="play-card" data-play="${track.id}" type="button" aria-label="Tocar ${escapeHtml(track.titulo)}">${track.youtubeUrl ? '▶' : '♫'}</button>
    </article>`).join('');
}

function selectTrack(trackId) {
  const index = state.filtered.findIndex((track) => track.id === Number(trackId));
  if (index < 0) return;
  state.currentIndex = index;
  state.isPlaying = true;
  const track = state.filtered[index];
  elements.playerTitle.textContent = track.titulo;
  elements.playerArtist.textContent = track.artista;
  elements.trackTime.textContent = formatTime(track.duracaoSegundos);
  elements.currentTime.textContent = '00:00';
  elements.progress.style.width = '0%';
  elements.play.textContent = 'Ⅱ';
  elements.favorite.textContent = state.favorites.has(track.id) ? '♥' : '♡';
  const embedUrl = track.youtubeUrl ? youtubeEmbedUrl(track.youtubeUrl) : '';
  if (embedUrl) openYouTube(track, embedUrl);
  else startPreview(track);
  document.querySelector('.player').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function openYouTube(track, embedUrl) {
  stopPreview();
  elements.videoTitle.textContent = `${track.titulo} // ${track.artista}`;
  elements.videoFrame.src = embedUrl;
  elements.videoModal.hidden = false;
}

function closeYouTube() {
  elements.videoModal.hidden = true;
  elements.videoFrame.src = '';
}

function stopPreview() {
  if (state.timer) window.clearInterval(state.timer);
  state.timer = null;
  if (state.oscillator) state.oscillator.stop();
  state.oscillator = null;
  state.gain = null;
}

function startPreview(track) {
  stopPreview();
  state.audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  state.audioContext.resume();
  state.oscillator = state.audioContext.createOscillator();
  state.gain = state.audioContext.createGain();
  state.oscillator.type = 'square';
  state.oscillator.frequency.value = 160 + ((track.ano + track.id * 17) % 260);
  state.gain.gain.value = 0.035;
  state.oscillator.connect(state.gain).connect(state.audioContext.destination);
  state.oscillator.start();
  state.startedAt = Date.now();
  state.elapsed = 0;
  state.timer = window.setInterval(() => {
    state.elapsed = Math.min(track.duracaoSegundos, Math.floor((Date.now() - state.startedAt) / 1000));
    elements.currentTime.textContent = formatTime(state.elapsed);
    elements.progress.style.width = `${(state.elapsed / track.duracaoSegundos) * 100}%`;
    if (state.elapsed >= track.duracaoSegundos) selectTrack(state.filtered[(state.currentIndex + 1) % state.filtered.length].id);
  }, 250);
}

function toggleFavorite(trackId) {
  const id = Number(trackId);
  state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
  localStorage.setItem('mixtape-favorites', JSON.stringify([...state.favorites]));
  renderTracks();
  if (state.currentIndex >= 0) elements.favorite.textContent = state.favorites.has(state.filtered[state.currentIndex].id) ? '♥' : '♡';
}

elements.search.addEventListener('input', renderTracks);
elements.decade.addEventListener('change', renderTracks);
elements.genre.addEventListener('change', renderTracks);
elements.grid.addEventListener('click', (event) => { const playId = event.target.closest('[data-play]')?.dataset.play; const favoriteId = event.target.closest('[data-favorite]')?.dataset.favorite; if (playId) selectTrack(playId); if (favoriteId) toggleFavorite(favoriteId); });
elements.decadePills.addEventListener('click', (event) => { const pill = event.target.closest('[data-decade]'); if (!pill) return; elements.decade.value = pill.dataset.decade; document.querySelector('#catalogo').scrollIntoView({ behavior: 'smooth' }); renderTracks(); });
elements.play.addEventListener('click', () => { if (state.currentIndex < 0 && state.filtered.length) selectTrack(state.filtered[0].id); else if (state.currentIndex >= 0) { state.isPlaying = !state.isPlaying; elements.play.textContent = state.isPlaying ? 'Ⅱ' : '▶'; if (state.isPlaying) startPreview(state.filtered[state.currentIndex]); else stopPreview(); } });
elements.previous.addEventListener('click', () => { if (!state.filtered.length) return; selectTrack(state.filtered[(state.currentIndex - 1 + state.filtered.length) % state.filtered.length].id); });
elements.next.addEventListener('click', () => { if (!state.filtered.length) return; selectTrack(state.filtered[(state.currentIndex + 1) % state.filtered.length].id); });
elements.favorite.addEventListener('click', () => { if (state.currentIndex >= 0) toggleFavorite(state.filtered[state.currentIndex].id); });
elements.closeVideo.addEventListener('click', closeYouTube);
elements.videoModal.addEventListener('click', (event) => { if (event.target === elements.videoModal) closeYouTube(); });

loadTracks();
// code for API-related functions
// All music data comes from the free iTunes Search API (no key needed).
// iTunes gives 30-second previews of every song, not full tracks.

const TOP_ARTISTS = ["Nicki Minaj", "Lil Wayne", "Drake", "Future", "The Notorious B.I.G.", "2Pac"];
const PLAYLIST_KEY = "core-playlist";

// ---------- helpers ----------

// fetch from iTunes, but give up after 10 seconds so the page never hangs on "Loading..."
async function itunes(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`https://itunes.apple.com/${path}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`iTunes answered ${response.status}`);
    return (await response.json()).results;
  } finally {
    clearTimeout(timer);
  }
}

// iTunes sends 100px covers; the same URL works at bigger sizes
function cover(url, size = 300) {
  return url ? url.replace("100x100bb", `${size}x${size}bb`) : "";
}

// small helper to build elements safely (text from iTunes is set as text, never as HTML)
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function img(src, alt) {
  const image = el("img");
  image.src = src;
  image.alt = alt;
  image.loading = "lazy";
  return image;
}

function previewPlayer(url) {
  const audio = el("audio");
  audio.controls = true;
  audio.preload = "none";
  audio.src = url;
  return audio;
}

// only one preview plays at a time: starting one pauses the rest
document.addEventListener("play", (event) => {
  document.querySelectorAll("audio").forEach((audio) => {
    if (audio !== event.target) audio.pause();
  });
}, true);

// ---------- cards ----------

// a song: cover, title, artist, 30-second preview, and "+ Playlist"
function makeSongCard(song) {
  const card = el("div", "record-card song-card");
  card.append(img(cover(song.artworkUrl100), `${song.collectionName} cover`));
  card.append(el("p", "card-title", song.trackName));
  card.append(el("p", "card-artist", song.artistName));
  if (song.previewUrl) card.append(previewPlayer(song.previewUrl));

  const actions = el("div", "card-actions");
  actions.append(makePlaylistButton(song));
  const albumLink = el("a", null, "See album");
  albumLink.href = `record.html?album=${song.collectionId}`;
  actions.append(albumLink);
  card.append(actions);
  return card;
}

function makePlaylistButton(song) {
  const add = el("button", "playlist-add", inPlaylist(song.trackId) ? "✓ In playlist" : "+ Playlist");
  add.addEventListener("click", () => {
    addToPlaylist(song);
    add.textContent = "✓ In playlist";
  });
  return add;
}

// an album: big cover and a link to see and hear every song on it
function makeAlbumCard(album) {
  const link = el("a", "record-card album-card");
  link.href = `record.html?album=${album.collectionId}`;
  link.append(img(cover(album.artworkUrl100), `${album.collectionName} cover`));
  link.append(el("p", "card-title", album.collectionName));
  link.append(el("p", "card-artist", `${album.artistName} · ${(album.releaseDate || "").slice(0, 4)}`));
  link.append(el("span", "card-link", "See all songs →"));
  return link;
}

// ---------- search ----------

// search iTunes for songs by the artist the user typed in
async function fetchMusic(searchKeyWord) {
  const results = document.querySelector(".results");
  results.textContent = "Searching...";
  try {
    const songs = await itunes(`search?term=${searchKeyWord}&entity=song&limit=12`);
    results.textContent = "";
    if (songs.length === 0) {
      results.textContent = "No songs found. Try another artist.";
      return;
    }
    songs.forEach((song) => results.append(makeSongCard(song)));
  } catch (error) {
    results.textContent = "Could not reach iTunes. Please try again.";
    console.error("iTunes Error:", error);
  }
}

// ---------- Load Records ----------

// shows one album for each artist in the Top Artist list.
// Each cover appears as soon as its artist answers, so one slow request can't block the rest.
function loadTopRecords() {
  const container = document.querySelector("#recordsContainer");
  container.textContent = "";
  document.querySelector(".records-status")?.remove();
  const status = el("p", "records-status", "Loading records...");
  container.before(status);

  let loaded = 0;
  const requests = TOP_ARTISTS.map(async (artist) => {
    try {
      // ask for several albums and keep a full album by the artist (not a single, and not just featuring them)
      const albums = await itunes(`search?term=${encodeURIComponent(artist)}&entity=album&limit=25`);
      const byArtist = albums.filter((a) => a.artistName.toLowerCase() === artist.toLowerCase());
      const album = byArtist.find((a) => a.trackCount > 4) || byArtist[0] || albums[0];
      if (album) {
        container.append(makeAlbumCard(album));
        loaded++;
      }
    } catch (error) {
      console.error(`iTunes Error for ${artist}:`, error);
    }
  });

  Promise.all(requests).then(() => {
    status.textContent = loaded === 0
      ? "Could not load records. Please try again."
      : loaded < TOP_ARTISTS.length ? "Some records didn't load. Try again for the rest." : "";
    if (!status.textContent) status.remove();
  });
}

// ---------- album and song lookups (record.html) ----------

// one album plus every song on it
async function fetchAlbum(collectionId) {
  const results = await itunes(`lookup?id=${collectionId}&entity=song`);
  const album = results.find((r) => r.wrapperType === "collection");
  const songs = results.filter((r) => r.wrapperType === "track" && r.kind === "song");
  return { album, songs };
}

// look up a single song or album by its iTunes id
async function fetchRecordById(id) {
  const results = await itunes(`lookup?id=${id}`);
  return results[0];
}

// ---------- My Playlist (saved in this browser) ----------

function getPlaylist() {
  try {
    return JSON.parse(localStorage.getItem(PLAYLIST_KEY)) || [];
  } catch {
    return [];
  }
}

function savePlaylist(songs) {
  try {
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(songs));
  } catch {
    // storage can be blocked (private browsing); the playlist just won't be saved
  }
  renderPlaylist();
}

function inPlaylist(trackId) {
  return getPlaylist().some((song) => song.trackId === trackId);
}

function addToPlaylist(song) {
  if (inPlaylist(song.trackId)) return;
  const { trackId, trackName, artistName, collectionName, collectionId, artworkUrl100, previewUrl } = song;
  savePlaylist([...getPlaylist(), { trackId, trackName, artistName, collectionName, collectionId, artworkUrl100, previewUrl }]);
}

function removeFromPlaylist(trackId) {
  savePlaylist(getPlaylist().filter((song) => song.trackId !== trackId));
}

// draws the playlist into #playlist if the page has one
function renderPlaylist() {
  const box = document.querySelector("#playlist");
  if (!box) return;
  const songs = getPlaylist();
  box.textContent = "";

  const head = el("div", "playlist-head");
  head.append(el("h2", null, `My Playlist (${songs.length})`));
  if (songs.length) {
    const playAll = el("button", "btn play-all", "▶ Play all");
    playAll.addEventListener("click", () => box.querySelector("audio")?.play());
    head.append(playAll);
  }
  box.append(head);

  if (!songs.length) {
    box.append(el("p", "empty", "Search for a song or open an album, then tap \"+ Playlist\" to save it here."));
    return;
  }

  const list = el("ol", "playlist-list");
  songs.forEach((song, index) => {
    const row = el("li", "playlist-row");
    row.append(img(cover(song.artworkUrl100, 100), ""));
    const info = el("div", "playlist-info");
    info.append(el("p", "card-title", song.trackName), el("p", "card-artist", song.artistName));
    const audio = previewPlayer(song.previewUrl);
    // when a preview ends, play the next song in the playlist
    audio.addEventListener("ended", () => list.querySelectorAll("audio")[index + 1]?.play());
    info.append(audio);
    const remove = el("button", "remove", "Remove");
    remove.addEventListener("click", () => removeFromPlaylist(song.trackId));
    row.append(info, remove);
    list.append(row);
  });
  box.append(list);
}

document.addEventListener("DOMContentLoaded", renderPlaylist);

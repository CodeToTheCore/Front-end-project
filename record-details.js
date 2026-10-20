// Shows an album with every song on it, each with a 30-second iTunes preview.
// record.html?album=<collectionId>  -> that album
// record.html?id=<trackId>          -> the album that song is on (older links still work)
const details = document.querySelector("#recordDetails");
const params = new URLSearchParams(window.location.search);

function minutes(ms) {
  if (!ms) return "";
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function showMessage(text) {
  details.textContent = "";
  const p = el("p", null, text + " ");
  const back = el("a", null, "Go back to the store");
  back.href = "index.html";
  p.append(back);
  details.append(p);
}

async function showAlbum() {
  let albumId = params.get("album");
  const highlightId = Number(params.get("id")) || null;

  // an older link with ?id= points at a song: find which album it's on
  if (!albumId && highlightId) {
    const song = await fetchRecordById(highlightId);
    albumId = song?.collectionId;
  }
  if (!albumId) return showMessage("No record selected.");

  const { album, songs } = await fetchAlbum(albumId);
  if (!album) return showMessage("Record not found.");
  document.title = `${album.collectionName} · Record Details`;
  details.textContent = "";

  // album header: big cover and the details
  const header = el("div", "album-header");
  header.append(img(cover(album.artworkUrl100, 600), `${album.collectionName} cover`));
  const info = el("div", "album-info");
  info.append(el("h1", "album-title", album.collectionName));
  info.append(el("p", "album-artist", album.artistName));
  info.append(el("p", "album-meta",
    `${album.primaryGenreName} · ${(album.releaseDate || "").slice(0, 4)} · ${songs.length} songs`));
  const playAll = el("button", "btn play-all", "▶ Play all previews");
  playAll.addEventListener("click", () => details.querySelector(".tracklist audio")?.play());
  const back = el("a", "back-link", "← Back to the store");
  back.href = "index.html";
  info.append(playAll, back);
  header.append(info);
  details.append(header);

  // every song on the album
  const list = el("ol", "tracklist");
  songs.forEach((song, index) => {
    const row = el("li", song.trackId === highlightId ? "track-row highlight" : "track-row");
    row.append(el("span", "track-number", String(song.trackNumber || index + 1)));
    const name = el("div", "track-name");
    name.append(el("p", "card-title", song.trackName));
    if (song.artistName !== album.artistName) name.append(el("p", "card-artist", song.artistName));
    row.append(name);
    row.append(el("span", "track-time", minutes(song.trackTimeMillis)));
    if (song.previewUrl) {
      const audio = previewPlayer(song.previewUrl);
      // when one preview ends, play the next song
      audio.addEventListener("ended", () => list.querySelectorAll("audio")[index + 1]?.play());
      row.append(audio);
    }
    row.append(makePlaylistButton(song));
    list.append(row);
  });
  details.append(el("p", "preview-note", "iTunes plays a 30-second preview of each song."));
  details.append(list);
}

showAlbum().catch((error) => {
  showMessage("Could not load this record. Please try again.");
  console.error("iTunes Error:", error);
});

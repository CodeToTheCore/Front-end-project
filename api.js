// code for API-related functions
// All music data comes from the free iTunes Search API (no key needed).

const TOP_ARTISTS = ["Nicki Minaj", "Lil Wayne", "Drake", "Future", "The Notorious B.I.G.", "2Pac"];

// builds one clickable card for a song or album; clicking opens record.html with its iTunes id
function makeRecordCard(item) {
  const card = document.createElement("div");
  card.className = "record-card";
  const id = item.trackId || item.collectionId;
  card.innerHTML = `
    <img src="${item.artworkUrl100}" alt="${item.collectionName} cover">
    <p>${item.artistName}</p>
    <p>${item.trackName || item.collectionName}</p>
    <a href="record.html?id=${id}">View details</a>`;
  return card;
}

// search iTunes for songs by the artist the user typed in
function fetchMusic(searchKeyWord) {
  const results = document.querySelector(".results");
  const url = `https://itunes.apple.com/search?term=${searchKeyWord}&entity=song&limit=12`;
  results.textContent = "Searching...";
  fetch(url)
    .then(response => response.json())
    .then(data => {
      results.textContent = "";
      if (data.results.length === 0) {
        results.textContent = "No songs found. Try another artist.";
        return;
      }
      data.results.forEach(song => results.append(makeRecordCard(song)));
    })
    .catch(error => {
      results.textContent = "Could not reach iTunes. Please try again.";
      console.error("iTunes Error:", error);
    });
}

// load one album from each artist in the Top Artist list
function loadTopRecords() {
  const container = document.querySelector("#recordsContainer");
  container.textContent = "Loading records...";
  // ask for several albums and keep the first one that is by the artist (not just featuring them)
  const requests = TOP_ARTISTS.map(artist =>
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=album&limit=25`)
      .then(response => response.json())
      .then(data => data.results.find(album => album.artistName.toLowerCase() === artist.toLowerCase()) || data.results[0])
  );
  Promise.all(requests)
    .then(responses => {
      container.textContent = "";
      responses.forEach(album => {
        if (album) container.append(makeRecordCard(album));
      });
    })
    .catch(error => {
      container.textContent = "Could not load records. Please try again.";
      console.error("iTunes Error:", error);
    });
}

// look up a single song or album by its iTunes id
function fetchRecordById(id) {
  return fetch(`https://itunes.apple.com/lookup?id=${id}`)
    .then(response => response.json())
    .then(data => data.results[0]);
}

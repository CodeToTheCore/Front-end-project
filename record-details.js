// reads the ?id= from the address bar and shows that record's details
const details = document.querySelector("#recordDetails");
const id = new URLSearchParams(window.location.search).get("id");

if (!id) {
  details.innerHTML = `<p>No record selected. <a href="index.html">Go back to the store</a>.</p>`;
} else {
  fetchRecordById(id)
    .then(record => {
      if (!record) {
        details.innerHTML = `<p>Record not found. <a href="index.html">Go back to the store</a>.</p>`;
        return;
      }
      const year = record.releaseDate ? record.releaseDate.slice(0, 4) : "";
      details.innerHTML = `
        <img src="${record.artworkUrl100.replace("100x100", "400x400")}" alt="${record.collectionName} cover">
        <div>
          <p>Artist: ${record.artistName}</p>
          <p>${record.trackName ? "Song: " + record.trackName : "Album: " + record.collectionName}</p>
          ${record.trackName ? `<p>Album: ${record.collectionName}</p>` : ""}
          <p>Genre: ${record.primaryGenreName} ${year ? "(" + year + ")" : ""}</p>
          ${record.previewUrl ? `<audio controls src="${record.previewUrl}"></audio>` : ""}
          <p><a href="index.html">Back to the store</a></p>
        </div>`;
    })
    .catch(error => {
      details.innerHTML = `<p>Could not load this record. Please try again.</p>`;
      console.error("iTunes Error:", error);
    });
}

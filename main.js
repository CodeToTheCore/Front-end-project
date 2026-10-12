//This line of code selects the search form and the results area on the page.
const form = document.querySelector("#searchForm")

/**Here, an event listener is added to the form. It listens for the 'submit' event, which occurs when the user submits the form (for example, by pressing Enter or clicking a submit button). The event.preventDefault() method is called to prevent the default form submission behavior, which would cause the page to reload. */
form.addEventListener('submit', (event) => {
  event.preventDefault()
  /**This line retrieves the value entered by the user in the input field named 'artistInput'. */
  let userInput = event.target.artistInput.value;
  /**The code replaces all spaces in the user input with the '+' character, which is how search URLs expect spaces. For example, "John Doe" becomes "John+Doe". */
  userInput = userInput.replaceAll(' ', '+')
  fetchMusic(userInput)
})

/**The Load Records button shows one album from each artist in the Top Artist list. */
document.querySelector("#loadRecordsBtn").addEventListener('click', loadTopRecords)

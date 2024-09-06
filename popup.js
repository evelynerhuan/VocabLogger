document.addEventListener("DOMContentLoaded", () => {

  console.log("Popup is loaded!");  // Debugging to check if popup.js is loaded

  // Debugging to check if DOM elements are available
  const wordList = document.getElementById("wordList");
  const clearAllButton = document.getElementById("clearAll");

  // Function to display saved words from storage
  function displayWords() {
    // Get the saved words from local storage
    chrome.storage.local.get({ words: [] }, (result) => {
      const words = result.words;
      wordList.innerHTML = ''; // Clear the current word list in the popup
      // Iterate over each word and create a list item
      words.forEach((word, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = word;

        // Create a delete button for each word
        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Delete";
        
        deleteButton.onclick = () => {
          deleteWord(index);  // Call delete function when clicked
        };

        // Append the delete button to the list item and add it to the word list
        listItem.appendChild(deleteButton);
        wordList.appendChild(listItem);
      });
    });
  }

  // Function to delete a word from the list
  function deleteWord(index) {
    // Get the current words from local storage
    chrome.storage.local.get({ words: [] }, (result) => {
      const words = result.words;
      words.splice(index, 1); // Remove the word at the given index
      // Update the storage with the new word list
      chrome.storage.local.set({ words }, () => {
        displayWords(); // Refresh the displayed word list after deletion
      });
    });
  }

  // Clear all saved words
  clearAllButton.onclick = () => {
    // Set an empty array in local storage to clear all words
    chrome.storage.local.set({ words: [] }, () => {
      displayWords(); // Refresh the displayed list (it will be empty)
    });
  };

  // Display the words when the popup is loaded
  displayWords();
});
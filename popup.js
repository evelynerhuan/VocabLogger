document.addEventListener("DOMContentLoaded", () => {

  console.log("Popup is loaded!");  // Debugging to check if popup.js is loaded

  // Debugging to check if DOM elements are available
  const wordList = document.getElementById("wordList");
  const clearAllButton = document.getElementById("clearAll");
  const exportButton = document.getElementById("exportWords");


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

  // Export words as CSV file
  exportButton.onclick = () => {
    chrome.storage.local.get({ words: [] }, (result) => {
      const words = result.words;

      // Prepare CSV content
      let csvContent = "data:text/csv;charset=utf-8,";  // CSV header
      
      // csvContent += "Word\n";  // Add a header row

      // Add words to CSV content
      words.forEach((word) => {
        const dateSaved = new Date().toLocaleString();  // Example: add current date as saved date
        csvContent += word + "\n";  // Each word on a new line
        // csvContent += `${word}, ${dateSaved}\n`;
      });

      // Create a link element to download the CSV file
      const link = document.createElement('a');
      link.href = encodeURI(csvContent);
      link.download = 'saved_words.csv';  // The filename
      link.click();  // Trigger the download
    });
  };

  // Display the words when the popup is loaded
  displayWords();
});
document.addEventListener("DOMContentLoaded", () => {
  const wordList = document.getElementById("wordList");
  const clearAllButton = document.getElementById("clearAll");
  const exportButton = document.getElementById("exportWords");

  // Function to display saved words from storage
  function displayWords() {
    chrome.storage.local.get({ words: [], definitions: {}, learnedWords: {} }, (result) => {
      const words = result.words;
      const definitions = result.definitions || {};  // Cached definitions
      const learnedWords = result.learnedWords || {};  // Learning status
      wordList.innerHTML = ''; // Clear the current word list in the popup

      words.forEach((word, index) => {
        const listItem = document.createElement('div');
        listItem.classList.add('word-container');

        // Create a container for the word and its definition
        const wordDefinitionContainer = document.createElement('div');
        wordDefinitionContainer.classList.add('word-definition');
        
        const wordElement = document.createElement('span');
        wordElement.textContent = word;
        wordDefinitionContainer.appendChild(wordElement);

        // Check if the definition is already cached, otherwise fetch it
        if (definitions[word]) {
          displayDefinition(definitions[word], wordDefinitionContainer);
        } else {
          fetchWordDefinition(word, wordDefinitionContainer);  // Automatically fetch definition
        }

        // Create a delete button for each word
        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Delete";
        deleteButton.classList.add('delete-button');
        deleteButton.onclick = () => {
          deleteWord(index);  // Call delete function when clicked
        };

        // Create a button to toggle the learning status
        const statusButton = document.createElement('button');
        const isLearned = learnedWords[word] || false;  // Check if the word is learned
        statusButton.textContent = isLearned ? "Unlearned" : "Learned";
        statusButton.classList.add('status-button');
        statusButton.onclick = () => {
          toggleLearningStatus(word);  // Toggle learning status when clicked
        };

        // Apply different style for learned words
        if (isLearned) {
          listItem.classList.add('learned');  // Add a CSS class to visually indicate learned words
        }

        listItem.appendChild(wordDefinitionContainer);
        listItem.appendChild(deleteButton);
        listItem.appendChild(statusButton);  // Add the status button to the list item
        wordList.appendChild(listItem);
      });
    });
  }

  // Function to delete a word from the list
  function deleteWord(index) {
    chrome.storage.local.get({ words: [], definitions: {}, learnedWords: {} }, (result) => {
      const words = result.words;
      const definitions = result.definitions;
      const learnedWords = result.learnedWords;
      const wordToDelete = words[index];

      words.splice(index, 1); // Remove the word at the given index
      delete definitions[wordToDelete]; // Remove the cached definition
      delete learnedWords[wordToDelete]; // Remove the learning status

      chrome.storage.local.set({ words, definitions, learnedWords }, () => {
        displayWords(); // Refresh the displayed word list after deletion
      });
    });
  }

  // Clear all saved words, definitions, and learning statuses
  clearAllButton.onclick = () => {
    chrome.storage.local.set({ words: [], definitions: {}, learnedWords: {} }, () => {
      displayWords(); // Refresh the displayed list (it will be empty)
    });
  };

  // Export words as CSV file
// Export words as CSV file
exportButton.onclick = () => {
  chrome.storage.local.get({ words: [], definitions: {}, learnedWords: {} }, (result) => {
    const words = result.words;
    const definitions = result.definitions;
    const learnedWords = result.learnedWords;

    // Prepare CSV content with three columns: Word, Definition, Learned
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Word,Definition,Learned\n";  // Add header row

    // Add each word, its corresponding definition, and learned status to the CSV content
    words.forEach((word) => {
      const definition = definitions[word] || 'No definition available';  // Use 'No definition available' if not found
      const learnedStatus = learnedWords[word] ? 'Yes' : 'No';  // 'Yes' if learned, otherwise 'No'
      csvContent += `${word},"${definition.replace(/"/g, '""')}",${learnedStatus}\n`;  // Escape any double quotes in the definition
    });

    // Create a link element to download the CSV file
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = 'saved_words_with_definitions_and_status.csv';  // The filename
    link.click();  // Trigger the download
  });
};

  // Function to fetch word definition from Dictionary API and cache it
  function fetchWordDefinition(word, container) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const definition = data[0]?.meanings[0]?.definitions[0]?.definition || 'Definition not found';
        displayDefinition(definition, container);

        // Cache the definition
        chrome.storage.local.get({ definitions: {} }, (result) => {
          const definitions = result.definitions;
          definitions[word] = definition;  // Store the definition in cache
          chrome.storage.local.set({ definitions });
        });
      })
      .catch(error => {
        console.error('Error fetching definition:', error);
        const errorElement = document.createElement('p');
        errorElement.textContent = 'Definition not found';
        errorElement.classList.add('definition');
        container.appendChild(errorElement);  // Display error if definition is not found
      });
  }

  // Function to display the definition in the list
  function displayDefinition(definition, container) {
    const definitionElement = document.createElement('p');
    definitionElement.textContent = `Definition: ${definition}`;
    definitionElement.classList.add('definition');
    container.appendChild(definitionElement);  // Display the definition
  }

  // Function to toggle the learning status of a word
  function toggleLearningStatus(word) {
    chrome.storage.local.get({ learnedWords: {} }, (result) => {
      const learnedWords = result.learnedWords || {};
      learnedWords[word] = !learnedWords[word];  // Toggle the learning status
      chrome.storage.local.set({ learnedWords }, () => {
        displayWords();  // Refresh the list after toggling the status
      });
    });
  }

  // Display the words when the popup is loaded
  displayWords();
});
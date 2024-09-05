document.addEventListener("DOMContentLoaded", () => {
  const wordList = document.getElementById("wordList");

  // get vocab from storage
  chrome.storage.local.get({ words: [] }, (result) => {
    const words = result.words;
    wordList.innerHTML = words.map(word => `<li>${word}</li>`).join('');
  });
});
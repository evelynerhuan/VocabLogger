console.log("Background script is running.");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveWord",
    title: "Save word '%s'",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveWord" && info.selectionText) {
    const word = info.selectionText.trim().toLowerCase();
    chrome.storage.local.get({ words: [] }, (result) => {
      const words = result.words;
      if (!words.includes(word)) {
        words.push(word);
        chrome.storage.local.set({ words }, () => {
          console.log(`Word '${word}' saved!`);
        });
      }
    });
  }
});
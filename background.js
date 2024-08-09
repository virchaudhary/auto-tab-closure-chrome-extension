const tabLastUsed = {};

function updateTabLastUsed(tabId) {
  tabLastUsed[tabId] = Date.now();
}

function manageTabs() {
  chrome.storage.sync.get(['maxTabs', 'closeDuplicates'], (settings) => {
    const maxTabs = settings.maxTabs || 10;
    const closeDuplicates = settings.closeDuplicates !== false;

    chrome.tabs.query({}, (tabs) => {
      if (tabs.length > maxTabs) {
        // Close the least recently used tab
        let leastUsedTabId = null;
        let oldestTime = Date.now();

        tabs.forEach((tab) => {
          if (tabLastUsed[tab.id] < oldestTime) {
            oldestTime = tabLastUsed[tab.id];
            leastUsedTabId = tab.id;
          }
        });

        if (leastUsedTabId !== null) {
          chrome.tabs.remove(leastUsedTabId);
          delete tabLastUsed[leastUsedTabId];
        }
      }

      if (closeDuplicates) {
        // Close duplicate tabs
        const urls = new Set();
        tabs.forEach((tab) => {
          if (urls.has(tab.url)) {
            chrome.tabs.remove(tab.id);
            delete tabLastUsed[tab.id];
          } else {
            urls.add(tab.url);
          }
        });
      }
    });
  });
}

// Track tab activation to update last used time
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateTabLastUsed(activeInfo.tabId);
});

// Track tab updates (like loading or URL changes) to update last used time
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateTabLastUsed(tabId);
  }
});

// Remove closed tabs from the tracking object
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabLastUsed[tabId];
});

// Manage tabs when a new one is created
chrome.tabs.onCreated.addListener(manageTabs);

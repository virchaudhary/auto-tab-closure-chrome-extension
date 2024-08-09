document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['maxTabs', 'closeDuplicates'], (result) => {
      document.getElementById('maxTabs').value = result.maxTabs || 10;
      document.getElementById('closeDuplicates').checked = result.closeDuplicates !== false;
    });
  
    document.getElementById('save').addEventListener('click', () => {
      const maxTabs = document.getElementById('maxTabs').value;
      const closeDuplicates = document.getElementById('closeDuplicates').checked;
  
      chrome.storage.sync.set({ maxTabs, closeDuplicates }, () => {
        alert('Settings saved!');
      });
    });
  });
  
// settings.js
document.addEventListener('DOMContentLoaded', () => {
  const apiEndpointInput = document.getElementById('apiEndpoint');
  const authTokenInput = document.getElementById('authToken');
  const saveButton = document.getElementById('saveSettings');

  // Load saved settings
  chrome.storage.sync.get(['apiEndpoint', 'authToken'], (items) => {
    if (items.apiEndpoint) {
      apiEndpointInput.value = items.apiEndpoint;
    }
    if (items.authToken) {
      authTokenInput.value = items.authToken;
    }
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    const apiEndpoint = apiEndpointInput.value || 'https://cloud.linkwarden.app';
    const authToken = authTokenInput.value;

    if (!authToken) {
      alert('Please enter an auth token');
      return;
    }

    chrome.storage.sync.set({ apiEndpoint, authToken }, () => {
      alert('Settings saved');
    });
  });
});

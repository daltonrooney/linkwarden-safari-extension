document.addEventListener("DOMContentLoaded", () => {
  checkSettings();
  getCollections();
  handlePopup();
  handleSave();
});

async function checkSettings() {
  const settings = await getSettings();
  if (!settings || Object.keys(settings).length === 0) {
      const messageDiv = document.getElementById('message');
      const saveForm = document.getElementById('save-form');
      messageDiv.innerHTML = '<p>No settings found. Please go to <a href="settings.html">Settings</a> to configure the extension.</p>';
      saveForm.style.display = 'none';
  }
}

function getSettings() {
  return chrome.storage.sync.get(['apiEndpoint', 'authToken'])
  .then((result) => {
      return result;
  })
  .catch(err => {
      console.log(err);
      return {}; // Return an empty object in case of error
  });
};

async function getCollections() {
  try {
    const settings = await getSettings();
    const request = await fetch(settings.apiEndpoint + "/api/v1/collections", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${settings.authToken}`,
        "Content-Type": "application/json"
      },
    });
    const response = await request.json();
    localStorage.setItem("collections", JSON.stringify(response.response));
    return response.response;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function getTags() {
  try {
    const settings = await getSettings();
    const request = await fetch(settings.apiEndpoint + "/api/v1/tags", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${settings.authToken}`,
        "Content-Type": "application/json"
      },
    });
    const response = await request.json();
    localStorage.setItem("collections", JSON.stringify(response.response));
    return response.response;
  } catch (error) {
    console.log(error);
    return [];
  }
} 

async function handlePopup() {
  /* Use the cached collections and tags if they exist */
  populateCollections();
  populateTags();

  browser.tabs.query({
    currentWindow: true,
    active: true
  }).then((tabs) => {
    document.getElementById("url").value = tabs[0].url;
    document.getElementById("title").value = tabs[0].title;
  }).catch(err=>console.log(err));

  /* Fetch the live collections and tags from the server */
  const collections = await getCollections();
  const tags = await getTags();

  populateCollections(collections);
  populateTags(tags);
  handleTagSearch();
}

function populateCollections(collections) {
  if (!collections) {
    collections = JSON.parse(localStorage.getItem("collections"));
  }
  if (collections && collections.length > 0) {
    const collectionSelect = document.getElementById("collection");
    collectionSelect.innerHTML = "";
    collections.forEach((collection) => {
      const option = document.createElement("option");
      option.value = collection.id;
      option.textContent = collection.name;
      collectionSelect.appendChild(option);
    });
  }
}

function populateTags(tags) {
  if (!tags) {
    tags = JSON.parse(localStorage.getItem("tags"));
  }
  if (tags && tags.length > 0) {
    const tagSelect = document.getElementById("tags");
    tagSelect.innerHTML = "";
    tags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag.name;
      option.textContent = tag.name;
      tagSelect.appendChild(option);
    });
  }
}

async function handleSave() {
  document.getElementById("save-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const saveForm = document.getElementById("save-form");
    saveForm.ariaBusy = "true";
    
    // Get selected tags as an array
    const tagSelect = document.getElementById("tags");
    const selectedTags = Array.from(tagSelect.selectedOptions).map(option => ({ name: option.value }));

    const settings = await getSettings();
    const response = await fetch(settings.apiEndpoint + "/api/v1/links", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${settings.authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: document.getElementById("url").value,
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        tags: selectedTags,
        collection: {"id": Number(document.getElementById("collection").value)}
      })
    });
    if (response.status === 200) {    
      const messageDiv = document.getElementById('message');
      messageDiv.innerHTML = '<p>Link saved successfully.</p>';
      document.getElementById("save-form").classList.add("hidden");
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      const messageDiv = document.getElementById('message');
      messageDiv.innerHTML = '<p>Failed to save link.</p>';
    }
  });
};

function handleTagSearch() {
    const element = document.getElementById('tags');
    new SlimSelect({
        select: element,
        openPosition: 'down',
        events: {
          addable: function (value) { return value },
        }
    })
}


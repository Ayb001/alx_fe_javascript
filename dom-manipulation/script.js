// Constants for storage keys
const QUOTES_STORAGE_KEY = 'dynamicQuotesApp_quotes';
const LAST_QUOTE_SESSION_KEY = 'lastViewedQuote';
const LAST_FILTER_KEY = 'lastSelectedFilter';

// Array to store quotes with text and category
let quotes = [];

// Current filter state
let currentFilter = 'all';

// Default quotes to initialize the application
const defaultQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "motivation" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "innovation" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "dreams" },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "inspiration" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "success" },
    { text: "The only impossible journey is the one you never begin.", category: "motivation" },
    { text: "Creativity is intelligence having fun.", category: "creativity" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", category: "wisdom" },
    { text: "Don't watch the clock; do what it does. Keep going.", category: "perseverance" }
];

// Load quotes from local storage or use defaults
function loadQuotes() {
    try {
        const storedQuotes = localStorage.getItem(QUOTES_STORAGE_KEY);
        if (storedQuotes) {
            quotes = JSON.parse(storedQuotes);
            console.log('Quotes loaded from local storage:', quotes.length);
        } else {
            quotes = [...defaultQuotes];
            saveQuotes(); // Save default quotes to local storage
            console.log('Default quotes loaded and saved to local storage');
        }
    } catch (error) {
        console.error('Error loading quotes from local storage:', error);
        quotes = [...defaultQuotes];
    }
    updateQuoteCount();
    populateCategories();
}

// Save quotes to local storage
function saveQuotes() {
    try {
        localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
        console.log('Quotes saved to local storage:', quotes.length);
        updateQuoteCount();
        populateCategories(); // Update categories when quotes change
    } catch (error) {
        console.error('Error saving quotes to local storage:', error);
        alert('Error saving quotes to local storage. Your browser might have storage limitations.');
    }
}

// Load last selected filter from local storage
function loadLastFilter() {
    try {
        const savedFilter = localStorage.getItem(LAST_FILTER_KEY);
        if (savedFilter) {
            currentFilter = savedFilter;
            const filterSelect = document.getElementById('categoryFilter');
            if (filterSelect) {
                filterSelect.value = currentFilter;
            }
            updateCurrentFilterDisplay();
        }
    } catch (error) {
        console.error('Error loading last filter:', error);
    }
}

// Save current filter to local storage
function saveCurrentFilter() {
    try {
        localStorage.setItem(LAST_FILTER_KEY, currentFilter);
        updateCurrentFilterDisplay();
    } catch (error) {
        console.error('Error saving current filter:', error);
    }
}

// Update current filter display
function updateCurrentFilterDisplay() {
    const currentFilterElement = document.getElementById('currentFilter');
    if (currentFilterElement) {
        currentFilterElement.textContent = currentFilter === 'all' ? 'All Categories' : 
            currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
    }
}

// Session storage functions
function saveLastViewedQuote(quote) {
    try {
        const quoteData = {
            text: quote.text,
            category: quote.category,
            timestamp: new Date().toISOString()
        };
        sessionStorage.setItem(LAST_QUOTE_SESSION_KEY, JSON.stringify(quoteData));
        updateSessionInfo();
    } catch (error) {
        console.error('Error saving to session storage:', error);
    }
}

function getLastViewedQuote() {
    try {
        const lastQuote = sessionStorage.getItem(LAST_QUOTE_SESSION_KEY);
        return lastQuote ? JSON.parse(lastQuote) : null;
    } catch (error) {
        console.error('Error reading from session storage:', error);
        return null;
    }
}

// Update session info display
function updateSessionInfo() {
    const sessionInfo = document.getElementById('sessionInfo');
    const lastViewed = document.getElementById('lastViewed');
    
    const lastQuote = getLastViewedQuote();
    if (lastQuote) {
        const time = new Date(lastQuote.timestamp).toLocaleTimeString();
        lastViewed.textContent = `"${lastQuote.text.substring(0, 50)}..." at ${time}`;
        sessionInfo.style.display = 'block';
    } else {
        lastViewed.textContent = 'None';
        sessionInfo.style.display = 'none';
    }
}

// Function to populate categories dynamically
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Get unique categories from quotes
    const categories = [...new Set(quotes.map(quote => quote.category.toLowerCase()))].sort();
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
    
    // Restore last selected filter
    categoryFilter.value = currentFilter;
    console.log('Categories populated:', categories);
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    const selectedCategory = categoryFilter.value;
    currentFilter = selectedCategory;
    saveCurrentFilter();
    
    console.log('Filtering quotes by selectedCategory:', selectedCategory);
    
    // Filter and update the displayed quotes based on the selected category
    let filteredQuotes = quotes;
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    // Update the displayed quotes based on the selected category
    if (filteredQuotes.length === 0) {
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = `<div class="quote-text">No quotes available for selectedCategory: ${selectedCategory}</div>`;
        return;
    }
    
    // Show a random quote from the filtered selection
    showRandomQuote();
}

// Function to show a random quote (enhanced with filtering)
function showRandomQuote() {
    if (quotes.length === 0) {
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = '<div class="quote-text">No quotes available. Add some quotes or import from a JSON file.</div>';
        return;
    }
    
    // Filter quotes based on current filter
    let filteredQuotes = quotes;
    if (currentFilter !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category.toLowerCase() === currentFilter.toLowerCase());
    }
    
    if (filteredQuotes.length === 0) {
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = `<div class="quote-text">No quotes available for category: ${currentFilter}</div>`;
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];
    
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `
        <div>
            <div class="quote-text">"${selectedQuote.text}"</div>
            <div class="quote-category">— ${selectedQuote.category}</div>
            <p style="margin-top: 15px; font-size: 0.8rem; color: #718096;">
                Quote ${randomIndex + 1} of ${filteredQuotes.length} in ${currentFilter === 'all' ? 'all categories' : currentFilter}
            </p>
        </div>
    `;
    
    // Add fade-in animation
    quoteDisplay.classList.add('fade-in');
    setTimeout(() => quoteDisplay.classList.remove('fade-in'), 500);
    
    // Save to session storage
    saveLastViewedQuote(selectedQuote);
}

// Function to create add quote form (enhanced)
function createAddQuoteForm() {
    const formContainer = document.getElementById('addQuoteForm');
    formContainer.classList.remove('hidden');
    formContainer.classList.add('visible');
    document.getElementById('newQuoteText').focus();
}

// Function to hide add quote form
function hideAddQuoteForm() {
    const formContainer = document.getElementById('addQuoteForm');
    formContainer.classList.add('hidden');
    formContainer.classList.remove('visible');
    // Clear form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

// Function to add a new quote (enhanced with category update)
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim().toLowerCase();
    
    if (newQuoteText && newQuoteCategory) {
        // Create new quote object
        const newQuote = {
            text: newQuoteText,
            category: newQuoteCategory
        };
        
        // Add new quote to array
        quotes.push(newQuote);
        
        // Save to local storage (this will also update categories)
        saveQuotes();
        
        // Hide form and clear inputs
        hideAddQuoteForm();
        
        // Update filter if new category was added
        if (currentFilter === 'all' || currentFilter === newQuoteCategory) {
            // Show the newly added quote
            const quoteDisplay = document.getElementById('quoteDisplay');
            quoteDisplay.innerHTML = `
                <div>
                    <div class="quote-text">"${newQuote.text}"</div>
                    <div class="quote-category">— ${newQuote.category}</div>
                    <p style="margin-top: 15px; font-size: 0.8rem; color: #28a745;">
                        ✓ New quote added successfully!
                    </p>
                </div>
            `;
            
            // Save to session storage
            saveLastViewedQuote(newQuote);
        }
        
        alert(`Quote added successfully! Category: ${newQuoteCategory}`);
        
    } else {
        alert('Please fill in both the quote text and category.');
    }
}

// Function to cancel adding quote
function cancelAddQuote() {
    hideAddQuoteForm();
}

// Function to export quotes to JSON
function exportToJsonFile() {
    try {
        if (quotes.length === 0) {
            alert('No quotes to export!');
            return;
        }
        
        const dataStr = JSON.stringify(quotes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `quotes_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        alert(`Successfully exported ${quotes.length} quotes to JSON file!`);
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting quotes. Please try again.');
    }
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        alert('Please select a valid JSON file.');
        return;
    }
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            // Validate imported data
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid file format: Expected an array of quotes.');
            }
            
            // Validate each quote object
            const validQuotes = importedQuotes.filter(quote => {
                return quote && 
                       typeof quote.text === 'string' && 
                       typeof quote.category === 'string' &&
                       quote.text.trim() !== '' && 
                       quote.category.trim() !== '';
            });
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file.');
            }
            
            // Add imported quotes to existing quotes
            quotes.push(...validQuotes);
            
            // Save to local storage (this will also update categories)
            saveQuotes();
            
            // Clear file input
            event.target.value = '';
            
            alert(`Successfully imported ${validQuotes.length} quotes! Total quotes: ${quotes.length}`);
            
            // Show a random quote from imported ones
            if (validQuotes.length > 0) {
                showRandomQuote();
            }
            
        } catch (error) {
            console.error('Import error:', error);
            alert(`Error importing quotes: ${error.message}`);
        }
    };
    
    fileReader.onerror = function() {
        alert('Error reading file. Please try again.');
    };
    
    fileReader.readAsText(file);
}

// Function to clear all quotes
function clearAllQuotes() {
    if (confirm('Are you sure you want to clear all quotes? This action cannot be undone.')) {
        quotes = [];
        saveQuotes();
        
        // Clear session storage
        sessionStorage.removeItem(LAST_QUOTE_SESSION_KEY);
        updateSessionInfo();
        
        // Reset filter
        currentFilter = 'all';
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = 'all';
        }
        saveCurrentFilter();
        
        // Update display
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = '<div class="quote-text">All quotes cleared. Add new quotes or import from a JSON file.</div>';
        
        alert('All quotes have been cleared.');
    }
}

// Function to update quote count display
function updateQuoteCount() {
    const quoteCountElement = document.getElementById('quoteCount');
    if (quoteCountElement) {
        quoteCountElement.textContent = quotes.length;
    }
}

// Function to handle keyboard events
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        if (event.target.id === 'newQuoteText' || event.target.id === 'newQuoteCategory') {
            addQuote();
        }
    }
    if (event.key === 'Escape') {
        hideAddQuoteForm();
    }
}

// Initialize the application
function initializeApp() {
    console.log('Initializing Dynamic Quote Generator...');
    
    // Load quotes from local storage
    loadQuotes();
    
    // Load last selected filter
    loadLastFilter();
    
    // Set up event listeners
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('addQuoteBtn').addEventListener('click', createAddQuoteForm);
    document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
    document.getElementById('clearQuotes').addEventListener('click', clearAllQuotes);
    
    // Add keyboard event listeners
    document.getElementById('newQuoteText').addEventListener('keypress', handleKeyPress);
    document.getElementById('newQuoteCategory').addEventListener('keypress', handleKeyPress);
    document.addEventListener('keydown', handleKeyPress);
    
    // Update session info
    updateSessionInfo();
    
    // Show initial quote if quotes are available
    if (quotes.length > 0) {
        showRandomQuote();
    } else {
        document.getElementById('quoteDisplay').innerHTML = '<div class="quote-text">No quotes available. Add some quotes or import from a JSON file.</div>';
    }
    
    console.log('Application initialized successfully!');
}

// SERVER SYNC FUNCTIONALITY FOR TASK 3

// Constants for server simulation
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API
const SYNC_INTERVAL = 30000; // 30 seconds
const LAST_SYNC_KEY = 'lastSyncTimestamp';
const SERVER_QUOTES_KEY = 'serverQuotes';

// Sync status
let isSyncing = false;
let syncInterval = null;

// Function to fetch quotes from server using mock API
async function fetchQuotesFromServer() {
    try {
        console.log('Fetching data from server using mock API...');
        
        // Simulate API call with actual fetch to JSONPlaceholder
        const response = await fetch(SERVER_URL);
        const posts = await response.json();
        
        // Convert posts to quote format (mock server data)
        const serverQuotes = posts.slice(0, 5).map((post, index) => ({
            text: `Server quote ${index + 1}: ${post.title}`,
            category: index % 2 === 0 ? 'server' : 'remote',
            serverTimestamp: new Date().toISOString(),
            serverId: post.id
        }));
        
        // Add some additional mock quotes
        serverQuotes.push(
            { text: "Server quote: The best way to predict the future is to create it.", category: "future", serverTimestamp: new Date().toISOString() },
            { text: "Server quote: Technology is best when it brings people together.", category: "technology", serverTimestamp: new Date().toISOString() },
            { text: "Server quote: Innovation is the ability to see change as an opportunity.", category: "innovation", serverTimestamp: new Date().toISOString() }
        );
        
        console.log('Fetched quotes from server:', serverQuotes.length);
        return serverQuotes;
        
    } catch (error) {
        console.error('Error fetching data from server:', error);
        throw new Error('Failed to fetch quotes from server using mock API');
    }
}

// Function to post data to server using mock API
async function postQuotesToServer(quotesToPost) {
    try {
        console.log('Posting data to server using mock API...');
        
        // Simulate posting data to server
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                quotes: quotesToPost,
                timestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        console.log('Posted quotes to server successfully:', result.id);
        return result;
        
    } catch (error) {
        console.error('Error posting data to server:', error);
        throw new Error('Failed to post data to server using mock API');
    }
}

// Function to sync quotes - periodically check for new quotes from server
async function syncQuotes() {
    if (isSyncing) {
        console.log('Sync already in progress, skipping...');
        return;
    }
    
    isSyncing = true;
    updateSyncStatus('Syncing quotes with server...', '🔄');
    
    try {
        console.log('Starting syncQuotes - periodically checking for new quotes from server...');
        
        // Fetch quotes from server
        const serverQuotes = await fetchQuotesFromServer();
        
        // Update local storage with server data and handle conflicts
        const conflicts = detectConflicts(serverQuotes);
        
        if (conflicts.length > 0) {
            console.log('Conflicts detected during sync:', conflicts.length);
            handleConflicts(conflicts, serverQuotes);
            showNotificationForUpdates(`Sync completed with ${conflicts.length} conflicts detected`);
        } else {
            // No conflicts, update local storage with server data
            updateLocalStorageWithServerData(serverQuotes);
            showNotificationForUpdates('Quotes synced successfully from server');
        }
        
        // Post local quotes to server
        await postQuotesToServer(quotes);
        
        // Update last sync timestamp
        const now = new Date().toISOString();
        localStorage.setItem(LAST_SYNC_KEY, now);
        updateLastSyncDisplay(now);
        
        updateSyncStatus('Sync completed successfully', '🟢');
        
    } catch (error) {
        console.error('Sync error:', error);
        updateSyncStatus('Sync failed: ' + error.message, '🔴');
        showNotificationForUpdates('Sync failed: ' + error.message, 'error');
    } finally {
        isSyncing = false;
    }
}

// Function to update local storage with server data and conflict resolution
function updateLocalStorageWithServerData(serverQuotes) {
    const existingTexts = quotes.map(q => q.text.toLowerCase());
    let newQuotesAdded = 0;
    
    console.log('Updating local storage with server data and performing conflict resolution...');
    
    serverQuotes.forEach(serverQuote => {
        // Check if quote already exists locally
        if (!existingTexts.includes(serverQuote.text.toLowerCase())) {
            quotes.push({
                text: serverQuote.text,
                category: serverQuote.category,
                source: 'server',
                serverTimestamp: serverQuote.serverTimestamp
            });
            newQuotesAdded++;
        }
    });
    
    if (newQuotesAdded > 0) {
        // Update local storage with the new server data
        saveQuotes();
        console.log(`Local storage updated with ${newQuotesAdded} new quotes from server`);
    }
    
    return newQuotesAdded;
}

// Initialize server sync functionality
function initializeServerSync() {
    console.log('Initializing server synchronization...');
    
    // Add sync controls to the UI
    addSyncControls();
    
    // Start periodic sync - periodically checking for new quotes from server
    startPeriodicSync();
    
    // Add event listeners for manual sync
    setupSyncEventListeners();
    
    console.log('Server sync initialized');
}

// Add UI elements and notifications for data updates or conflicts
function addSyncControls() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const syncSection = document.createElement('div');
    syncSection.className = 'sync-section';
    syncSection.innerHTML = `
        <div style="background: #e3f2fd; padding: 20px; border-radius: 15px; margin: 20px 0; border: 2px solid #2196f3;">
            <h3 style="margin-bottom: 15px; color: #1976d2;">🔄 Server Synchronization</h3>
            <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                <button id="manualSync" style="background: #2196f3;">Manual Sync</button>
                <button id="toggleAutoSync" style="background: #4caf50;">Auto Sync: ON</button>
                <button id="resolveConflicts" style="background: #ff9800;">Resolve Conflicts</button>
            </div>
            <div id="syncStatus" style="font-size: 0.9rem; color: #1976d2;">
                <p>🟢 Sync Status: <span id="syncStatusText">Ready</span></p>
                <p>⏰ Last Sync: <span id="lastSyncTime">Never</span></p>
                <p>📊 Server Data: <span id="serverQuoteCount">0</span> quotes</p>
                <p>⚠️ Conflicts: <span id="conflictCount">0</span></p>
            </div>
            <div id="conflictNotification" style="display: none; background: #fff3cd; padding: 15px; border-radius: 10px; margin-top: 15px; border: 1px solid #ffeaa7; color: #856404;">
                <strong>⚠️ Sync Conflict Detected!</strong>
                <p id="conflictMessage">Data conflicts found during sync. Click "Resolve Conflicts" to review.</p>
            </div>
        </div>
    `;
    
    // Insert before storage info
    const storageInfo = document.querySelector('.storage-info');
    if (storageInfo) {
        container.insertBefore(syncSection, storageInfo);
    } else {
        container.appendChild(syncSection);
    }
}

// Setup event listeners for sync functionality
function setupSyncEventListeners() {
    const manualSyncBtn = document.getElementById('manualSync');
    const toggleAutoSyncBtn = document.getElementById('toggleAutoSync');
    const resolveConflictsBtn = document.getElementById('resolveConflicts');
    
    if (manualSyncBtn) {
        manualSyncBtn.addEventListener('click', performManualSync);
    }
    
    if (toggleAutoSyncBtn) {
        toggleAutoSyncBtn.addEventListener('click', toggleAutoSync);
    }
    
    if (resolveConflictsBtn) {
        resolveConflictsBtn.addEventListener('click', showConflictResolution);
    }
}

// Start periodic synchronization - periodically checking for new quotes from server
function startPeriodicSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    // Periodically check for new quotes from the server
    syncInterval = setInterval(() => {
        if (!isSyncing) {
            console.log('Periodic sync triggered - checking for new quotes from server');
            syncQuotes();
        }
    }, SYNC_INTERVAL);
    
    // Perform initial sync
    setTimeout(() => syncQuotes(), 2000);
}

// Stop periodic synchronization
function stopPeriodicSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
}

// Toggle auto sync
function toggleAutoSync() {
    const toggleBtn = document.getElementById('toggleAutoSync');
    if (!toggleBtn) return;
    
    if (syncInterval) {
        stopPeriodicSync();
        toggleBtn.textContent = 'Auto Sync: OFF';
        toggleBtn.style.background = '#f44336';
        updateSyncStatus('Auto sync disabled', '🔴');
    } else {
        startPeriodicSync();
        toggleBtn.textContent = 'Auto Sync: ON';
        toggleBtn.style.background = '#4caf50';
        updateSyncStatus('Auto sync enabled', '🟢');
    }
}

// Perform manual sync
function performManualSync() {
    updateSyncStatus('Manual sync initiated...', '🔄');
    syncQuotes();
}

// Detect conflicts between local and server data
function detectConflicts(serverData) {
    const conflicts = [];
    
    serverData.forEach((serverQuote, index) => {
        // Check if similar quote exists locally
        const similarLocal = quotes.find(localQuote => 
            localQuote.text.toLowerCase().includes(serverQuote.text.toLowerCase().substring(0, 20)) ||
            serverQuote.text.toLowerCase().includes(localQuote.text.toLowerCase().substring(0, 20))
        );
        
        if (similarLocal && similarLocal.category !== serverQuote.category) {
            conflicts.push({
                type: 'category_mismatch',
                local: similarLocal,
                server: serverQuote,
                index: index
            });
        }
    });
    
    return conflicts;
}

// Handle conflicts
function handleConflicts(conflicts, serverData) {
    console.log('Conflicts detected:', conflicts);
    
    // Show conflict notification
    showConflictNotification(conflicts.length);
    
    // Store server data for conflict resolution
    localStorage.setItem(SERVER_QUOTES_KEY, JSON.stringify(serverData));
    
    // Update conflict count
    updateConflictCount(conflicts.length);
    
    updateSyncStatus(`Sync completed with ${conflicts.length} conflicts`, '⚠️');
}

// Show UI elements and notifications for data updates or conflicts
function showNotificationForUpdates(message, type = 'info') {
    const notification = document.createElement('div');
    const backgroundColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Show conflict notification
function showConflictNotification(conflictCount) {
    const notification = document.getElementById('conflictNotification');
    const message = document.getElementById('conflictMessage');
    
    if (notification && message) {
        message.textContent = `${conflictCount} data conflicts found during sync. Server data differs from your local data. Click "Resolve Conflicts" to review and resolve them.`;
        notification.style.display = 'block';
    }
}

// Update conflict count display
function updateConflictCount(count) {
    const conflictCountElement = document.getElementById('conflictCount');
    if (conflictCountElement) {
        conflictCountElement.textContent = count;
    }
}

// Show conflict resolution interface
function showConflictResolution() {
    const serverData = localStorage.getItem(SERVER_QUOTES_KEY);
    if (!serverData) {
        alert('No conflicts to resolve.');
        return;
    }
    
    const conflicts = detectConflicts(JSON.parse(serverData));
    if (conflicts.length === 0) {
        alert('No conflicts found.');
        hideConflictNotification();
        return;
    }
    
    // Create conflict resolution modal
    createConflictResolutionModal(conflicts, JSON.parse(serverData));
}

// Create conflict resolution modal
function createConflictResolutionModal(conflicts, serverData) {
    // Remove existing modal if any
    const existingModal = document.getElementById('conflictModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'conflictModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 90%;
        max-height: 80%;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    modalContent.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #333;">🔧 Resolve Data Conflicts</h2>
        <p style="margin-bottom: 20px; color: #666;">
            Choose how to resolve each conflict between your local data and server data:
        </p>
        <div id="conflictList"></div>
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
            <button onclick="resolveAllConflicts('local')" style="background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Keep All Local
            </button>
            <button onclick="resolveAllConflicts('server')" style="background: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Accept All Server
            </button>
            <button onclick="closeConflictModal()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Cancel
            </button>
        </div>
    `;
    
    const conflictList = modalContent.querySelector('#conflictList');
    conflicts.forEach((conflict, index) => {
        const conflictDiv = document.createElement('div');
        conflictDiv.style.cssText = `
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 10px;
            background: #f9f9f9;
        `;
        
        conflictDiv.innerHTML = `
            <h4>Conflict ${index + 1}: Category Mismatch</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                <div style="padding: 10px; background: #e3f2fd; border-radius: 8px;">
                    <strong>Your Local Version:</strong>
                    <p>"${conflict.local.text}"</p>
                    <p><em>Category: ${conflict.local.category}</em></p>
                </div>
                <div style="padding: 10px; background: #e8f5e8; border-radius: 8px;">
                    <strong>Server Version:</strong>
                    <p>"${conflict.server.text}"</p>
                    <p><em>Category: ${conflict.server.category}</em></p>
                </div>
            </div>
            <div style="text-align: center;">
                <button onclick="resolveConflict(${index}, 'local')" style="background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin: 0 5px;">
                    Keep Local
                </button>
                <button onclick="resolveConflict(${index}, 'server')" style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin: 0 5px;">
                    Use Server
                </button>
            </div>
        `;
        
        conflictList.appendChild(conflictDiv);
    });
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Store conflicts globally for resolution functions
    window.currentConflicts = conflicts;
    window.currentServerData = serverData;
}

// Resolve individual conflict
window.resolveConflict = function(conflictIndex, choice) {
    const conflict = window.currentConflicts[conflictIndex];
    
    if (choice === 'server') {
        // Replace local quote with server version
        const localIndex = quotes.findIndex(q => q.text === conflict.local.text);
        if (localIndex !== -1) {
            quotes[localIndex] = {
                text: conflict.server.text,
                category: conflict.server.category,
                source: 'server'
            };
        }
    }
    // If choice is 'local', we keep the local version (no action needed)
    
    // Remove this conflict from the list
    window.currentConflicts.splice(conflictIndex, 1);
    
    // If all conflicts resolved, finish up
    if (window.currentConflicts.length === 0) {
        finishConflictResolution();
    } else {
        // Recreate modal with remaining conflicts
        createConflictResolutionModal(window.currentConflicts, window.currentServerData);
    }
};

// Resolve all conflicts with same choice
window.resolveAllConflicts = function(choice) {
    window.currentConflicts.forEach(conflict => {
        if (choice === 'server') {
            const localIndex = quotes.findIndex(q => q.text === conflict.local.text);
            if (localIndex !== -1) {
                quotes[localIndex] = {
                    text: conflict.server.text,
                    category: conflict.server.category,
                    source: 'server'
                };
            }
        }
    });
    
    finishConflictResolution();
};

// Close conflict modal
window.closeConflictModal = function() {
    const modal = document.getElementById('conflictModal');
    if (modal) {
        modal.remove();
    }
};

// Finish conflict resolution
function finishConflictResolution() {
    // Save updated quotes
    saveQuotes();
    
    // Add any remaining server quotes that don't conflict
    updateLocalStorageWithServerData(window.currentServerData);
    
    // Hide conflict notification
    hideConflictNotification();
    
    // Close modal
    window.closeConflictModal();
    
    // Update status
    updateSyncStatus('All conflicts resolved successfully', '🟢');
    updateConflictCount(0);
    
    // Clear stored server data
    localStorage.removeItem(SERVER_QUOTES_KEY);
    
    // Show success notification
    showNotificationForUpdates('Conflicts resolved successfully!');
    
    // Refresh display
    showRandomQuote();
}

// Hide conflict notification
function hideConflictNotification() {
    const notification = document.getElementById('conflictNotification');
    if (notification) {
        notification.style.display = 'none';
    }
}

// Update sync status display
function updateSyncStatus(message, icon = '🟢') {
    const statusText = document.getElementById('syncStatusText');
    if (statusText) {
        statusText.textContent = message;
        statusText.parentElement.innerHTML = `${icon} Sync Status: <span id="syncStatusText">${message}</span>`;
    }
}

// Update last sync time display
function updateLastSyncDisplay(timestamp) {
    const lastSyncElement = document.getElementById('lastSyncTime');
    if (lastSyncElement && timestamp) {
        const date = new Date(timestamp);
        lastSyncElement.textContent = date.toLocaleString();
    }
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Initialize server sync after a short delay
    setTimeout(() => {
        initializeServerSync();
        
        // Load and display last sync time
        const lastSync = localStorage.getItem(LAST_SYNC_KEY);
        if (lastSync) {
            updateLastSyncDisplay(lastSync);
        }
    }, 1000);
});

// Handle browser storage events (when storage is modified in another tab)
window.addEventListener('storage', function(e) {
    if (e.key === QUOTES_STORAGE_KEY) {
        console.log('Quotes updated in another tab, reloading...');
        loadQuotes();
        if (quotes.length > 0) {
            showRandomQuote();
        }
    } else if (e.key === LAST_FILTER_KEY) {
        console.log('Filter updated in another tab, reloading...');
        loadLastFilter();
        showRandomQuote();
    }
});
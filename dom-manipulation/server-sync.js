// Server synchronization functionality for Task 3
// This file handles syncing data with a mock server and conflict resolution

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

// Initialize server sync when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the main app to initialize
    setTimeout(initializeServerSync, 1000);
    
    // Load and display last sync time
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (lastSync) {
        setTimeout(() => updateLastSyncDisplay(lastSync), 1500);
    }
});
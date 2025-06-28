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

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeApp);

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
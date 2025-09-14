// Main JavaScript functionality for Agricultural Assistant App

// Global variables
let currentTab = 'home';
let cropData = [];
let weatherData = null;
let isLoading = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

// Initialize application
function initializeApp() {
    // Load saved data from localStorage
    loadSavedData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show home tab by default
    showTab('home');
    
    // Initialize weather data
    loadWeatherData();
}

// Set up event listeners
function setupEventListeners() {
    // Form submissions
    const cropForm = document.querySelector('.crop-form');
    if (cropForm) {
        cropForm.addEventListener('submit', handleCropFormSubmit);
    }
    
    // Location selector
    const locationSelect = document.getElementById('location-select');
    if (locationSelect) {
        locationSelect.addEventListener('change', handleLocationChange);
    }
    
    // Prediction crop selector
    const predictionCropSelect = document.getElementById('prediction-crop');
    if (predictionCropSelect) {
        predictionCropSelect.addEventListener('change', handlePredictionCropChange);
    }
    
    // Auto-resize chat input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('input', autoResizeChatInput);
    }
}

// Tab navigation
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to corresponding nav link
    const activeNavLink = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }
    
    currentTab = tabName;
    
    // Perform tab-specific initialization
    switch (tabName) {
        case 'chat':
            initializeChatSuggestions();
            break;
        case 'predictions':
            updatePredictionsDisplay();
            break;
        case 'weather':
            updateWeatherDisplay();
            break;
    }
}

// Update current time display
function updateCurrentTime() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        timeElement.textContent = now.toLocaleDateString(currentLanguage === 'hi' ? 'hi-IN' : 'en-US', options);
    }
}

// Crop form handling
function handleCropFormSubmit(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    const formData = new FormData(event.target);
    const cropInfo = {
        id: Date.now(),
        cropType: formData.get('crop-type') || document.getElementById('crop-type').value,
        plantingDate: formData.get('planting-date') || document.getElementById('planting-date').value,
        fieldSize: formData.get('field-size') || document.getElementById('field-size').value,
        soilType: formData.get('soil-type') || document.getElementById('soil-type').value,
        irrigationType: formData.get('irrigation-type') || document.getElementById('irrigation-type').value,
        fertilizer: formData.get('fertilizer') || document.getElementById('fertilizer').value,
        notes: formData.get('notes') || document.getElementById('notes').value,
        dateAdded: new Date().toISOString()
    };
    
    // Validate required fields
    if (!cropInfo.cropType || !cropInfo.plantingDate || !cropInfo.fieldSize) {
        showToast(getTranslation('common.error') + ': Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        // Add to crop data array
        cropData.push(cropInfo);
        
        // Save to localStorage
        saveCropData();
        
        // Clear form
        clearCropForm();
        
        // Hide loading
        hideLoading();
        
        // Show success message
        showToast(getTranslation('crop.cropAdded'), 'success');
        
        // Update predictions if on predictions tab
        if (currentTab === 'predictions') {
            updatePredictionsDisplay();
        }
    }, 1500);
}

function submitCropData(event) {
    handleCropFormSubmit(event);
}

// Clear crop form
function clearCropForm() {
    const form = document.querySelector('.crop-form');
    if (form) {
        form.reset();
    }
}

// Location change handler
function handleLocationChange(event) {
    const selectedLocation = event.target.value;
    showLoading();
    
    // Simulate weather API call
    setTimeout(() => {
        loadWeatherData(selectedLocation);
        hideLoading();
        showToast(`Weather updated for ${selectedLocation}`, 'success');
    }, 1000);
}

// Prediction crop change handler
function handlePredictionCropChange(event) {
    const selectedCrop = event.target.value;
    updatePredictionsDisplay(selectedCrop);
}

// Load weather data
function loadWeatherData(location = 'New Delhi') {
    // Simulate weather API data
    weatherData = {
        location: location,
        current: {
            temperature: '28°C',
            condition: 'Partly Cloudy',
            humidity: '65%',
            rainfall: '2mm',
            windSpeed: '12 km/h',
            icon: 'fas fa-sun'
        },
        forecast: [
            { day: 'Today', icon: 'fas fa-sun', high: '32°', low: '22°', rain: '10%' },
            { day: 'Tomorrow', icon: 'fas fa-cloud-rain', high: '28°', low: '20°', rain: '80%' },
            { day: 'Wed', icon: 'fas fa-cloud', high: '26°', low: '18°', rain: '60%' },
            { day: 'Thu', icon: 'fas fa-sun', high: '30°', low: '21°', rain: '20%' },
            { day: 'Fri', icon: 'fas fa-cloud-rain', high: '24°', low: '16°', rain: '90%' }
        ],
        alerts: [
            {
                type: 'Heavy Rain',
                description: 'Heavy rainfall expected tomorrow. Take necessary precautions for crops.',
                severity: 'high'
            },
            {
                type: 'High Wind',
                description: 'Strong winds expected in the afternoon. Secure loose structures.',
                severity: 'medium'
            }
        ]
    };
}

// Update weather display
function updateWeatherDisplay() {
    if (!weatherData) return;
    
    // Update current weather
    const tempElements = document.querySelectorAll('.temperature');
    tempElements.forEach(el => {
        if (el.textContent.includes('°C')) {
            el.textContent = weatherData.current.temperature;
        }
    });
    
    // Update weather metrics
    const metricValues = document.querySelectorAll('.metric-value');
    if (metricValues.length >= 4) {
        metricValues[0].textContent = weatherData.current.temperature;
        metricValues[1].textContent = weatherData.current.humidity;
        metricValues[2].textContent = weatherData.current.rainfall;
        metricValues[3].textContent = weatherData.current.windSpeed;
    }
}

// Update predictions display
function updatePredictionsDisplay(selectedCrop = 'wheat') {
    if (cropData.length === 0) {
        // Show no predictions message
        return;
    }
    
    // Simulate prediction data based on crop data
    const predictions = generatePredictions(selectedCrop);
    
    // Update prediction cards
    const predictionValues = document.querySelectorAll('.prediction-value');
    if (predictionValues.length >= 4) {
        predictionValues[0].textContent = predictions.yield;
        predictionValues[1].textContent = predictions.harvestDate;
        predictionValues[2].textContent = predictions.healthScore + '%';
        predictionValues[3].textContent = predictions.marketPrice;
    }
    
    // Update confidence meter
    const confidenceFill = document.querySelector('.confidence-fill');
    const confidenceText = document.querySelector('.confidence-text');
    if (confidenceFill && confidenceText) {
        confidenceFill.style.width = predictions.confidence + '%';
        confidenceText.textContent = predictions.confidence + '%';
    }
}

// Generate predictions based on crop data
function generatePredictions(cropType) {
    const baseData = {
        wheat: {
            yield: '45 quintals/acre',
            harvestDate: '15 April 2024',
            healthScore: 85,
            marketPrice: '₹2,200/quintal',
            confidence: 92
        },
        rice: {
            yield: '38 quintals/acre',
            harvestDate: '25 October 2024',
            healthScore: 78,
            marketPrice: '₹1,800/quintal',
            confidence: 88
        },
        corn: {
            yield: '52 quintals/acre',
            harvestDate: '10 September 2024',
            healthScore: 82,
            marketPrice: '₹1,500/quintal',
            confidence: 90
        }
    };
    
    return baseData[cropType] || baseData.wheat;
}

// Auto-resize chat input
function autoResizeChatInput() {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    }
}

// Initialize chat suggestions
function initializeChatSuggestions() {
    const suggestions = document.querySelectorAll('.suggestion-btn');
    const chatSuggestions = document.getElementById('chat-suggestions');
    
    // Show suggestions only if no messages (except welcome)
    const messages = document.querySelectorAll('.message');
    if (messages.length <= 1 && chatSuggestions) {
        chatSuggestions.style.display = 'block';
    }
}

// Data persistence
function saveCropData() {
    localStorage.setItem('cropData', JSON.stringify(cropData));
}

function loadSavedData() {
    const savedCropData = localStorage.getItem('cropData');
    if (savedCropData) {
        try {
            cropData = JSON.parse(savedCropData);
        } catch (e) {
            console.error('Error loading saved crop data:', e);
            cropData = [];
        }
    }
}

// Loading overlay
function showLoading() {
    isLoading = true;
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('show');
    }
}

function hideLoading() {
    isLoading = false;
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.querySelector('.toast-icon');
    const toastMessage = document.querySelector('.toast-message');
    
    if (toast && toastIcon && toastMessage) {
        // Set message and icon
        toastMessage.textContent = message;
        
        // Set icon based on type
        if (type === 'success') {
            toastIcon.className = 'toast-icon fas fa-check-circle';
            toast.className = 'toast success';
        } else if (type === 'error') {
            toastIcon.className = 'toast-icon fas fa-exclamation-circle';
            toast.className = 'toast error';
        }
        
        // Show toast
        toast.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Keyboard navigation support
document.addEventListener('keydown', function(event) {
    // Tab navigation with arrow keys
    if (event.altKey) {
        const tabs = ['home', 'crop', 'weather', 'predictions', 'chat'];
        const currentIndex = tabs.indexOf(currentTab);
        
        if (event.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
            event.preventDefault();
            showTab(tabs[currentIndex + 1]);
        } else if (event.key === 'ArrowLeft' && currentIndex > 0) {
            event.preventDefault();
            showTab(tabs[currentIndex - 1]);
        }
    }
    
    // Language toggle with Ctrl+L
    if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        toggleLanguage();
    }
});

// Export functions for global access
window.showTab = showTab;
window.submitCropData = submitCropData;
window.clearCropForm = clearCropForm;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;

// Multilingual support for the Agricultural Assistant App
const translations = {
    en: {
        app: {
            title: "Agricultural Assistant"
        },
        nav: {
            home: "Home",
            crop: "Crop Data",
            weather: "Weather",
            predictions: "Predictions",
            chat: "Chat Assistant"
        },
        common: {
            welcome: "Welcome, Farmer",
            loading: "Loading...",
            success: "Success!",
            error: "Error",
            clear: "Clear",
            submit: "Submit",
            language: "Language"
        },
        home: {
            welcome: "Welcome, Farmer",
            subtitle: "Your digital farming companion",
            quickActions: "Quick Actions",
            addCrop: "Add Crop Data",
            checkWeather: "Check Weather",
            viewPredictions: "View Predictions",
            askQuestion: "Ask Assistant",
            todayWeather: "Today's Weather",
            recentActivity: "Recent Activity"
        },
        crop: {
            title: "Crop Information",
            subtitle: "Enter your crop details",
            cropType: "Crop Type",
            selectCrop: "Select Crop Type",
            plantingDate: "Planting Date",
            fieldSize: "Field Size (acres)",
            soilType: "Soil Type",
            selectSoil: "Select Soil Type",
            irrigationType: "Irrigation Type",
            selectIrrigation: "Select Irrigation Type",
            fertilizer: "Fertilizer Used",
            pesticide: "Pesticide Used",
            expectedHarvest: "Expected Harvest Date",
            notes: "Additional Notes",
            addCrop: "Add Crop",
            cropAdded: "Crop data added successfully!"
        },
        weather: {
            title: "Weather Information",
            currentWeather: "Current Weather",
            temperature: "Temperature",
            humidity: "Humidity",
            rainfall: "Rainfall",
            windSpeed: "Wind Speed",
            forecast: "7-Day Forecast",
            alerts: "Weather Alerts",
            location: "Location",
            updateLocation: "Update Location"
        },
        predictions: {
            title: "Crop Predictions",
            selectedCrop: "Selected Crop",
            yieldPrediction: "Yield Prediction",
            harvestTime: "Optimal Harvest Time",
            riskAnalysis: "Risk Analysis",
            recommendations: "Recommendations",
            cropHealth: "Crop Health",
            marketPrice: "Market Price Forecast",
            noPredictions: "No predictions available. Please add crop data first."
        },
        chat: {
            title: "Chat Assistant",
            placeholder: "Ask me about farming, crops, weather...",
            send: "Send",
            thinking: "Assistant is thinking...",
            welcome: "Hello! I am your farming assistant. How can I help you today?",
            suggestions: [
                "How to improve crop yield?",
                "Best time to plant wheat?",
                "Organic fertilizer tips",
                "Pest control methods"
            ]
        }
    },
    hi: {
        app: {
            title: "कृषि सहायक"
        },
        nav: {
            home: "होम",
            crop: "फसल डेटा",
            weather: "मौसम",
            predictions: "भविष्यवाणी",
            chat: "चैट सहायक"
        },
        common: {
            welcome: "स्वागत है, किसान जी",
            loading: "लोड हो रहा है...",
            success: "सफल!",
            error: "त्रुटि",
            clear: "साफ करें",
            submit: "जमा करें",
            language: "भाषा"
        },
        home: {
            welcome: "स्वागत है, किसान जी",
            subtitle: "आपका डिजिटल खेती साथी",
            quickActions: "त्वरित कार्य",
            addCrop: "फसल डेटा जोड़ें",
            checkWeather: "मौसम देखें",
            viewPredictions: "भविष्यवाणी देखें",
            askQuestion: "सहायक से पूछें",
            todayWeather: "आज का मौसम",
            recentActivity: "हाल की गतिविधि"
        },
        crop: {
            title: "फसल की जानकारी",
            subtitle: "अपनी फसल का विवरण दर्ज करें",
            cropType: "फसल का प्रकार",
            selectCrop: "फसल का प्रकार चुनें",
            plantingDate: "बोने की तारीख",
            fieldSize: "खेत का आकार (एकड़)",
            soilType: "मिट्टी का प्रकार",
            selectSoil: "मिट्टी का प्रकार चुनें",
            irrigationType: "सिंचाई का प्रकार",
            selectIrrigation: "सिंचाई का प्रकार चुनें",
            fertilizer: "उपयोग की गई खाद",
            pesticide: "उपयोग की गई कीटनाशक",
            expectedHarvest: "अपेक्षित फसल की तारीख",
            notes: "अतिरिक्त टिप्पणी",
            addCrop: "फसल जोड़ें",
            cropAdded: "फसल डेटा सफलतापूर्वक जोड़ा गया!"
        },
        weather: {
            title: "मौसम की जानकारी",
            currentWeather: "वर्तमान मौसम",
            temperature: "तापमान",
            humidity: "नमी",
            rainfall: "बारिश",
            windSpeed: "हवा की गति",
            forecast: "7-दिन का पूर्वानुमान",
            alerts: "मौसम चेतावनी",
            location: "स्थान",
            updateLocation: "स्थान अपडेट करें"
        },
        predictions: {
            title: "फसल भविष्यवाणी",
            selectedCrop: "चयनित फसल",
            yieldPrediction: "उपज की भविष्यवाणी",
            harvestTime: "इष्टतम फसल का समय",
            riskAnalysis: "जोखिम विश्लेषण",
            recommendations: "सुझाव",
            cropHealth: "फसल की सेहत",
            marketPrice: "बाजार मूल्य पूर्वानुमान",
            noPredictions: "कोई भविष्यवाणी उपलब्ध नहीं। कृपया पहले फसल डेटा जोड़ें।"
        },
        chat: {
            title: "चैट सहायक",
            placeholder: "खेती, फसल, मौसम के बारे में पूछें...",
            send: "भेजें",
            thinking: "सहायक सोच रहा है...",
            welcome: "नमस्ते! मैं आपका कृषि सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
            suggestions: [
                "फसल की पैदावार कैसे बढ़ाएं?",
                "गेहूं बोने का सबसे अच्छा समय?",
                "जैविक खाद के टिप्स",
                "कीट नियंत्रण के तरीके"
            ]
        }
    }
};

// Current language state
let currentLanguage = 'en';

// Initialize language based on browser preference
function initializeLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('hi')) {
        currentLanguage = 'hi';
    }
    updateLanguageDisplay();
    translatePage();
}

// Toggle between English and Hindi
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    updateLanguageDisplay();
    translatePage();
    
    // Save preference to localStorage
    localStorage.setItem('preferredLanguage', currentLanguage);
    
    // Show success message
    showToast(currentLanguage === 'en' ? 'Language changed to English' : 'भाषा हिंदी में बदल गई', 'success');
}

// Update language toggle button
function updateLanguageDisplay() {
    const langButton = document.getElementById('current-lang');
    if (langButton) {
        langButton.textContent = currentLanguage === 'en' ? 'हिं' : 'EN';
    }
}

// Translate all elements on the page
function translatePage() {
    const elements = document.querySelectorAll('[data-translate]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = getNestedTranslation(translations[currentLanguage], key);
        
        if (translation) {
            if (element.tagName === 'INPUT' && element.type !== 'button' && element.type !== 'submit') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Update document title
    document.title = translations[currentLanguage].app.title + " - Farmer's Digital Companion";
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
}

// Get nested translation value
function getNestedTranslation(obj, key) {
    return key.split('.').reduce((o, k) => (o || {})[k], obj);
}

// Get translation for a specific key
function getTranslation(key) {
    return getNestedTranslation(translations[currentLanguage], key) || key;
}

// Load saved language preference
function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
        currentLanguage = savedLang;
    }
}

// Initialize translations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadLanguagePreference();
    initializeLanguage();
});

// Export functions for use in other scripts
window.getTranslation = getTranslation;
window.toggleLanguage = toggleLanguage;
window.currentLanguage = () => currentLanguage;

// Chat functionality for Agricultural Assistant

// Chat state
let chatMessages = [];
let isTyping = false;
let chatInitialized = false;

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
});

// Initialize chat functionality
function initializeChat() {
    if (chatInitialized) return;
    
    // Add welcome message
    const welcomeMessage = {
        id: 1,
        text: getTranslation('chat.welcome'),
        isBot: true,
        timestamp: new Date()
    };
    
    chatMessages = [welcomeMessage];
    chatInitialized = true;
    
    // Set up chat input event listeners
    setupChatEventListeners();
}

// Set up chat event listeners
function setupChatEventListeners() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', handleChatKeyPress);
        chatInput.addEventListener('input', updateSendButton);
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
}

// Handle chat input key press
function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Update send button state
function updateSendButton() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (chatInput && sendBtn) {
        const hasText = chatInput.value.trim().length > 0;
        sendBtn.disabled = !hasText || isTyping;
        sendBtn.style.opacity = (hasText && !isTyping) ? '1' : '0.5';
    }
}

// Send message
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput || isTyping) return;
    
    const messageText = chatInput.value.trim();
    if (!messageText) return;
    
    // Add user message
    const userMessage = {
        id: Date.now(),
        text: messageText,
        isBot: false,
        timestamp: new Date()
    };
    
    chatMessages.push(userMessage);
    addMessageToChat(userMessage);
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    updateSendButton();
    
    // Hide suggestions after first message
    hideChatSuggestions();
    
    // Show typing indicator
    showTypingIndicator();
    
    // Generate bot response
    setTimeout(() => {
        const botResponse = generateBotResponse(messageText);
        const botMessage = {
            id: Date.now() + 1,
            text: botResponse,
            isBot: true,
            timestamp: new Date()
        };
        
        chatMessages.push(botMessage);
        hideTypingIndicator();
        addMessageToChat(botMessage);
    }, 1500 + Math.random() * 1000); // Random delay for more natural feel
}

// Send suggestion
function sendSuggestion(suggestionText) {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = suggestionText;
        sendMessage();
    }
}

// Add message to chat display
function addMessageToChat(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageElement = createMessageElement(message);
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add fade-in animation
    setTimeout(() => {
        messageElement.classList.add('fade-in');
    }, 10);
}

// Create message element
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.isBot ? 'bot-message' : 'user-message'}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = message.isBot ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = message.text;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = formatMessageTime(message.timestamp);
    
    contentDiv.appendChild(textDiv);
    contentDiv.appendChild(timeDiv);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    return messageDiv;
}

// Format message timestamp
function formatMessageTime(timestamp) {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) {
        return currentLanguage === 'hi' ? 'अभी' : 'Just now';
    } else if (diffInMinutes < 60) {
        return currentLanguage === 'hi' ? `${diffInMinutes} मिनट पहले` : `${diffInMinutes}m ago`;
    } else {
        return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// Show typing indicator
function showTypingIndicator() {
    isTyping = true;
    updateSendButton();
    
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-text">
                <i class="fas fa-spinner fa-spin"></i>
                ${getTranslation('chat.thinking')}
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    isTyping = false;
    updateSendButton();
    
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Hide chat suggestions
function hideChatSuggestions() {
    const suggestions = document.getElementById('chat-suggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
}

// Generate bot response based on user input
function generateBotResponse(userText) {
    const text = userText.toLowerCase();
    const isHindi = currentLanguage === 'hi';
    
    // Yield/Production related queries
    if (text.includes('yield') || text.includes('production') || text.includes('पैदावार') || text.includes('उत्पादन')) {
        return isHindi 
            ? 'फसल की पैदावार बढ़ाने के लिए: 1) मिट्टी की जांच और पोषक तत्व प्रबंधन, 2) उचित बीज दर, 3) समय पर सिंचाई, 4) एकीकृत कीट प्रबंधन, और 5) गुणवत्तापूर्ण बीजों का उपयोग करें। आप कौन सी फसल उगा रहे हैं?'
            : 'To improve crop yield, consider: 1) Proper soil testing and nutrient management, 2) Optimal planting density, 3) Timely irrigation, 4) Integrated pest management, and 5) Using quality seeds. What specific crop are you growing?';
    }
    
    // Wheat related queries
    if (text.includes('wheat') || text.includes('गेहूं')) {
        return isHindi
            ? 'गेहूं की खेती के लिए: नवंबर-दिसंबर में बुआई करें। प्रति हेक्टेयर 100-120 किलो बीज का उपयोग करें। संतुलित उर्वरक (NPK) डालें और फूल आने के समय उचित सिंचाई सुनिश्चित करें। जब दाने में 18-20% नमी हो तो कटाई करें।'
            : 'For wheat cultivation: Plant in November-December for best results. Use 100-120 kg seeds per hectare. Apply balanced fertilizers (NPK) and ensure proper irrigation during flowering stage. Harvest when grain moisture is 18-20%.';
    }
    
    // Fertilizer related queries
    if (text.includes('fertilizer') || text.includes('खाद') || text.includes('उर्वरक')) {
        return isHindi
            ? 'जैविक खाद के लिए विचार करें: 1) खेत के कचरे से कंपोस्ट, 2) वर्मी कंपोस्ट, 3) ढैंचा जैसी हरी खाद की फसलें, 4) राइजोबियम जैसे जैव उर्वरक। मिट्टी की स्थिति के अनुसार प्रति हेक्टेयर 5-10 टन डालें।'
            : 'For organic fertilizers, consider: 1) Compost from farm waste, 2) Vermicompost, 3) Green manure crops like dhaincha, 4) Biofertilizers like Rhizobium. Apply 5-10 tons per hectare depending on soil condition.';
    }
    
    // Pest control queries
    if (text.includes('pest') || text.includes('कीट') || text.includes('control') || text.includes('नियंत्रण')) {
        return isHindi
            ? 'प्रभावी कीट नियंत्रण के लिए: 1) IPM (एकीकृत कीट प्रबंधन) का उपयोग करें, 2) फेरोमोन ट्रैप लगाएं, 3) प्राकृतिक शिकारियों को बढ़ावा दें, 4) नीम आधारित कीटनाशकों का उपयोग करें, 5) फसल चक्र अपनाएं। जल्दी पहचान के लिए नियमित रूप से खेत की निगरानी करें।'
            : 'For effective pest control: 1) Use IPM (Integrated Pest Management), 2) Install pheromone traps, 3) Encourage natural predators, 4) Use neem-based pesticides, 5) Crop rotation. Monitor fields regularly for early detection.';
    }
    
    // Weather related queries
    if (text.includes('weather') || text.includes('मौसम') || text.includes('rain') || text.includes('बारिश')) {
        return isHindi
            ? 'मौसम खेती की सफलता के लिए महत्वपूर्ण है। नियमित रूप से मौसम पूर्वानुमान देखें, सिंचाई की योजना बनाएं, चरम मौसम के दौरान फसलों की सुरक्षा करें, और मौसम आधारित बीमा पर विचार करें। क्या आप वर्तमान मौसम स्थितियों के लिए विशिष्ट सलाह चाहते हैं?'
            : 'Weather is crucial for farming success. Check forecasts regularly, plan irrigation accordingly, protect crops during extreme weather, and consider weather-based insurance. Would you like specific advice for current weather conditions?';
    }
    
    // Soil related queries
    if (text.includes('soil') || text.includes('मिट्टी')) {
        return isHindi
            ? 'मिट्टी की सेहत के लिए: 1) नियमित मिट्टी परीक्षण कराएं, 2) जैविक पदार्थ बढ़ाएं, 3) फसल चक्र अपनाएं, 4) मिट्टी की कटाव रोकें, 5) उचित जल निकासी सुनिश्चित करें। आपकी मिट्टी का प्रकार क्या है?'
            : 'For soil health: 1) Regular soil testing, 2) Increase organic matter, 3) Practice crop rotation, 4) Prevent soil erosion, 5) Ensure proper drainage. What type of soil do you have?';
    }
    
    // Irrigation queries
    if (text.includes('irrigation') || text.includes('सिंचाई') || text.includes('water') || text.includes('पानी')) {
        return isHindi
            ? 'कुशल सिंचाई के लिए: 1) ड्रिप सिंचाई का उपयोग करें, 2) मिट्टी की नमी की निगरानी करें, 3) सुबह या शाम को सिंचाई करें, 4) मल्चिंग करें, 5) वर्षा जल संचयन करें। आप कौन सी सिंचाई पद्धति का उपयोग कर रहे हैं?'
            : 'For efficient irrigation: 1) Use drip irrigation, 2) Monitor soil moisture, 3) Irrigate in morning or evening, 4) Apply mulching, 5) Harvest rainwater. Which irrigation method are you currently using?';
    }
    
    // Market/Price queries
    if (text.includes('market') || text.includes('price') || text.includes('बाजार') || text.includes('मूल्य') || text.includes('कीमत')) {
        return isHindi
            ? 'बाजार की जानकारी के लिए: 1) स्थानीय मंडी की दरें देखें, 2) ऑनलाइन प्लेटफॉर्म का उपयोग करें, 3) किसान उत्पादक संगठनों से जुड़ें, 4) फसल की गुणवत्ता बनाए रखें, 5) उचित भंडारण करें। आप कौन सी फसल बेचना चाहते हैं?'
            : 'For market information: 1) Check local mandi rates, 2) Use online platforms, 3) Connect with farmer producer organizations, 4) Maintain crop quality, 5) Proper storage. Which crop are you looking to sell?';
    }
    
    // Organic farming queries
    if (text.includes('organic') || text.includes('जैविक')) {
        return isHindi
            ? 'जैविक खेती के लिए: 1) रासायनिक उर्वरकों और कीटनाशकों से बचें, 2) कंपोस्ट और वर्मी कंपोस्ट का उपयोग करें, 3) जैविक कीट नियंत्रण अपनाएं, 4) फसल चक्र और मिश्रित खेती करें, 5) प्रमाणीकरण प्राप्त करें। क्या आप जैविक खेती शुरू करना चाहते हैं?'
            : 'For organic farming: 1) Avoid chemical fertilizers and pesticides, 2) Use compost and vermicompost, 3) Adopt biological pest control, 4) Practice crop rotation and mixed farming, 5) Get certification. Are you looking to start organic farming?';
    }
    
    // General greeting responses
    if (text.includes('hello') || text.includes('hi') || text.includes('नमस्ते') || text.includes('हैलो')) {
        return isHindi
            ? 'नमस्ते! मैं आपका कृषि सहायक हूँ। मैं खेती, फसल, मौसम, और कृषि तकनीकों के बारे में आपकी मदद कर सकता हूँ। आज आपको किस विषय में सहायता चाहिए?'
            : 'Hello! I am your agricultural assistant. I can help you with farming, crops, weather, and agricultural techniques. What would you like assistance with today?';
    }
    
    // Thank you responses
    if (text.includes('thank') || text.includes('धन्यवाद') || text.includes('शुक्रिया')) {
        return isHindi
            ? 'आपका स्वागत है! मुझे आपकी मदद करके खुशी हुई। यदि आपके कोई और प्रश्न हैं तो बेझिझक पूछें। सफल खेती की शुभकामनाएं!'
            : 'You are welcome! I am happy to help you. If you have any more questions, feel free to ask. Wishing you successful farming!';
    }
    
    // Default response
    return isHindi
        ? 'मैं आपके कृषि संबंधी प्रश्न को समझ गया हूँ। कृषि सहायक के रूप में, मैं फसल प्रबंधन, मौसम मार्गदर्शन, कीट नियंत्रण, उर्वरक सुझाव, और अन्य कृषि विषयों में आपकी सहायता कर सकता हूँ। क्या आप अपनी कृषि आवश्यकताओं के बारे में अधिक विस्तार से बता सकते हैं?'
        : 'I understand your question about farming. As your agricultural assistant, I can help with crop management, weather guidance, pest control, fertilizer recommendations, and more. Could you provide more specific details about your farming needs?';
}

// Export functions for global access
window.sendMessage = sendMessage;
window.sendSuggestion = sendSuggestion;
window.handleChatKeyPress = handleChatKeyPress;
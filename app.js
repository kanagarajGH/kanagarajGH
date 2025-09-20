// Application Data
const appData = {
  "trains": [
    {"id": "T001", "name": "Rajdhani Express", "number": "12951", "status": "On Time", "position": {"lat": 28.6139, "lng": 77.2090}, "delay": 0, "route": "New Delhi to Mumbai"},
    {"id": "T002", "name": "Shatabdi Express", "number": "12002", "status": "Delayed", "position": {"lat": 26.9124, "lng": 75.7873}, "delay": 15, "route": "New Delhi to Jaipur"},
    {"id": "T003", "name": "Duronto Express", "number": "12259", "status": "On Time", "position": {"lat": 22.5726, "lng": 88.3639}, "delay": 0, "route": "New Delhi to Kolkata"},
    {"id": "T004", "name": "Garib Rath", "number": "12506", "status": "Early", "position": {"lat": 25.5941, "lng": 85.1376}, "delay": -5, "route": "New Delhi to Patna"}
  ],
  "stations": [
    {"id": "S001", "name": "New Delhi Railway Station", "code": "NDLS", "position": {"lat": 28.6428, "lng": 77.2197}, "platforms": 16, "facilities": ["WiFi", "Food Court", "Waiting Room"]},
    {"id": "S002", "name": "Mumbai Central", "code": "BCT", "position": {"lat": 19.0176, "lng": 72.8562}, "platforms": 7, "facilities": ["WiFi", "Parking", "ATM"]},
    {"id": "S003", "name": "Jaipur Junction", "code": "JP", "position": {"lat": 26.9196, "lng": 75.7878}, "platforms": 5, "facilities": ["Food Court", "Waiting Room"]},
    {"id": "S004", "name": "Kolkata Station", "code": "KOAA", "position": {"lat": 22.5675, "lng": 88.3686}, "platforms": 12, "facilities": ["WiFi", "Medical", "Parking"]}
  ],
  "routes": [
    {"id": "R001", "name": "Delhi-Mumbai Route", "distance": "1384 km", "stations": ["NDLS", "BCT"], "status": "Active"},
    {"id": "R002", "name": "Delhi-Jaipur Route", "distance": "308 km", "stations": ["NDLS", "JP"], "status": "Active"},
    {"id": "R003", "name": "Delhi-Kolkata Route", "distance": "1472 km", "stations": ["NDLS", "KOAA"], "status": "Maintenance"}
  ],
  "alerts": [
    {"id": "A001", "type": "Track Maintenance", "severity": "Medium", "message": "Track maintenance scheduled on Delhi-Kolkata route", "location": {"lat": 25.4358, "lng": 81.8463}, "timestamp": "2025-09-19T10:30:00Z"},
    {"id": "A002", "type": "Weather", "severity": "High", "message": "Heavy rainfall expected in Mumbai region", "location": {"lat": 19.0760, "lng": 72.8777}, "timestamp": "2025-09-19T09:15:00Z"},
    {"id": "A003", "type": "Signal Issue", "severity": "Low", "message": "Minor signal delay at Jaipur Junction", "location": {"lat": 26.9196, "lng": 75.7878}, "timestamp": "2025-09-19T11:45:00Z"}
  ],
  "chatHistory": [
    {"id": 1, "sender": "Support", "message": "Welcome to Railway Monitoring Support! How can I help you today?", "timestamp": "10:30 AM"},
    {"id": 2, "sender": "User", "message": "I need information about train delays on the Delhi-Mumbai route", "timestamp": "10:32 AM"},
    {"id": 3, "sender": "Support", "message": "I can see that Rajdhani Express (12951) is currently on time. Would you like more details about this route?", "timestamp": "10:33 AM"},
    {"id": 4, "sender": "User", "message": "Yes, please provide the current status", "timestamp": "10:35 AM"}
  ],
  "weather": [
    {"location": "Delhi", "temperature": "32°C", "condition": "Clear", "humidity": "65%"},
    {"location": "Mumbai", "temperature": "28°C", "condition": "Rainy", "humidity": "85%"},
    {"location": "Jaipur", "temperature": "35°C", "condition": "Sunny", "humidity": "45%"},
    {"location": "Kolkata", "temperature": "30°C", "condition": "Cloudy", "humidity": "75%"}
  ],
  "analytics": {
    "totalTrains": 247,
    "onTimePerformance": "87%",
    "totalStations": 156,
    "activeAlerts": 3,
    "dailyPassengers": "2.3M",
    "networkUtilization": "78%"
  }
};

// Application State
let appState = {
  isLoggedIn: false,
  currentPage: 'dashboard',
  currentMapView: 'track',
  isChatOpen: false,
  isFullscreen: false,
  searchResults: [],
  zoomLevel: 1,
  mapPosition: { x: 0, y: 0 }
};

// DOM Elements
const loginPage = document.getElementById('loginPage');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const clearSearchBtn = document.getElementById('clearSearch');
const mapContent = document.getElementById('mapContent');
const pageOverlay = document.getElementById('pageOverlay');
const chatPanel = document.getElementById('chatPanel');
const chatHistory = document.getElementById('chatHistory');
const chatInput = document.getElementById('chatInput');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Check if user is already logged in
  if (localStorage.getItem('isLoggedIn') === 'true') {
    appState.isLoggedIn = true;
    showMainApp();
  } else {
    showLoginPage();
  }

  setupEventListeners();
  renderChatHistory();
}

function setupEventListeners() {
  // Login form
  loginForm.addEventListener('submit', handleLogin);

  // Search functionality
  searchInput.addEventListener('input', handleSearch);
  clearSearchBtn.addEventListener('click', clearSearch);

  // Hide search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      hideSearchResults();
    }
  });

  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.dataset.page;
      navigateToPage(page);
    });
  });

  // Bottom bar navigation - Fixed event handling
  document.querySelectorAll('.bottom-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const mapType = e.currentTarget.dataset.map;
      if (mapType) {
        console.log('Switching to map:', mapType); // Debug log
        switchMapView(mapType);
      } else if (e.currentTarget.id === 'chatToggle') {
        toggleChat();
      }
    });
  });

  // Chat functionality
  document.getElementById('chatToggle').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleChat();
  });
  document.getElementById('closeChatBtn').addEventListener('click', closeChat);
  document.getElementById('sendChatBtn').addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });

  // Map controls
  document.getElementById('fullscreenToggle').addEventListener('click', toggleFullscreen);
  document.getElementById('zoomIn').addEventListener('click', () => adjustZoom(0.1));
  document.getElementById('zoomOut').addEventListener('click', () => adjustZoom(-0.1));
  document.getElementById('resetZoom').addEventListener('click', resetZoom);

  // Map dragging
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

  mapContent.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    mapContent.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      appState.mapPosition.x += deltaX;
      appState.mapPosition.y += deltaY;
      dragStart = { x: e.clientX, y: e.clientY };
      updateMapTransform();
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    mapContent.style.cursor = 'grab';
  });
}

function handleLogin(e) {
  e.preventDefault();
  const employeeId = document.getElementById('employeeId').value;
  const password = document.getElementById('password').value;

  // Validate credentials
  if (employeeId === 'EMP001' && password === 'admin123') {
    appState.isLoggedIn = true;
    localStorage.setItem('isLoggedIn', 'true');
    showMainApp();
    hideLoginError();
  } else {
    showLoginError('Invalid Employee ID or Password');
  }
}

function showLoginError(message) {
  loginError.textContent = message;
  loginError.classList.remove('hidden');
}

function hideLoginError() {
  loginError.classList.add('hidden');
}

function showLoginPage() {
  loginPage.classList.remove('hidden');
  mainApp.classList.add('hidden');
}

function showMainApp() {
  loginPage.classList.add('hidden');
  mainApp.classList.remove('hidden');
  navigateToPage('dashboard');
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  
  if (query.length === 0) {
    hideSearchResults();
    return;
  }

  // Filter trains based on search query
  const results = appData.trains.filter(train => 
    train.name.toLowerCase().includes(query) || 
    train.number.includes(query)
  );

  displaySearchResults(results);
}

function displaySearchResults(results) {
  clearSearchBtn.classList.remove('hidden');
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item">No trains found</div>';
    searchResults.classList.remove('hidden');
    return;
  }

  const resultsHtml = results.map(train => `
    <div class="search-result-item" data-train-id="${train.id}">
      <div style="font-weight: 500;">${train.name}</div>
      <div style="font-size: 12px; color: var(--color-text-secondary);">
        ${train.number} - ${train.status}
        ${train.delay !== 0 ? ` (${train.delay > 0 ? '+' : ''}${train.delay} min)` : ''}
      </div>
      <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 2px;">
        ${train.route}
      </div>
    </div>
  `).join('');

  searchResults.innerHTML = resultsHtml;
  searchResults.classList.remove('hidden');

  // Add click listeners to results
  searchResults.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const trainId = e.currentTarget.dataset.trainId;
      if (trainId) {
        focusOnTrain(trainId);
        hideSearchResults();
        searchInput.value = '';
      }
    });
  });
}

function hideSearchResults() {
  searchResults.classList.add('hidden');
  if (searchInput.value.trim() === '') {
    clearSearchBtn.classList.add('hidden');
  }
}

function clearSearch() {
  searchInput.value = '';
  hideSearchResults();
  clearSearchBtn.classList.add('hidden');
}

function focusOnTrain(trainId) {
  const train = appData.trains.find(t => t.id === trainId);
  if (train) {
    // Navigate to train tracking and show movement map
    navigateToPage('train-tracking');
    switchMapView('movement');
    
    // Show train details (simulated focus)
    setTimeout(() => {
      alert(`Focused on ${train.name} (${train.number})\nStatus: ${train.status}\nRoute: ${train.route}`);
    }, 500);
  }
}

function navigateToPage(page) {
  // Update navigation state
  appState.currentPage = page;
  
  // Update active navigation item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });

  // Render page content
  renderPageContent(page);
  
  // Update URL without page reload
  history.pushState({page}, '', `#${page}`);
}

function switchMapView(mapType) {
  console.log('Switching map view to:', mapType); // Debug log
  appState.currentMapView = mapType;
  
  // Update active bottom button
  document.querySelectorAll('.bottom-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.map === mapType) {
      btn.classList.add('active');
    }
  });

  renderMapContent(mapType);
}

function renderPageContent(page) {
  // Clear previous overlay content
  pageOverlay.innerHTML = '';

  switch (page) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'train-tracking':
      switchMapView('movement');
      break;
    case 'station-management':
      switchMapView('station');
      break;
    case 'route-planning':
      renderRoutePlanning();
      break;
    case 'maintenance':
      renderMaintenance();
      break;
    case 'alerts':
      renderAlerts();
      break;
    case 'analytics':
      renderAnalytics();
      break;
    case 'settings':
      renderSettings();
      break;
  }
}

function renderDashboard() {
  const kpiCards = `
    <div class="dashboard-overlay">
      <div class="kpi-card">
        <div class="kpi-value">${appData.analytics.totalTrains}</div>
        <div class="kpi-label">Total Trains</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${appData.analytics.onTimePerformance}</div>
        <div class="kpi-label">On Time</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${appData.analytics.totalStations}</div>
        <div class="kpi-label">Stations</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${appData.analytics.activeAlerts}</div>
        <div class="kpi-label">Active Alerts</div>
      </div>
    </div>
  `;
  pageOverlay.innerHTML = kpiCards;
  renderMapContent('track');
}

function renderRoutePlanning() {
  const routeControls = `
    <div class="route-controls">
      <button class="route-btn" onclick="alert('Add Route functionality')">Add Route</button>
      <button class="route-btn" onclick="alert('Remove Route functionality')">Remove Route</button>
      <button class="route-btn" onclick="alert('Navigation functionality')">Navigation</button>
    </div>
  `;
  pageOverlay.innerHTML = routeControls;
  switchMapView('route');
}

function renderMaintenance() {
  switchMapView('track');
  renderMapContent('maintenance');
}

function renderAlerts() {
  switchMapView('track');
  renderMapContent('alerts');
}

function renderAnalytics() {
  const analyticsOverlay = `
    <div class="analytics-overlay">
      <h3>Performance Analytics</h3>
      <div class="chart-placeholder">
        Performance Chart<br>
        <small>On-time Performance: ${appData.analytics.onTimePerformance}</small>
      </div>
      <div style="margin-top: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Network Utilization:</span>
          <span style="font-weight: 500;">${appData.analytics.networkUtilization}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Daily Passengers:</span>
          <span style="font-weight: 500;">${appData.analytics.dailyPassengers}</span>
        </div>
      </div>
    </div>
  `;
  pageOverlay.innerHTML = analyticsOverlay;
  switchMapView('track');
}

function renderSettings() {
  const settingsPanel = `
    <div class="settings-panel">
      <h2>Settings</h2>
      <div class="settings-section">
        <h3>User Preferences</h3>
        <div class="form-group">
          <label class="form-label">Theme</label>
          <select class="form-control">
            <option>Light</option>
            <option>Dark</option>
            <option>Auto</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Language</label>
          <select class="form-control">
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>
      </div>
      <div class="settings-section">
        <h3>Notifications</h3>
        <div class="form-group checkbox-group">
          <input type="checkbox" id="emailNotifications" checked>
          <label for="emailNotifications">Email Notifications</label>
        </div>
        <div class="form-group checkbox-group">
          <input type="checkbox" id="alertNotifications" checked>
          <label for="alertNotifications">Alert Notifications</label>
        </div>
      </div>
      <div class="settings-section">
        <button class="btn btn--primary" onclick="alert('Settings saved successfully!')">Save Changes</button>
        <button class="btn btn--outline" style="margin-left: 8px;" onclick="navigateToPage('dashboard')">Cancel</button>
      </div>
    </div>
  `;
  pageOverlay.innerHTML = settingsPanel;
  mapContent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-text-secondary);">Configuration Panel Active</div>';
}

function renderMapContent(mapType) {
  let content = '';

  switch (mapType) {
    case 'track':
      content = renderTrackMap();
      break;
    case 'movement':
      content = renderMovementMap();
      break;
    case 'station':
      content = renderStationMap();
      break;
    case 'weather':
      content = renderWeatherMap();
      break;
    case 'route':
      content = renderRouteMap();
      break;
    case 'maintenance':
      content = renderMaintenanceMap();
      break;
    case 'alerts':
      content = renderAlertsMap();
      break;
  }

  mapContent.innerHTML = content;
  updateMapTransform();
}

function renderTrackMap() {
  return `
    <div style="position: relative; width: 100%; height: 100%; background: linear-gradient(45deg, var(--color-bg-1) 25%, transparent 25%, transparent 75%, var(--color-bg-1) 75%), linear-gradient(45deg, var(--color-bg-1) 25%, transparent 25%, transparent 75%, var(--color-bg-1) 75%); background-size: 20px 20px; background-position: 0 0, 10px 10px;">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: var(--color-text);">
        <i class="fas fa-subway" style="font-size: 48px; margin-bottom: 16px; color: var(--color-primary);"></i>
        <h3>Railway Track Network</h3>
        <p>Complete track layout and infrastructure</p>
      </div>
      ${renderStationMarkers()}
      ${renderTrackLines()}
    </div>
  `;
}

function renderMovementMap() {
  return `
    <div style="position: relative; width: 100%; height: 100%; background: var(--color-bg-2);">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: var(--color-text);">
        <i class="fas fa-location-arrow" style="font-size: 48px; margin-bottom: 16px; color: var(--color-primary);"></i>
        <h3>Live Train Movement</h3>
        <p>Real-time train positions and status</p>
      </div>
      ${renderTrainMarkers()}
      ${renderTrackLines()}
    </div>
  `;
}

function renderStationMap() {
  return `
    <div style="position: relative; width: 100%; height: 100%; background: var(--color-bg-3);">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: var(--color-text);">
        <i class="fas fa-building" style="font-size: 48px; margin-bottom: 16px; color: var(--color-primary);"></i>
        <h3>Station Details</h3>
        <p>Detailed station facilities and information</p>
      </div>
      ${renderStationMarkers(true)}
    </div>
  `;
}

function renderWeatherMap() {
  const weatherOverlay = `
    <div class="weather-info">
      <h3>Weather Conditions</h3>
      <div class="weather-grid">
        ${appData.weather.map(w => `
          <div class="weather-item">
            <div class="weather-location">${w.location}</div>
            <div class="weather-temp">${w.temperature}</div>
            <div class="weather-condition">${w.condition}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return `
    <div style="position: relative; width: 100%; height: 100%; background: var(--color-bg-4);">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: var(--color-text);">
        <i class="fas fa-cloud-rain" style="font-size: 48px; margin-bottom: 16px; color: var(--color-primary);"></i>
        <h3>Weather Monitoring</h3>
        <p>Weather conditions along railway routes</p>
      </div>
      ${weatherOverlay}
    </div>
  `;
}

function renderRouteMap() {
  return `
    <div style="position: relative; width: 100%; height: 100%; background: var(--color-bg-5);">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: var(--color-text);">
        <i class="fas fa-route" style="font-size: 48px; margin-bottom: 16px; color: var(--color-primary);"></i>
        <h3>Route Planning</h3>
        <p>Optimal routes and alternatives</p>
      </div>
      ${renderRouteLines()}
      ${renderStationMarkers()}
    </div>
  `;
}

function renderMaintenanceMap() {
  return `
    <div style="position: relative; width: 100%; height: 100%; background: var(--color-bg-6);">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: var(--color-text);">
        <i class="fas fa-wrench" style="font-size: 48px; margin-bottom: 16px; color: var(--color-primary);"></i>
        <h3>Maintenance Dashboard</h3>
        <p>Track maintenance and repair status</p>
      </div>
      ${renderMaintenanceMarkers()}
      ${renderTrackLines()}
    </div>
  `;
}

function renderAlertsMap() {
  return `
    <div style="position: relative; width: 100%; height: 100%; background: var(--color-bg-7);">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: var(--color-text);">
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; color: var(--color-error);"></i>
        <h3>Alert Monitoring</h3>
        <p>Active alerts and notifications</p>
      </div>
      ${renderAlertMarkers()}
      ${renderTrackLines()}
    </div>
  `;
}

function renderTrainMarkers() {
  return appData.trains.map((train, index) => {
    const statusClass = train.status === 'Delayed' ? 'delayed' : train.status === 'Early' ? 'early' : '';
    const position = {
      left: `${30 + index * 150}px`,
      top: `${200 + index * 50}px`
    };
    
    return `
      <div class="train-marker ${statusClass}" 
           style="left: ${position.left}; top: ${position.top};"
           title="${train.name} (${train.number}) - ${train.status}"
           onclick="alert('${train.name} (${train.number})\\nStatus: ${train.status}\\nRoute: ${train.route}')">
        <i class="fas fa-train" style="font-size: 10px;"></i>
      </div>
    `;
  }).join('');
}

function renderStationMarkers(detailed = false) {
  return appData.stations.map((station, index) => {
    const position = {
      left: `${100 + index * 200}px`,
      top: `${150 + index * 80}px`
    };
    
    return `
      <div class="station-marker" 
           style="left: ${position.left}; top: ${position.top};"
           title="${station.name} (${station.code}) - ${station.platforms} platforms"
           onclick="alert('${station.name} (${station.code})\\nPlatforms: ${station.platforms}\\nFacilities: ${station.facilities.join(', ')}')">
        <i class="fas fa-building" style="font-size: 12px; color: var(--color-primary);"></i>
      </div>
    `;
  }).join('');
}

function renderAlertMarkers() {
  return appData.alerts.map((alert, index) => {
    const severityClass = alert.severity.toLowerCase();
    const position = {
      left: `${200 + index * 100}px`,
      top: `${180 + index * 60}px`
    };
    
    return `
      <div class="alert-marker ${severityClass}" 
           style="left: ${position.left}; top: ${position.top};"
           title="${alert.type}: ${alert.message}"
           onclick="alert('${alert.type}\\nSeverity: ${alert.severity}\\n${alert.message}')">
        <i class="fas fa-exclamation" style="font-size: 10px;"></i>
      </div>
    `;
  }).join('');
}

function renderMaintenanceMarkers() {
  return `
    <div class="station-marker" style="left: 250px; top: 200px;" 
         title="Maintenance Required - Track Section A" 
         onclick="alert('Maintenance Required\\nTrack Section A\\nScheduled for next week')">
      <i class="fas fa-wrench" style="font-size: 12px; color: var(--color-warning);"></i>
    </div>
    <div class="station-marker" style="left: 400px; top: 250px;" 
         title="Maintenance In Progress - Signal Box B" 
         onclick="alert('Maintenance In Progress\\nSignal Box B\\nExpected completion: 2 hours')">
      <i class="fas fa-cog" style="font-size: 12px; color: var(--color-error);"></i>
    </div>
    <div class="station-marker" style="left: 550px; top: 300px;" 
         title="Maintenance Complete - Platform C" 
         onclick="alert('Maintenance Complete\\nPlatform C\\nCompleted successfully')">
      <i class="fas fa-check-circle" style="font-size: 12px; color: var(--color-success);"></i>
    </div>
  `;
}

function renderTrackLines() {
  return `
    <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
      <line x1="120" y1="170" x2="320" y2="230" stroke="var(--color-primary)" stroke-width="3"/>
      <line x1="320" y1="230" x2="520" y2="310" stroke="var(--color-primary)" stroke-width="3"/>
      <line x1="520" y1="310" x2="720" y2="390" stroke="var(--color-primary)" stroke-width="3"/>
    </svg>
  `;
}

function renderRouteLines() {
  return `
    <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
      <line x1="120" y1="170" x2="320" y2="230" stroke="var(--color-success)" stroke-width="4" stroke-dasharray="10,5"/>
      <line x1="320" y1="230" x2="520" y2="310" stroke="var(--color-warning)" stroke-width="4" stroke-dasharray="5,5"/>
      <line x1="120" y1="200" x2="520" y2="280" stroke="var(--color-info)" stroke-width="3" stroke-dasharray="15,10"/>
    </svg>
  `;
}

function toggleChat() {
  appState.isChatOpen = !appState.isChatOpen;
  
  if (appState.isChatOpen) {
    chatPanel.classList.add('open');
  } else {
    chatPanel.classList.remove('open');
  }
}

function closeChat() {
  appState.isChatOpen = false;
  chatPanel.classList.remove('open');
}

function sendChatMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  // Add user message to chat
  const userMessage = {
    id: appData.chatHistory.length + 1,
    sender: 'User',
    message: message,
    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  };
  
  appData.chatHistory.push(userMessage);
  
  // Simulate support response
  setTimeout(() => {
    const supportMessage = {
      id: appData.chatHistory.length + 1,
      sender: 'Support',
      message: 'Thank you for your message. Our team is looking into this and will respond shortly.',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    appData.chatHistory.push(supportMessage);
    renderChatHistory();
  }, 1000);

  chatInput.value = '';
  renderChatHistory();
}

function renderChatHistory() {
  const historyHtml = appData.chatHistory.map(msg => `
    <div class="chat-message ${msg.sender.toLowerCase()}">
      <div class="chat-message-content">${msg.message}</div>
      <div class="chat-message-time">${msg.timestamp}</div>
    </div>
  `).join('');

  chatHistory.innerHTML = historyHtml;
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function toggleFullscreen() {
  appState.isFullscreen = !appState.isFullscreen;
  
  if (appState.isFullscreen) {
    mainApp.classList.add('fullscreen');
    document.getElementById('fullscreenToggle').innerHTML = '<i class="fas fa-compress"></i>';
    document.getElementById('fullscreenToggle').title = 'Exit Fullscreen';
  } else {
    mainApp.classList.remove('fullscreen');
    document.getElementById('fullscreenToggle').innerHTML = '<i class="fas fa-expand"></i>';
    document.getElementById('fullscreenToggle').title = 'Fullscreen';
  }
}

function adjustZoom(delta) {
  appState.zoomLevel = Math.max(0.5, Math.min(3, appState.zoomLevel + delta));
  updateMapTransform();
}

function resetZoom() {
  appState.zoomLevel = 1;
  appState.mapPosition = { x: 0, y: 0 };
  updateMapTransform();
}

function updateMapTransform() {
  mapContent.style.transform = `translate(${appState.mapPosition.x}px, ${appState.mapPosition.y}px) scale(${appState.zoomLevel})`;
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.page) {
    navigateToPage(e.state.page);
  }
});

// Logout functionality (for demonstration)
function logout() {
  localStorage.removeItem('isLoggedIn');
  appState.isLoggedIn = false;
  showLoginPage();
}
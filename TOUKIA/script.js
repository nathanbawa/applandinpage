document.addEventListener('DOMContentLoaded', () => {

// 1. Toukia Loader
    setTimeout(() => {
        const loader = document.getElementById('toukia-loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 600);
        }
        // Show bottom sheet after load
        const sheet = document.getElementById('map-bottom-sheet');
        if (sheet) sheet.style.transform = 'translateY(0)';
    }, 2500);

    // 2. Mapbox Init
    mapboxgl.accessToken = 'pk.eyJ1IjoibmF0aGFuMTU1MDUiLCJhIjoiY21waXFkNG5uMWVwdTJzcHl5dHN1MHM0aSJ9.2hT3ZYp8BNU7-_JDbfRY4w';
    const map = new mapboxgl.Map({
        container: 'mapbox-container',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-79.3832, 43.6532],
        zoom: 12,
        interactive: false // Disabled initially to prevent accidental brushing
    });

    const btnCollapseMap = document.getElementById('btn-collapse-map');
    const appContainer = document.querySelector('.app-container');
    let isMapExpanded = false;

    // Enable map interactivity by default
    map.dragPan.enable();
    map.scrollZoom.enable();
    map.doubleClickZoom.enable();
    map.touchZoomRotate.enable();

    const expandMap = () => {
        isMapExpanded = true;
        // Scroll to top to reveal the map
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const collapseMap = () => {
        isMapExpanded = false;
        // Scroll down to show content
        window.scrollTo({ top: window.innerHeight * 0.40, behavior: 'smooth' });
    };

    const mapViewport = document.getElementById('map-viewport');
    if (mapViewport) {
        mapViewport.addEventListener('click', () => {
            if (!isMapExpanded) expandMap();
        });
    }

    // Locate Me & Blue Dot Logic
    let isFirstLocation = true;
    const btnLocateMe = document.getElementById('btn-locate-me');
    
    const requestLocation = () => {
        if (btnLocateMe) btnLocateMe.classList.add('locating');
        if ("geolocation" in navigator) {
            let lastUpdate = 0;
            navigator.geolocation.watchPosition(position => {
                const now = Date.now();
                if (now - lastUpdate < 5000) return; // Throttle to 5 seconds to reduce heaviness
                lastUpdate = now;

                if (btnLocateMe) {
                    btnLocateMe.classList.remove('locating');
                    btnLocateMe.classList.add('found');
                }
                
                const lng = position.coords.longitude;
                const lat = position.coords.latitude;
                
                if (!window.userLocationMarker) {
                    const el = document.createElement('div');
                    el.className = 'mapbox-user-marker';
                    
                    const pulseRing = document.createElement('div');
                    pulseRing.className = 'pulse-ring';
                    
                    const coreDot = document.createElement('div');
                    coreDot.className = 'core-dot';
                    
                    el.appendChild(pulseRing);
                    el.appendChild(coreDot);
                    
                    window.userLocationMarker = new mapboxgl.Marker({ element: el })
                        .setLngLat([lng, lat])
                        .addTo(map);
                } else {
                    window.userLocationMarker.setLngLat([lng, lat]);
                }
                
                if (isFirstLocation) {
                    map.flyTo({ center: [lng, lat], zoom: 14, duration: 1500 });
                    isFirstLocation = false;
                } else if (isMapExpanded) {
                    // Smoothly pan without aggressive snapping if map is expanded
                    map.easeTo({ center: [lng, lat], duration: 1000 });
                }
            }, () => {
                if (btnLocateMe) btnLocateMe.classList.remove('locating');
            }, { enableHighAccuracy: true });
        }
    };

    if (btnLocateMe) {
        btnLocateMe.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.userLocationMarker) {
                const lngLat = window.userLocationMarker.getLngLat();
                map.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 14, duration: 1500 });
            } else {
                requestLocation();
            }
        });
    }

    // Request location on launch
    requestLocation();

    // Toggles Logic
    window.subwayMarkers = [];
    const mapPills = document.querySelectorAll('.map-pill');
    mapPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.stopPropagation();
            mapPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            
            const pillText = pill.innerText.trim();
            const routeResults = document.getElementById('route-results');
            
            // Clear active routes and search UI
            if (window.activeRouteLayers) {
                window.activeRouteLayers.forEach(id => {
                    if (map.getLayer(id)) map.removeLayer(id);
                    if (map.getSource(id)) map.removeSource(id);
                });
                window.activeRouteLayers = [];
            }
            if (window.destMarker) { window.destMarker.remove(); window.destMarker = null; }
            if (window.stationMarkers) { window.stationMarkers.forEach(m => m.remove()); window.stationMarkers = []; }
            const pResults = document.getElementById('panel-results');
            if (pResults) pResults.innerHTML = '';
            const pSearchInput = document.getElementById('panel-search-input');
            if (pSearchInput) pSearchInput.value = '';
            const fSearchInput = document.getElementById('floating-search-input');
            if (fSearchInput) fSearchInput.value = '';
            
            // Clear subway markers and lines if they exist
            window.subwayMarkers.forEach(m => m.remove());
            window.subwayMarkers = [];
            if (map.getLayer('full-line-1')) { map.removeLayer('full-line-1'); map.removeSource('full-line-1'); }
            if (map.getLayer('full-line-2')) { map.removeLayer('full-line-2'); map.removeSource('full-line-2'); }
            if (map.getLayer('full-line-5')) { map.removeLayer('full-line-5'); map.removeSource('full-line-5'); }
            if (map.getLayer('full-line-6')) { map.removeLayer('full-line-6'); map.removeSource('full-line-6'); }

            if (pillText === 'Subway') {
                if (routeResults) {
                    routeResults.innerHTML = `
                        <div style="font-family: 'Inter', sans-serif;">
                            <h4 style="margin:0; font-size:16px;">Subway Map</h4>
                            <p class="sheet-title" style="font-size:18px; margin:5px 0;">All TTC Stations</p>
                            <div class="sheet-eta" style="color:#000; font-weight:600;">
                                Lines 1, 2, 5 & 6
                            </div>
                        </div>
                    `;
                }
                
                // Show subway markers on map
                if (typeof subwayStations !== 'undefined') {
                    const line1Coords = subwayStations.filter(s => s.line === 1).map(s => s.coords);
                    const line2Coords = subwayStations.filter(s => s.line === 2).map(s => s.coords);
                    const line5Coords = subwayStations.filter(s => s.line === 5).map(s => s.coords);
                    const line6Coords = subwayStations.filter(s => s.line === 6).map(s => s.coords);
                    
                    if (line1Coords.length > 0) {
                        map.addSource('full-line-1', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: line1Coords } } });
                        map.addLayer({ id: 'full-line-1', type: 'line', source: 'full-line-1', paint: { 'line-color': '#F8C300', 'line-width': 4, 'line-opacity': 0.6 }});
                    }
                    if (line2Coords.length > 0) {
                        map.addSource('full-line-2', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: line2Coords } } });
                        map.addLayer({ id: 'full-line-2', type: 'line', source: 'full-line-2', paint: { 'line-color': '#00923F', 'line-width': 4, 'line-opacity': 0.6 }});
                    }
                    if (line5Coords.length > 0) {
                        map.addSource('full-line-5', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: line5Coords } } });
                        map.addLayer({ id: 'full-line-5', type: 'line', source: 'full-line-5', paint: { 'line-color': '#F58220', 'line-width': 4, 'line-opacity': 0.6 }});
                    }
                    if (line6Coords.length > 0) {
                        map.addSource('full-line-6', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: line6Coords } } });
                        map.addLayer({ id: 'full-line-6', type: 'line', source: 'full-line-6', paint: { 'line-color': '#757575', 'line-width': 4, 'line-opacity': 0.6 }});
                    }

                    subwayStations.forEach(station => {
                        const el = document.createElement('div');
                        el.className = 'station-glow-marker';
                        if (station.line === 2) el.classList.add('line2');
                        if (station.line === 5) el.classList.add('line5');
                        if (station.line === 6) el.classList.add('line6');
                        
                        const marker = new mapboxgl.Marker({ element: el })
                            .setLngLat(station.coords)
                            .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`<strong>${station.name}</strong>`))
                            .addTo(map);
                        window.subwayMarkers.push(marker);
                    });
                }
            } else if (pill.dataset.map === 'train' && routeResults) {
                 routeResults.innerHTML = `
                    <div style="font-family: 'Inter', sans-serif;">
                        <h4 style="margin:0; font-size:16px;">GO Train</h4>
                        <p class="sheet-title" style="font-size:18px; margin:5px 0;">Union Station</p>
                        <div class="sheet-eta" style="color:#2E7D32; font-weight:600;">
                            Lakeshore East & West
                        </div>
                    </div>
                `;
            } else if (pill.dataset.map === 'rides' && routeResults) {
                 routeResults.innerHTML = `
                    <div style="font-family: 'Inter', sans-serif;">
                        <h4 style="margin:0; font-size:16px;">Ride Share</h4>
                        <p class="sheet-title" style="font-size:18px; margin:5px 0;">Uber / Lyft</p>
                        <div class="sheet-eta" style="color:#1565C0; font-weight:600;">
                            2 min away
                        </div>
                    </div>
                `;
            } else if (pill.dataset.map === 'ttc' && routeResults) {
                routeResults.innerHTML = `
                    <div style="font-family: 'Inter', sans-serif;">
                        <h4 style="margin:0; font-size:16px;">Closest TTC Stop</h4>
                        <p class="sheet-title" style="font-size:18px; margin:5px 0;">Queen St West at Bay St</p>
                        <div class="sheet-eta" style="color:var(--primary-red); font-weight:600;">
                            4 min away - Next bus: 2 min
                        </div>
                    </div>
                `;
            }
        });
    });

    // DESTINATION SEARCH LOGIC (CITYMAPPER STYLE)
    const subwayStations = [
        { name: "Vaughan Metropolitan", coords: [-79.5246, 43.7941], line: 1 },
        { name: "Highway 407", coords: [-79.5231, 43.7834], line: 1 },
        { name: "Pioneer Village", coords: [-79.5040, 43.7770], line: 1 },
        { name: "York University", coords: [-79.5040, 43.7733], line: 1 },
        { name: "Finch West", coords: [-79.4939, 43.7653], line: 1 },
        { name: "Downsview Park", coords: [-79.4795, 43.7537], line: 1 },
        { name: "Sheppard West", coords: [-79.4623, 43.7497], line: 1 },
        { name: "Wilson", coords: [-79.4510, 43.7346], line: 1 },
        { name: "Yorkdale", coords: [-79.4474, 43.7259], line: 1 },
        { name: "Lawrence West", coords: [-79.4439, 43.7145], line: 1 },
        { name: "Glencairn", coords: [-79.4407, 43.7081], line: 1 },
        { name: "Eglinton West", coords: [-79.4357, 43.6993], line: 1 },
        { name: "St Clair West", coords: [-79.4149, 43.6836], line: 1 },
        { name: "Dupont", coords: [-79.4069, 43.6749], line: 1 },
        { name: "Spadina", coords: [-79.4037, 43.6672], line: 1 },
        { name: "St George", coords: [-79.3995, 43.6681], line: 1 },
        { name: "Museum", coords: [-79.3934, 43.6672], line: 1 },
        { name: "Queen's Park", coords: [-79.3905, 43.6601], line: 1 },
        { name: "St Patrick", coords: [-79.3883, 43.6548], line: 1 },
        { name: "Osgoode", coords: [-79.3862, 43.6508], line: 1 },
        { name: "St Andrew", coords: [-79.3842, 43.6476], line: 1 },
        { name: "Union", coords: [-79.3803, 43.6456], line: 1 },
        { name: "King", coords: [-79.3779, 43.6491], line: 1 },
        { name: "Queen", coords: [-79.3792, 43.6524], line: 1 },
        { name: "Dundas", coords: [-79.3804, 43.6565], line: 1 },
        { name: "College", coords: [-79.3826, 43.6613], line: 1 },
        { name: "Wellesley", coords: [-79.3838, 43.6653], line: 1 },
        { name: "Bloor-Yonge", coords: [-79.3858, 43.6710], line: 1 },
        { name: "Rosedale", coords: [-79.3887, 43.6768], line: 1 },
        { name: "Summerhill", coords: [-79.3906, 43.6821], line: 1 },
        { name: "St Clair", coords: [-79.3926, 43.6881], line: 1 },
        { name: "Davisville", coords: [-79.3970, 43.6978], line: 1 },
        { name: "Eglinton", coords: [-79.3989, 43.7061], line: 1 },
        { name: "Lawrence", coords: [-79.4023, 43.7262], line: 1 },
        { name: "York Mills", coords: [-79.4066, 43.7441], line: 1 },
        { name: "Sheppard-Yonge", coords: [-79.4111, 43.7615], line: 1 },
        { name: "North York Centre", coords: [-79.4128, 43.7687], line: 1 },
        { name: "Finch", coords: [-79.4158, 43.7801], line: 1 },
        // Line 2
        { name: "Kipling", coords: [-79.5361, 43.6372], line: 2 },
        { name: "Islington", coords: [-79.5246, 43.6453], line: 2 },
        { name: "Royal York", coords: [-79.5113, 43.6481], line: 2 },
        { name: "Old Mill", coords: [-79.4950, 43.6498], line: 2 },
        { name: "Jane", coords: [-79.4841, 43.6498], line: 2 },
        { name: "Runnymede", coords: [-79.4759, 43.6517], line: 2 },
        { name: "High Park", coords: [-79.4665, 43.6539], line: 2 },
        { name: "Keele", coords: [-79.4597, 43.6554], line: 2 },
        { name: "Dundas West", coords: [-79.4527, 43.6565], line: 2 },
        { name: "Lansdowne", coords: [-79.4428, 43.6589], line: 2 },
        { name: "Dufferin", coords: [-79.4357, 43.6601], line: 2 },
        { name: "Ossington", coords: [-79.4260, 43.6623], line: 2 },
        { name: "Christie", coords: [-79.4184, 43.6641], line: 2 },
        { name: "Bathurst", coords: [-79.4111, 43.6658], line: 2 },
        { name: "Spadina", coords: [-79.4037, 43.6672], line: 2 },
        { name: "St George", coords: [-79.3995, 43.6681], line: 2 },
        { name: "Bay", coords: [-79.3905, 43.6701], line: 2 },
        { name: "Bloor-Yonge", coords: [-79.3858, 43.6710], line: 2 },
        { name: "Sherbourne", coords: [-79.3764, 43.6722], line: 2 },
        { name: "Castle Frank", coords: [-79.3686, 43.6738], line: 2 },
        { name: "Broadview", coords: [-79.3582, 43.6766], line: 2 },
        { name: "Chester", coords: [-79.3522, 43.6781], line: 2 },
        { name: "Pape", coords: [-79.3452, 43.6798], line: 2 },
        { name: "Donlands", coords: [-79.3377, 43.6811], line: 2 },
        { name: "Greenwood", coords: [-79.3303, 43.6826], line: 2 },
        { name: "Coxwell", coords: [-79.3232, 43.6843], line: 2 },
        { name: "Woodbine", coords: [-79.3126, 43.6865], line: 2 },
        { name: "Main Street", coords: [-79.3017, 43.6888], line: 2 },
        { name: "Victoria Park", coords: [-79.2885, 43.6948], line: 2 },
        { name: "Warden", coords: [-79.2793, 43.7112], line: 2 },
        { name: "Kennedy", coords: [-79.2638, 43.7325], line: 2 },
        // Line 5 (Eglinton Crosstown)
        { name: "Mount Dennis", coords: [-79.4880, 43.6883], line: 5 },
        { name: "Keelesdale", coords: [-79.4705, 43.6908], line: 5 },
        { name: "Caledonia", coords: [-79.4526, 43.6934], line: 5 },
        { name: "Fairbank", coords: [-79.4449, 43.6953], line: 5 },
        { name: "Oakwood", coords: [-79.4363, 43.6975], line: 5 },
        { name: "Cedarvale", coords: [-79.4357, 43.6993], line: 5 },
        { name: "Forest Hill", coords: [-79.4239, 43.7011], line: 5 },
        { name: "Chaplin", coords: [-79.4140, 43.7027], line: 5 },
        { name: "Avenue", coords: [-79.4045, 43.7042], line: 5 },
        { name: "Eglinton", coords: [-79.3989, 43.7061], line: 5 },
        { name: "Mount Pleasant", coords: [-79.3892, 43.7077], line: 5 },
        { name: "Leaside", coords: [-79.3768, 43.7099], line: 5 },
        { name: "Laird", coords: [-79.3629, 43.7126], line: 5 },
        { name: "Sunnybrook Park", coords: [-79.3496, 43.7145], line: 5 },
        { name: "Science Centre", coords: [-79.3332, 43.7196], line: 5 },
        { name: "Aga Khan Park", coords: [-79.3242, 43.7225], line: 5 },
        { name: "Wynford", coords: [-79.3175, 43.7251], line: 5 },
        { name: "Sloane", coords: [-79.3082, 43.7264], line: 5 },
        { name: "O'Connor", coords: [-79.2995, 43.7264], line: 5 },
        { name: "Pharmacy", coords: [-79.2907, 43.7265], line: 5 },
        { name: "Hakimi Lebovic", coords: [-79.2818, 43.7266], line: 5 },
        { name: "Golden Mile", coords: [-79.2741, 43.7266], line: 5 },
        { name: "Birchmount", coords: [-79.2662, 43.7266], line: 5 },
        { name: "Ionview", coords: [-79.2562, 43.7270], line: 5 },
        { name: "Kennedy", coords: [-79.2638, 43.7325], line: 5 },
        // Line 6 (Finch West LRT)
        { name: "Humber College", coords: [-79.6046, 43.7289], line: 6 },
        { name: "Westmore", coords: [-79.5981, 43.7310], line: 6 },
        { name: "Martin Grove", coords: [-79.5916, 43.7332], line: 6 },
        { name: "Albion", coords: [-79.5851, 43.7353], line: 6 },
        { name: "Stevenson", coords: [-79.5785, 43.7375], line: 6 },
        { name: "Mount Olive", coords: [-79.5720, 43.7396], line: 6 },
        { name: "Rowentree", coords: [-79.5655, 43.7417], line: 6 },
        { name: "Pearldale", coords: [-79.5590, 43.7439], line: 6 },
        { name: "Duncanwoods", coords: [-79.5525, 43.7460], line: 6 },
        { name: "Milvan Rumike", coords: [-79.5460, 43.7482], line: 6 },
        { name: "Emery", coords: [-79.5395, 43.7503], line: 6 },
        { name: "Signet Arrow", coords: [-79.5330, 43.7525], line: 6 },
        { name: "Norfinch Oakdale", coords: [-79.5264, 43.7546], line: 6 },
        { name: "Jane and Finch", coords: [-79.5199, 43.7567], line: 6 },
        { name: "Driftwood", coords: [-79.5134, 43.7589], line: 6 },
        { name: "Tobermory", coords: [-79.5069, 43.7610], line: 6 },
        { name: "Sentinel", coords: [-79.5004, 43.7632], line: 6 },
        { name: "Finch West", coords: [-79.4939, 43.7653], line: 6 }
    ];

    const getDistance = (c1, c2) => {
        const R = 6371e3;
        const p1 = c1[1] * Math.PI/180, p2 = c2[1] * Math.PI/180;
        const dp = (c2[1]-c1[1]) * Math.PI/180;
        const dl = (c2[0]-c1[0]) * Math.PI/180;
        const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const findClosestStation = (coords) => {
        let min = Infinity;
        let closest = null;
        let idx = -1;
        subwayStations.forEach((s, i) => {
            const d = getDistance(coords, s.coords);
            if (d < min) { min = d; closest = s; idx = i; }
        });
        return { station: closest, idx: idx, distance: min };
    };

    const getWalkingRoute = async (c1, c2) => {
        // Return a straight, crow-flies line geometry instead of a zigzagging street route
        const dist = getDistance(c1, c2);
        const duration = dist / 1.4; // rough walking speed in seconds
        return {
            geometry: { type: 'LineString', coordinates: [c1, c2] },
            duration: duration
        };
    };

    
    // SEARCH PANEL AND AUTOCOMPLETE LOGIC (Tasks 3 & 4)
    const floatingSearchInput = document.getElementById('floating-search-input');
    const searchPanel = document.getElementById('floating-search-panel');
    const panelSearchInput = document.getElementById('panel-search-input');
    const closePanelBtn = document.getElementById('close-search-panel');
    const panelResults = document.getElementById('panel-results');

    if (floatingSearchInput) {
        floatingSearchInput.addEventListener('click', () => {
            if (searchPanel) searchPanel.classList.add('open');
            if (panelSearchInput) panelSearchInput.focus();
            if (!isMapExpanded) expandMap();
        });
    }

    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', () => {
            if (searchPanel) searchPanel.classList.remove('open');
        });
    }

    if (panelSearchInput) {
        let debounceTimer;
        
        // Allow user to press Enter to select the top suggestion
        panelSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const firstItem = panelResults.querySelector('.suggestion-item');
                if (firstItem) firstItem.click();
            }
        });
        
        panelSearchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            if (query.length < 3) {
                if (panelResults) panelResults.innerHTML = '';
                return;
            }
            
            debounceTimer = setTimeout(async () => {
                try {
                    let proximityParam = '';
                    if (window.userLocationMarker) {
                        const lngLat = window.userLocationMarker.getLngLat();
                        proximityParam = `&proximity=${lngLat.lng},${lngLat.lat}`;
                    } else {
                        // Default to downtown Toronto if no location available
                        proximityParam = `&proximity=-79.3832,43.6532`;
                    }
                    
                    // Restrict searches exactly to the Greater Toronto Area to prevent fake global results
                    const bboxParam = '&bbox=-79.6393,43.5810,-79.1152,43.8554';
                    
                    // Remove restrictive types parameter to act like Google Maps and find local stores
                    const typesParam = '';
                    
                    // Fuzzy match handles typos natively (unon station -> Union Station)
                    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&fuzzyMatch=true&limit=6${bboxParam}${proximityParam}${typesParam}`;
                    
                    const res = await fetch(endpoint);
                    const data = await res.json();
                    if (panelResults) {
                        panelResults.innerHTML = '';
                        if (data.features) {
                            data.features.forEach(feature => {
                                const div = document.createElement('div');
                                div.className = 'suggestion-item';
                                
                                // Category Icon mapping
                                const getCategoryIcon = (f) => {
                                    const cat = (f.properties.category || '').toLowerCase();
                                    const type = f.place_type && f.place_type[0] ? f.place_type[0].toLowerCase() : '';
                                    if (cat.includes('coffee') || cat.includes('cafe')) return '<i class="fa-solid fa-mug-hot" style="color:#795548;"></i>';
                                    if (cat.includes('restaurant') || cat.includes('food')) return '<i class="fa-solid fa-utensils" style="color:#FF5722;"></i>';
                                    if (cat.includes('burger') || cat.includes('fast food')) return '<i class="fa-solid fa-burger" style="color:#FFC107;"></i>';
                                    if (cat.includes('school') || cat.includes('university') || cat.includes('college')) return '<i class="fa-solid fa-graduation-cap" style="color:#2196F3;"></i>';
                                    if (cat.includes('station') || cat.includes('transit') || cat.includes('subway') || (f.text && f.text.toLowerCase().includes('station'))) return '<i class="fa-solid fa-train-subway" style="color:#E91E63;"></i>';
                                    if (cat.includes('mall') || cat.includes('shopping') || cat.includes('store')) return '<i class="fa-solid fa-bag-shopping" style="color:#9C27B0;"></i>';
                                    if (cat.includes('park') || cat.includes('outdoors')) return '<i class="fa-solid fa-tree" style="color:#4CAF50;"></i>';
                                    if (cat.includes('hospital') || cat.includes('medical')) return '<i class="fa-solid fa-hospital" style="color:#F44336;"></i>';
                                    if (type === 'address') return '<i class="fa-solid fa-house" style="color:#607D8B;"></i>';
                                    if (type === 'neighborhood' || type === 'locality') return '<i class="fa-solid fa-map-location-dot" style="color:#3F51B5;"></i>';
                                    return '<i class="fa-solid fa-location-dot" style="color:#9E9E9E;"></i>';
                                };
                                
                                const getCategoryName = (f) => {
                                    if (f.properties.category) return f.properties.category.split(',')[0].trim().replace(/\b\w/g, l => l.toUpperCase());
                                    if (f.place_type && f.place_type.length > 0) return f.place_type[0].replace(/\b\w/g, l => l.toUpperCase());
                                    return '';
                                };
                                
                                const iconHtml = getCategoryIcon(feature);
                                const categoryName = getCategoryName(feature);
                                const addressStr = feature.place_name.replace(feature.text+', ', '').replace(', Canada', '');
                                
                                div.innerHTML = `
                                    <div class="suggestion-icon" style="background:#fff; box-shadow:0 2px 6px rgba(0,0,0,0.06); font-size:16px;">${iconHtml}</div>
                                    <div class="suggestion-text" style="flex:1;">
                                        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                            <strong style="font-size:15px; color:#111;">${feature.text}</strong>
                                            ${categoryName ? `<span style="font-size: 10px; font-weight:600; background: #f0f0f0; padding: 3px 8px; border-radius: 12px; color: #666; margin-left: 8px; white-space:nowrap;">${categoryName}</span>` : ''}
                                        </div>
                                        <span style="font-size:13px; color:#777; display:block; margin-top:2px;">${addressStr}</span>
                                    </div>
                                `;
                                div.addEventListener('click', () => {
                                    if (floatingSearchInput) floatingSearchInput.value = feature.text;
                                    panelSearchInput.value = feature.text;
                                    runRouting(feature);
                                });
                                panelResults.appendChild(div);
                            });
                        }
                    }
                } catch (e) {
                    console.error("Geocoding error", e);
                }
            }, 400); // Increased debounce to 400ms to reduce API spam and UI lag
        });
    }

    const runRouting = async (destFeature) => {
        try {
            const destLng = destFeature.center[0];
            const destLat = destFeature.center[1];
            const destName = destFeature.text;
            const destCoords = [destLng, destLat];
            
            let originCoords = [-79.5040, 43.7733];
            if (window.userLocationMarker) {
                originCoords = [window.userLocationMarker.getLngLat().lng, window.userLocationMarker.getLngLat().lat];
            }

            const closestToOrigin = findClosestStation(originCoords);
            const closestToDest = findClosestStation(destCoords);
            
            const walk1 = await getWalkingRoute(originCoords, closestToOrigin.station.coords);
            const walk2 = await getWalkingRoute(closestToDest.station.coords, destCoords);
            
            if (!walk1 || !walk2) return;
            
            if (!isMapExpanded) expandMap();

            // Clear old routing layers
            if (!window.activeRouteLayers) window.activeRouteLayers = [];
            window.activeRouteLayers.forEach(id => {
                if (map.getLayer(id)) map.removeLayer(id);
                if (map.getSource(id)) map.removeSource(id);
            });
            window.activeRouteLayers = [];

            // Build itinerary
            let itinerary = [];
            if (closestToOrigin.station.line === closestToDest.station.line) {
                itinerary = [{ line: closestToOrigin.station.line, start: closestToOrigin.station, end: closestToDest.station }];
            } else {
                const l1 = closestToOrigin.station.line;
                const l2 = closestToDest.station.line;
                const pair = `${l1}-${l2}`;
                
                let transferStationName = '';
                if (pair === '1-2' || pair === '2-1') {
                    // Pick closest transfer: St George or Bloor-Yonge
                    const line1Stations = subwayStations.filter(s => s.line === 1);
                    const line2Stations = subwayStations.filter(s => s.line === 2);
                    
                    const originIsL1 = l1 === 1;
                    const oIdx1 = line1Stations.findIndex(s => s.name === (originIsL1 ? closestToOrigin.station.name : closestToDest.station.name));
                    const dIdx2 = line2Stations.findIndex(s => s.name === (!originIsL1 ? closestToOrigin.station.name : closestToDest.station.name));
                    
                    const stG1 = line1Stations.findIndex(s => s.name === 'St George');
                    const stG2 = line2Stations.findIndex(s => s.name === 'St George');
                    
                    const by1 = line1Stations.findIndex(s => s.name === 'Bloor-Yonge');
                    const by2 = line2Stations.findIndex(s => s.name === 'Bloor-Yonge');
                    
                    const stGStops = Math.abs(oIdx1 - stG1) + Math.abs(dIdx2 - stG2);
                    const byStops = Math.abs(oIdx1 - by1) + Math.abs(dIdx2 - by2);
                    
                    transferStationName = stGStops <= byStops ? 'St George' : 'Bloor-Yonge';
                }
                else if (pair === '1-5' || pair === '5-1') transferStationName = 'Eglinton';
                else if (pair === '1-6' || pair === '6-1') transferStationName = 'Finch West';
                else if (pair === '2-5' || pair === '5-2') transferStationName = 'Kennedy';
                
                if (transferStationName) {
                    const ts1 = subwayStations.find(s => s.name === transferStationName && s.line === l1);
                    const ts2 = subwayStations.find(s => s.name === transferStationName && s.line === l2);
                    if (ts1 && ts2) {
                        itinerary = [
                            { line: l1, start: closestToOrigin.station, end: ts1 },
                            { line: l2, start: ts2, end: closestToDest.station }
                        ];
                    }
                }
                
                // Fallback for complex routes (e.g., 6 to 2)
                if (itinerary.length === 0) {
                    if (l1 === 6 && l2 === 2) {
                        itinerary = [
                            { line: 6, start: closestToOrigin.station, end: subwayStations.find(s=>s.name==='Finch West' && s.line===6) },
                            { line: 1, start: subwayStations.find(s=>s.name==='Finch West' && s.line===1), end: subwayStations.find(s=>s.name==='St George' && s.line===1) },
                            { line: 2, start: subwayStations.find(s=>s.name==='St George' && s.line===2), end: closestToDest.station }
                        ];
                    } else if (l1 === 2 && l2 === 6) {
                        itinerary = [
                            { line: 2, start: closestToOrigin.station, end: subwayStations.find(s=>s.name==='St George' && s.line===2) },
                            { line: 1, start: subwayStations.find(s=>s.name==='St George' && s.line===1), end: subwayStations.find(s=>s.name==='Finch West' && s.line===1) },
                            { line: 6, start: subwayStations.find(s=>s.name==='Finch West' && s.line===6), end: closestToDest.station }
                        ];
                    } else {
                        // Absolute fallback
                        itinerary = [{ line: closestToOrigin.station.line, start: closestToOrigin.station, end: closestToDest.station }];
                    }
                }
            }

            // Clear all other markers and subway lines when a route is searched
            window.subwayMarkers.forEach(m => m.remove());
            window.subwayMarkers = [];
            if (map.getLayer('full-line-1')) { map.removeLayer('full-line-1'); map.removeSource('full-line-1'); }
            if (map.getLayer('full-line-2')) { map.removeLayer('full-line-2'); map.removeSource('full-line-2'); }
            if (map.getLayer('full-line-5')) { map.removeLayer('full-line-5'); map.removeSource('full-line-5'); }
            if (map.getLayer('full-line-6')) { map.removeLayer('full-line-6'); map.removeSource('full-line-6'); }

            document.querySelectorAll('.map-pill').forEach(p => p.classList.remove('active'));

            // Walk 1 (Black dotted)
            map.addSource('route-walk-1', { type: 'geojson', data: { type: 'Feature', geometry: walk1.geometry } });
            map.addLayer({ id: 'route-walk-1', type: 'line', source: 'route-walk-1', paint: { 'line-color': '#000000', 'line-width': 4, 'line-dasharray': [2, 2] }});
            window.activeRouteLayers.push('route-walk-1');
            
            const lineColors = { 1: '#F8C300', 2: '#00923F', 5: '#F58220', 6: '#757575' };
            let totalStops = 0;
            let subwayHTML = '';
            
            itinerary.forEach((leg, idx) => {
                const lineStations = subwayStations.filter(s => s.line === leg.line);
                const sIdx = lineStations.findIndex(s => s.name === leg.start.name);
                const eIdx = lineStations.findIndex(s => s.name === leg.end.name);
                const realStartIdx = Math.min(sIdx, eIdx);
                const realEndIdx = Math.max(sIdx, eIdx);
                const subwayCoords = lineStations.slice(realStartIdx, realEndIdx + 1).map(s => s.coords);
                
                const stops = Math.abs(sIdx - eIdx);
                totalStops += stops;
                
                const layerId = 'route-subway-' + idx;
                map.addSource(layerId, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: subwayCoords } } });
                map.addLayer({ id: layerId, type: 'line', source: layerId, paint: { 'line-color': lineColors[leg.line] || '#F8C300', 'line-width': 6 }});
                window.activeRouteLayers.push(layerId);
                
                subwayHTML += `
                    <div style="display: flex; align-items: flex-start; gap: 16px; position:relative; z-index:1;">
                        <div style="background:white; padding:4px; border-radius:50%;"><i class="fa-solid fa-train-subway" style="color:${lineColors[leg.line]}; font-size:16px;"></i></div>
                        <div>
                            <strong style="display:block; font-size:15px;">Line ${leg.line} Subway</strong>
                            <div style="color:#666; font-size:13px; margin-top:2px;">${stops} stops • Exit at ${leg.end.name}</div>
                        </div>
                    </div>
                `;
            });
            
            // Walk 2 (Black dotted)
            map.addSource('route-walk-2', { type: 'geojson', data: { type: 'Feature', geometry: walk2.geometry } });
            map.addLayer({ id: 'route-walk-2', type: 'line', source: 'route-walk-2', paint: { 'line-color': '#000000', 'line-width': 4, 'line-dasharray': [2, 2] }});
            window.activeRouteLayers.push('route-walk-2');
            
            // Markers
            if (window.destMarker) window.destMarker.remove();
            window.destMarker = new mapboxgl.Marker({ color: '#E53935' }).setLngLat(destCoords).addTo(map);

            if (window.stationMarkers) window.stationMarkers.forEach(m => m.remove());
            window.stationMarkers = [];
            
            const stationsToMark = [closestToOrigin.station, ...itinerary.map(leg => leg.end)];
            stationsToMark.forEach(st => {
                const el = document.createElement('div');
                el.innerHTML = `<div style="background:white; padding:4px 8px; border-radius:8px; border:2px solid ${lineColors[st.line]}; font-size:12px; font-weight:700; font-family:Inter; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.15);">${st.name}</div>`;
                const m = new mapboxgl.Marker({ element: el, anchor: 'bottom', offset: [0, -10] }).setLngLat(st.coords).addTo(map);
                window.stationMarkers.push(m);
            });

            // Add walking ETAs
            const addEtaMarker = (coords, mins) => {
                const el = document.createElement('div');
                el.innerHTML = `<div style="background:#111; color:white; padding:3px 6px; border-radius:6px; font-size:10px; font-weight:600; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${mins} min</div>`;
                const m = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map);
                window.stationMarkers.push(m);
            };
            addEtaMarker(walk1.geometry.coordinates[Math.floor(walk1.geometry.coordinates.length/2)], Math.max(1, Math.round(walk1.duration/60)));
            addEtaMarker(walk2.geometry.coordinates[Math.floor(walk2.geometry.coordinates.length/2)], Math.max(1, Math.round(walk2.duration/60)));

            const bounds = new mapboxgl.LngLatBounds(originCoords, originCoords);
            bounds.extend(destCoords);
            map.fitBounds(bounds, { padding: 50, duration: 1500 });
            
            const totalMins = Math.round((walk1.duration + walk2.duration)/60) + totalStops * 2;
            
            if (panelResults) {
                panelResults.innerHTML = `
                    <div style="font-family: 'Inter', sans-serif; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-top: 10px; border: 1px solid #eee;">
                        <div style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #111;">Estimated Time: ${totalMins} min</div>
                        
                        <div style="display: flex; flex-direction: column; gap: 20px; position: relative;">
                            <!-- Connecting line -->
                            <div style="position:absolute; left:11px; top:12px; bottom:12px; width:2px; background:#f0f0f0; z-index:0;"></div>
                            
                            <div style="display: flex; align-items: flex-start; gap: 16px; position:relative; z-index:1;">
                                <div style="background:white; padding:4px; border-radius:50%;"><i class="fa-solid fa-person-walking" style="color:#333; font-size:16px;"></i></div>
                                <div>
                                    <strong style="display:block; font-size:15px;">Walk ${Math.max(1, Math.round(walk1.duration/60))} min</strong>
                                    <div style="color:#666; font-size:13px; margin-top:2px;">To ${closestToOrigin.station.name} Station</div>
                                </div>
                            </div>
                            
                            ${subwayHTML}
                            
                            <div style="display: flex; align-items: flex-start; gap: 16px; position:relative; z-index:1;">
                                <div style="background:white; padding:4px; border-radius:50%;"><i class="fa-solid fa-person-walking" style="color:#333; font-size:16px;"></i></div>
                                <div>
                                    <strong style="display:block; font-size:15px;">Walk ${Math.max(1, Math.round(walk2.duration/60))} min</strong>
                                    <div style="color:#666; font-size:13px; margin-top:2px;">To ${destName.split(',')[0]}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch(e) {
            console.error("Routing error:", e);
        }
    };
    
    // AI Chatbot Logic
    const chatContainer = document.querySelector('.chat-container');
    const chatInput = document.querySelector('.chat-input-wrapper input');
    const chatBtn = document.querySelector('.chat-send-btn');
    const chatPrompts = document.querySelectorAll('.chat-prompts button');
    
    const insertMessage = (text, isSent = false) => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${isSent ? 'sent' : 'received'}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'chat-avatar';
        avatar.innerHTML = isSent ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `<p>${text}</p>`;
        
        bubble.appendChild(avatar);
        bubble.appendChild(messageDiv);
        
        const prompts = document.querySelector('.chat-prompts');
        if (prompts) {
            chatContainer.insertBefore(bubble, prompts);
        } else {
            const inputWrapper = document.querySelector('.chat-input-wrapper');
            chatContainer.insertBefore(bubble, inputWrapper);
        }
        return bubble;
    };

    const showTyping = () => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble received typing-bubble`;
        
        const avatar = document.createElement('div');
        avatar.className = 'chat-avatar';
        avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        
        bubble.appendChild(avatar);
        bubble.appendChild(messageDiv);
        
        const prompts = document.querySelector('.chat-prompts');
        if (prompts) {
            chatContainer.insertBefore(bubble, prompts);
        } else {
            const inputWrapper = document.querySelector('.chat-input-wrapper');
            chatContainer.insertBefore(bubble, inputWrapper);
        }
        return bubble;
    };

    const getAIResponse = (val) => {
        val = val.toLowerCase();
        if (val.includes("route") || val.includes("fastest")) return "The fastest route to <strong>Union Station</strong> is <strong>Line 1</strong> southbound.<br><br>⏱️ Estimated travel time: <strong style='color:var(--primary-red);'>18 min</strong>.";
        if (val.includes("delay") || val.includes("service")) return "<div style='background:#FFEBEE; color:#C62828; padding:8px 12px; border-radius:8px; border-left:4px solid #C62828; font-weight:600; margin-bottom:8px;'><i class='fa-solid fa-triangle-exclamation'></i> Service Delay</div>There is currently a delay on <strong>Line 2</strong> near Broadview.";
        if (val.includes("eglinton") || val.includes("away")) return "📍 You're <strong style='color:var(--primary-red);'>4 minutes</strong> away from Eglinton Station.";
        if (val.includes("groceries")) return "<strong>No Frills</strong> is highly recommended for cheap groceries! 🛒<br><br>It's only a 10 min bus ride away.";
        if (val.includes("bank")) return "🏦 <strong>RBC</strong> and <strong>TD</strong> both have great student accounts with <strong>no monthly fees</strong> for international students.";
        if (val.includes("scam")) return "⚠️ <strong style='color:#C62828;'>Always view a rental in person before sending money.</strong><br><br>If they ask for e-transfer before a lease is signed, it's a scam.";
        if (val.includes("jacket")) return "🧥 <strong>Uniqlo</strong> has great seamless down parkas under $150 that are perfect for Toronto winters!";
        return "I can help you navigate Toronto, find housing, or answer student life questions! 🍁";
    };

    const handleChatMessage = (val) => {
        if (!val) return;
        insertMessage(val, true);
        if (chatInput) chatInput.value = '';
        
        // Hide prompts once interaction starts
        const prompts = document.querySelector('.chat-prompts');
        if (prompts) prompts.style.display = 'none';

        const typingBubble = showTyping();

        setTimeout(() => {
            typingBubble.remove();
            insertMessage(getAIResponse(val));
        }, 1500);
    };

    if (chatBtn && chatInput) {
        chatBtn.addEventListener('click', () => handleChatMessage(chatInput.value.trim()));
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChatMessage(chatInput.value.trim());
        });
    }

    if (chatPrompts) {
        chatPrompts.forEach(btn => {
            btn.addEventListener('click', () => handleChatMessage(btn.innerText));
        });
    }


    // Modal & Cards Logic
    const modalOverlay = document.getElementById('service-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const modalContent = document.getElementById('modal-content');

    const serviceData = {
        '1. SIM Card': [
            { title: 'Fido', desc: 'Student plans available.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.fido.ca/account-login', color: '#ffb300', bg: 'url(../images/logos/logo_0.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #FFC107, #FF8F00)' },
            { title: 'Chatr Mobile', desc: 'Starting at $25/mo.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.chatrwireless.com/my-account/login', color: '#c2185b', bg: 'url(../images/logos/logo_1.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #E91E63, #880E4F)' },
            { title: 'Public Mobile', desc: 'Prepaid 5G plans.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://selfserve.publicmobile.ca', color: '#00838f', bg: 'url(../images/logos/logo_2.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #00BCD4, #006064)' }
        ],
        '2. Bank Account': [
            { title: 'RBC Royal Bank', desc: 'Advantage Banking for students.', customLogo: '<div class="dotted-logo"><div class="dot yellow"></div><div class="dot blue"></div><div class="dot blue"></div><div class="dot blue"></div></div>', link: 'https://secure.royalbank.com', color: '#0051A5', bg: 'url(../images/logobank.svg) 5% 2% / 240% auto no-repeat, linear-gradient(135deg, #0051A5, #003673)' },
            { title: 'TD Canada Trust', desc: 'TD Student Chequing Account.', customLogo: '<div class="dotted-logo"><div class="dot green"></div><div class="dot green"></div><div class="dot transparent"></div><div class="dot green"></div></div>', link: 'https://easyweb.td.com', color: '#008A00', bg: 'url(../images/logobank.svg) 95% 2% / 240% auto no-repeat, linear-gradient(135deg, #008A00, #005C00)' },
            { title: 'CIBC', desc: 'Smart Account for Students.', customLogo: '<div class="dotted-logo"><div class="dot red"></div><div class="dot red"></div><div class="dot yellow"></div><div class="dot red"></div></div>', link: 'https://www.cibconline.cibc.com', color: '#C41F3E', bg: 'url(../images/logobank.svg) 5% 50% / 240% auto no-repeat, linear-gradient(135deg, #C41F3E, #90001D)' },
            { title: 'BMO', desc: 'BMO Plus Plan for Students.', customLogo: '<div class="dotted-logo"><div class="dot blue"></div><div class="dot red"></div><div class="dot red"></div><div class="dot blue"></div></div>', link: 'https://www1.bmo.com', color: '#0079C1', bg: 'url(../images/logobank.svg) 95% 50% / 240% auto no-repeat, linear-gradient(135deg, #0079C1, #004D7D)' },
            { title: 'Scotiabank', desc: 'Scotiabank Student Banking.', customLogo: '<div class="dotted-logo"><div class="dot red" style="border-radius:2px;"></div><div class="dot red"></div><div class="dot red"></div><div class="dot red" style="border-radius:2px;"></div></div>', link: 'https://www.scotiaonline.scotiabank.com', color: '#ED0006', bg: 'url(../images/logobank.svg) 50% 98% / 240% auto no-repeat, linear-gradient(135deg, #ED0006, #B00004)' }
        ],
        '3. Find Housing': [
            { title: 'Kijiji', desc: 'Local classifieds for apartments.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.kijiji.ca/consumer/login', color: '#512da8', bg: 'url(../images/logos/logo_3.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #673AB7, #311B92)' },
            { title: 'Facebook', desc: 'Find student sublets.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.facebook.com/login', color: '#1976d2', bg: 'url(../images/logos/logo_4.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #2196F3, #0D47A1)' }
        ],
        '4. Move Around': [
            { title: 'Passport Parking', desc: 'Pay for parking.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://park.passportparking.com', color: '#00695c', bg: 'url(../images/logos/logo_5.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #009688, #004D40)' },
            { title: 'TTC Presto', desc: 'Toronto Transit passes.', icon: 'fa-bus', link: 'https://www.prestocard.ca', color: '#d32f2f', bg: 'linear-gradient(135deg, #F44336, #b71c1c)' }
        ],
        '5. Home Services': [
            { title: 'TaskRabbit', desc: 'Hire help for furniture.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.taskrabbit.com/login', color: '#ff8f00', bg: 'url(../images/logos/logo_6.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #FFB300, #FF6F00)' },
            { title: 'IKEA Canada', desc: 'Affordable furniture.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.ikea.com/ca/en/profile/login/', color: '#0277bd', bg: 'url(../images/logos/logo_7.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #03A9F4, #01579B)' },
            { title: 'Rogers', desc: 'Student wifi deals.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.rogers.com/account-login', color: '#c62828', bg: 'url(../images/logos/logo_8.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #E53935, #b71c1c)' }
        ],
        '6. Groceries': [
            { title: 'No Frills', desc: 'PC Optimum login.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://accounts.pcid.ca/login', color: '#fbc02d', bg: 'url(../images/logos/logo_9.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #FFEB3B, #F57F17)' },
            { title: 'Walmart Canada', desc: 'Affordable essentials.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.walmart.ca/account/login', color: '#1565c0', bg: 'url(../images/logos/logo_10.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #1976D2, #0D47A1)' },
            { title: 'Loblaws', desc: 'PC Express pickup.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.loblaws.ca/account/login', color: '#43a047', bg: 'url(../images/logos/logo_11.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #4CAF50, #1B5E20)' }
        ],
        '7. Winter Survival': [
            { title: 'Canada Goose', desc: 'Premium jackets.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.canadagoose.com/ca/en/login', color: '#111', bg: 'url(../images/logos/logo_12.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #424242, #000000)' },
            { title: 'UNIQLO Canada', desc: 'Heattech thermal layers.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.uniqlo.com/ca/en/login', color: '#d32f2f', bg: 'url(../images/logos/logo_13.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #F44336, #b71c1c)' },
            { title: 'Mark\'s', desc: 'Winter boots.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.marks.com/en/ca/account/login.html', color: '#00695c', bg: 'url(../images/logos/logo_14.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #009688, #004D40)' }
        ],
        '8. Discounts': [
            { title: 'SPC Card', desc: 'Student Price Card.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.spccard.ca/login', color: '#000', bg: 'url(../images/logos/logo_15.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #424242, #000000)' },
            { title: 'UNiDAYS', desc: 'Free online discounts.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.myunidays.com/CA/en-CA/account/log-in', color: '#c2185b', bg: 'url(../images/logos/logo_16.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #E91E63, #880E4F)' },
            { title: 'Ontario Trillium', desc: 'Ontario Trillium Benefit.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://profile.signin.ontario.ca', color: '#388e3c', bg: 'url(../images/logos/logo_27.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #4CAF50, #1B5E20)' }
        ],
        '9. Healthcare': [
            { title: 'Shoppers Drug Mart', desc: 'Pharmacy.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.shoppersdrugmart.ca/en/account/login', color: '#c2185b', bg: 'url(../images/logos/logo_17.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #E91E63, #880E4F)' },
            { title: 'Maple', desc: 'Virtual healthcare.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://my.getmaple.ca/users/sign_in', color: '#1565c0', bg: 'url(../images/logos/logo_18.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #1976D2, #0D47A1)' },
            { title: 'Telus Health', desc: 'Babylon clinic access.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://login.babylon.com', color: '#00695c', bg: 'url(../images/logos/logo_19.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #009688, #004D40)' },
            { title: 'PharmaClik', desc: 'PharmaChoice prescriptions.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.pharmachoice.com/en/login', color: '#fbc02d', bg: 'url(../images/logos/logo_21.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #FFEB3B, #F57F17)' }
        ],
        '10. Meetups': [
            { title: 'Desire2Learn', desc: 'D2L Brightspace LMS.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://desire2learn.com', color: '#283593', bg: 'url(../images/logos/logo_22.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #3F51B5, #1A237E)' },
            { title: 'LinkedIn', desc: 'Find network.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.linkedin.com/login', color: '#1565c0', bg: 'url(../images/logos/logo_23.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #1976D2, #0D47A1)' }
        ],
        '11. Documents': [
            { title: 'Ontario.ca', desc: 'ServiceOntario Login.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://profile.signin.ontario.ca', color: '#111', bg: 'url(../images/logos/logo_20.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #424242, #000000)' },
            { title: 'OSAP', desc: 'Ontario Student Assistance.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.ontario.ca/page/ontario-student-assistance-program', color: '#0277bd', bg: 'url(../images/logos/logo_24.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #03A9F4, #01579B)' },
            { title: 'IRCC Portal', desc: 'Study Permit.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://portal-portail.apps.cic.gc.ca/signin?lang=en', color: '#c62828', bg: 'url(../images/logos/logo_25.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #E53935, #b71c1c)' },
            { title: 'SIN Number', desc: 'Renew adult passport.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/renew-adult-passport.html', color: '#00695c', bg: 'url(../images/logos/logo_26.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #009688, #004D40)' }
        ],
        '12. Jobs & Gigs': [
            { title: 'Indeed Canada', desc: 'Job search portal.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://secure.indeed.com/auth', color: '#1565c0', bg: 'url(../images/logos/logo_28.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #1976D2, #0D47A1)' },
            { title: 'Uber Eats', desc: 'Flexible delivery gigs.', customLogo: '<div class="dotted-logo" style="display:none;"></div>', link: 'https://auth.uber.com/v2/', color: '#2e7d32', bg: 'url(../images/logos/logo_29.svg) center 20% / 150% auto no-repeat, linear-gradient(135deg, #4CAF50, #1B5E20)' }
        ],

        '13. Barbershop': [
            { title: 'Glassbox Barbershop', desc: '$5 off with SPC card.', icon: 'fa-scissors', link: 'https://www.glassboxbarbershop.com', color: '#111', bg: 'linear-gradient(135deg, #424242, #000000)' },
            { title: 'Miami Fades', desc: '10% off with SPC card.', icon: 'fa-scissors', link: 'https://www.miamifades.ca', color: '#c2185b', bg: 'linear-gradient(135deg, #E91E63, #880E4F)' },
            { title: 'Fade Room', desc: 'Student special rate weekdays.', icon: 'fa-scissors', link: 'https://www.faderoom.ca', color: '#1565c0', bg: 'linear-gradient(135deg, #1976D2, #0D47A1)' }
        ],
        '14. Moving': [
            { title: 'El Cheapo Movers', desc: 'Student discount available.', icon: 'fa-box', link: 'https://elcheapo.ca', color: '#fbc02d', bg: 'linear-gradient(135deg, #FFEB3B, #F57F17)' },
            { title: 'Reasonable Movers', desc: 'From $49/hr, student discounts.', icon: 'fa-truck', link: 'https://reasonablemovers.ca/cheap-movers-toronto', color: '#00695c', bg: 'linear-gradient(135deg, #009688, #004D40)' },
            { title: 'One Day Movers', desc: 'Competitively priced.', icon: 'fa-truck-fast', link: 'https://onedaymovers.com/student-movers-toronto', color: '#c62828', bg: 'linear-gradient(135deg, #E53935, #b71c1c)' }
        ],
        '15. Handyman': [
            { title: 'TaskRabbit Toronto', desc: 'Taskers start at $45/hr.', icon: 'fa-hammer', link: 'https://www.taskrabbit.ca/locations/toronto/general-handyman', color: '#ff8f00', bg: 'linear-gradient(135deg, #FFB300, #FF6F00)' },
            { title: 'Kijiji Services', desc: 'Post a handyman ad.', icon: 'fa-wrench', link: 'https://www.kijiji.ca/b-skilled-trades-trades-people/toronto-gta/c649l1700272', color: '#512da8', bg: 'linear-gradient(135deg, #673AB7, #311B92)' },
            { title: 'Facebook Marketplace', desc: 'Search independent trades.', icon: 'fa-facebook', link: 'https://www.facebook.com/marketplace/toronto/', color: '#1976d2', bg: 'linear-gradient(135deg, #2196F3, #0D47A1)' }
        ],
        '16. Home Cleaning': [
            { title: 'Toronto Student Cleaning', desc: 'Subscription flat-rate.', icon: 'fa-broom', link: 'https://www.torontostudentcleaning.ca', color: '#0277bd', bg: 'linear-gradient(135deg, #03A9F4, #01579B)' },
            { title: '$20 Clean Toronto', desc: '$20/hr budget cleaning.', icon: 'fa-soap', link: 'https://20dollarclean.ca', color: '#2e7d32', bg: 'linear-gradient(135deg, #4CAF50, #1B5E20)' },
            { title: 'Groupon Cleaning', desc: 'Up to 50-70% off deals.', icon: 'fa-tag', link: 'https://www.groupon.com/local/toronto/house-cleaning', color: '#388e3c', bg: 'linear-gradient(135deg, #4CAF50, #1B5E20)' },
            { title: 'Hellamaid', desc: 'Reliable recurring service.', icon: 'fa-sparkles', link: 'https://hellamaid.ca', color: '#c2185b', bg: 'linear-gradient(135deg, #E91E63, #880E4F)' }
        ]
    };

    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach(item => {
        item.addEventListener('click', () => {
            const serviceName = item.querySelector('span').innerText.trim();
            const data = serviceData[serviceName];
            
            modalTitle.innerText = serviceName.substring(serviceName.indexOf('.') + 1).trim();
            modalSubtitle.innerText = `Top options for ${modalTitle.innerText}`;
            
            if (data) {
                let htmlStr = '<div class="banking-slider">';
                data.forEach(d => {
                    const iconHtml = d.customLogo ? d.customLogo : `<i class="fa-solid ${d.icon}" style="color: ${d.color};"></i>`;
                    htmlStr += `
                    <div class="bank-card">
                        <div class="img" style="background: ${d.bg};">
                            <div class="save"><i class="fa-regular fa-bookmark svg"></i></div>
                        </div>
                        <div class="text">
                            <div class="h3">${d.title}</div>
                            <div class="p">${d.desc}</div>
                            <div class="icon-box" style="background-color: ${d.color}15;">
                                ${iconHtml}
                                <a href="${d.link || '#'}" target="_blank" class="span" style="color: ${d.color}; text-decoration: none; position: relative; z-index: 10;">Explore</a>
                            </div>
                        </div>
                    </div>`;
                });
                htmlStr += '</div>';
                modalContent.innerHTML = htmlStr;
                
                const slider = modalContent.querySelector('.banking-slider');
                if (slider) {
                    let isDown = false;
                    let startX;
                    let scrollLeft;
                    slider.addEventListener('mousedown', (e) => {
                        isDown = true;
                        slider.style.cursor = 'grabbing';
                        slider.style.scrollSnapType = 'none';
                        startX = e.pageX - slider.offsetLeft;
                        scrollLeft = slider.scrollLeft;
                    });
                    slider.addEventListener('mouseleave', () => {
                        isDown = false;
                        slider.style.cursor = 'auto';
                        slider.style.scrollSnapType = 'x mandatory';
                    });
                    slider.addEventListener('mouseup', () => {
                        isDown = false;
                        slider.style.cursor = 'auto';
                        slider.style.scrollSnapType = 'x mandatory';
                    });
                    slider.addEventListener('mousemove', (e) => {
                        if (!isDown) return;
                        e.preventDefault();
                        const x = e.pageX - slider.offsetLeft;
                        const walk = (x - startX) * 2;
                        slider.scrollLeft = scrollLeft - walk;
                    });
                }
            } else {
                modalContent.innerHTML = '<div class="service-option"><p>Coming soon...</p></div>';
            }
            
            modalOverlay.classList.add('active');
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
    }

}); // end of DOMContentLoaded

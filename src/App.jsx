import { useRef, useState, useEffect } from 'react';
import { Map, BarChart3 } from 'lucide-react';
import { MapView } from './components/MapView';
import AnalysisView from './components/AnalysisView';
import { generateStratifiedSample, getStatistics } from './utils/dataUtils';
import { useMap } from './hooks/useMap';
import { categoryConfig } from './config/categoryConfig';

const App = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [currentView, setCurrentView] = useState('map');

  // Generate data
  const sampleData = generateStratifiedSample();
  const statistics = getStatistics(sampleData);
  
  // Setup map
  const { mapLoaded, visibleLayers, toggleLayer } = useMap(mapContainer, map, currentView, sampleData);





  useEffect(() => {
    if (currentView === 'map' && !map.current) {
      // Initialize Mapbox GL JS map
      const initializeMap = async () => {
        // ⚡ ADD YOUR MAPBOX API KEY HERE ⚡
        const MAPBOX_API_KEY = 'pk.eyJ1Ijoia2F5Y2VlcHJhZyIsImEiOiJjbWRsNGcyeHcxNmZqMmxxM3hjOTM3bm12In0.yboxKqGeZF8p9TAbIeQWgw';
        
        // Check if Mapbox API key is provided
        if (MAPBOX_API_KEY === 'YOUR_MAPBOX_API_KEY_HERE') {
          // Fallback mock map when no API key is provided
          const container = document.getElementById('map');
          if (container) {
            container.innerHTML = `
              <div style="
                width: 100%; 
                height: 100%; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                position: relative;
                border-radius: 8px;
                overflow: hidden;
              ">
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  color: white;
                  text-align: center;
                  font-family: system-ui;
                ">
                  <h3 style="margin: 0 0 10px 0; font-size: 18px;">🗺️ Mapbox Integration Ready</h3>
                  <p style="margin: 0; opacity: 0.8;">Add your Mapbox API key and run locally</p>
                  <div style="margin-top: 15px; font-size: 12px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px; text-align: left;">
                    <div style="margin-bottom: 8px; font-weight: bold;">Setup Steps:</div>
                    <div>1. Get API key from mapbox.com</div>
                    <div>2. Add Mapbox GL JS script to HTML</div>
                    <div>3. Replace API key in code</div>
                    <div>4. Run in local development environment</div>
                  </div>
                  <div style="margin-top: 15px; font-size: 14px; background: rgba(0,0,0,0.1); padding: 12px; border-radius: 6px;">
                    <div style="margin: 4px 0;"><span style="color: #3B82F6;">●</span> Schools: ${sampleData.features.filter(f => f.properties.category === 'schools').length} locations</div>
                    <div style="margin: 4px 0;"><span style="color: #10B981;">●</span> Supermarkets: ${sampleData.features.filter(f => f.properties.category === 'supermarkets').length} locations</div>
                    <div style="margin: 4px 0;"><span style="color: #EF4444;">●</span> Police Stations: ${sampleData.features.filter(f => f.properties.category === 'police').length} locations</div>
                    <div style="margin: 4px 0;"><span style="color: #22C55E;">●</span> Parks: ${sampleData.features.filter(f => f.properties.category === 'parks').length} locations</div>
                  </div>
                </div>
              </div>
            `;
            setMapLoaded(true);
          }
          return;
        }

        // ⚡ MAPBOX INTEGRATION CODE ⚡
        // This will work when you:
        // 1. Add Mapbox GL JS script to your HTML
        // 2. Add your API key above
        
        // Check if Mapbox GL JS is loaded from CDN
        if (typeof window.mapboxgl === 'undefined') {
          const container = document.getElementById('map');
          if (container) {
            // Check if API key has been added
            const hasApiKey = MAPBOX_API_KEY !== 'YOUR_MAPBOX_API_KEY_HERE';
            
            container.innerHTML = `
              <div style="
                width: 100%; 
                height: 100%; 
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                position: relative;
                border-radius: 8px;
                overflow: hidden;
                border: 2px solid #60a5fa;
              ">
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  color: white;
                  text-align: center;
                  font-family: system-ui;
                  max-width: 90%;
                ">
                  <h3 style="margin: 0 0 12px 0; font-size: 20px;">🗺️ Interactive Map Preview</h3>
                  <p style="margin: 0 0 16px 0; opacity: 0.9; font-size: 14px;">Your API key is configured! The map works in local development.</p>
                  
                  <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">What you'll see locally:</div>
                    <div style="font-size: 12px; text-align: left;">
                      • Interactive NYC map centered on all 3 boroughs<br/>
                      • ${sampleData.features.length} clickable location markers<br/>
                      • Color-coded by facility type<br/>
                      • Popups with facility details<br/>
                      • Layer toggle controls (working buttons above)<br/>
                      • Zoom, pan, and hover interactions
                    </div>
                  </div>
                  
                  <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px; font-size: 12px;">
                    <div style="font-weight: bold; margin-bottom: 6px;">Stratified Sample Data (0.1%):</div>
                    <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
                      <div><span style="color: #93c5fd;">●</span> Schools: ${sampleData.features.filter(f => f.properties.category === 'schools').length}</div>
                      <div><span style="color: #86efac;">●</span> Markets: ${sampleData.features.filter(f => f.properties.category === 'supermarkets').length}</div>
                      <div><span style="color: #fca5a5;">●</span> Police: ${sampleData.features.filter(f => f.properties.category === 'police').length}</div>
                      <div><span style="color: #a7f3d0;">●</span> Parks: ${sampleData.features.filter(f => f.properties.category === 'parks').length}</div>
                    </div>
                  </div>
                  
                  <div style="margin-top: 12px; font-size: 11px; opacity: 0.8;">
                    💡 Claude artifacts can't load external map libraries<br/>
                    Try the <strong>Analysis</strong> tab for working Chart.js visualizations!
                  </div>
                </div>
              </div>
            `;
            setMapLoaded(true);
          }
          return;
        }

        // Mapbox GL JS is loaded, initialize the real map
        window.mapboxgl.accessToken = MAPBOX_API_KEY;
        
        map.current = new window.mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-73.935242, 40.730610], // NYC center
          zoom: 10
        });

        map.current.on('load', () => {
          setMapLoaded(true);
          
          // Add sample data as GeoJSON source
          map.current.addSource('amenities', {
            type: 'geojson',
            data: sampleData
          });

          // Add layers for each category
          Object.entries(categoryConfig).forEach(([category, config]) => {
            map.current.addLayer({
              id: category,
              type: 'circle',
              source: 'amenities',
              filter: ['==', ['get', 'category'], category],
              paint: {
                'circle-radius': 8,
                'circle-color': config.color,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
              }
            });

            // Add click handler for popups
            map.current.on('click', category, (e) => {
              const coordinates = e.features[0].geometry.coordinates.slice();
              const properties = e.features[0].properties;

              new window.mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`
                  <div style="font-family: system-ui;">
                    <h3 style="margin: 0 0 8px 0; color: ${config.color};">${properties.name}</h3>
                    <p style="margin: 0; font-size: 14px; color: #666;">
                      ${config.name} in ${properties.borough}
                    </p>
                  </div>
                `)
                .addTo(map.current);
            });

            // Change cursor on hover
            map.current.on('mouseenter', category, () => {
              map.current.getCanvas().style.cursor = 'pointer';
            });

            map.current.on('mouseleave', category, () => {
              map.current.getCanvas().style.cursor = '';
            });
          });

          // Apply initial layer visibility
          Object.entries(visibleLayers).forEach(([category, visible]) => {
            if (map.current.getLayer(category)) {
              map.current.setLayoutProperty(category, 'visibility', visible ? 'visible' : 'none');
            }
          });
        });

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
          const container = document.getElementById('map');
          if (container) {
            container.innerHTML = `
              <div style="
                width: 100%; 
                height: 100%; 
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                position: relative;
                border-radius: 8px;
                overflow: hidden;
              ">
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  color: white;
                  text-align: center;
                  font-family: system-ui;
                ">
                  <h3 style="margin: 0 0 10px 0; font-size: 18px;">⚠️ Mapbox Error</h3>
                  <p style="margin: 0; opacity: 0.8;">Check your API key and network connection</p>
                  <p style="margin-top: 10px; font-size: 12px; opacity: 0.7;">${e.error?.message || 'Invalid API key or network error'}</p>
                </div>
              </div>
            `;
            setMapLoaded(true);
          }
        });
      };

      initializeMap();
    }
  }, [currentView, sampleData, categoryConfig, visibleLayers]);

  // Handle layer visibility changes with Mapbox


  return (
    <div className="h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">NYC Amenities Explorer</h1>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'map'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Map className="w-4 h-4" />
                Map View
              </button>
              
              <button
                onClick={() => setCurrentView('analysis')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'analysis'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-80px)]">
        {currentView === 'map' ? (
          <MapView
            mapContainer={mapContainer}
            mapLoaded={mapLoaded}
            visibleLayers={visibleLayers}
            toggleLayer={toggleLayer}
            sampleData={sampleData}
          />
        ) : (
          <AnalysisView
            sampleData={sampleData}
            statistics={statistics}
          />
        )}
      </div>
    </div>
  );
};

export default App;
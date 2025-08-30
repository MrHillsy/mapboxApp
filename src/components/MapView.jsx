import { useEffect, useState } from 'react';
import { MapPin, Filter, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';
import { categoryConfig } from '../config/categoryConfig';

/**
 * MapView Component - Displays the interactive map with amenity locations
 * @param {Object} props Component props
 * @param {Object} props.mapContainer Reference to the map container DOM element
 * @param {boolean} props.mapLoaded Flag indicating if map has finished loading
 * @param {Object} props.visibleLayers Object tracking visibility state of each category layer
 * @param {Function} props.toggleLayer Function to toggle layer visibility
 * @param {Object} props.sampleData GeoJSON data containing amenity locations
 */
export const MapView = ({ mapContainer, mapLoaded, visibleLayers, toggleLayer, sampleData }) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [zoom, setZoom] = useState(10);

  // Handle zoom controls
  const handleZoom = (direction) => {
    if (!mapInstance) return;
    const currentZoom = mapInstance.getZoom();
    mapInstance.easeTo({
      zoom: direction === 'in' ? currentZoom + 1 : currentZoom - 1,
      duration: 300
    });
  };

  useEffect(() => {
    // Initialize Mapbox GL JS map
    const initializeMap = async () => {
      // Mapbox API configuration
      const MAPBOX_API_KEY = 'pk.eyJ1Ijoia2F5Y2VlcHJhZyIsImEiOiJjbWRsNGcyeHcxNmZqMmxxM3hjOTM3bm12In0.yboxKqGeZF8p9TAbIeQWgw';
      
      // Verify Mapbox GL JS is loaded
      if (!window.mapboxgl) {
        console.error('Mapbox GL JS is not loaded');
        return;
      }

      // Initialize Mapbox with API key
      window.mapboxgl.accessToken = MAPBOX_API_KEY;
      
      // Create new map instance
      const map = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Street style for better visibility
        center: [-73.935242, 40.730610], // NYC center coordinates
        zoom: 10
      });

      // Store map instance for zoom controls
      setMapInstance(map);

      // Setup map layers and interactivity once map is loaded
      map.on('load', () => {
        // Add amenities data source
        map.addSource('amenities', {
          type: 'geojson',
          data: sampleData
        });

        // Create layers for each category with distinct styling and interactivity
        Object.entries(categoryConfig).forEach(([category, config]) => {
          // Add circle layer for category
          map.addLayer({
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

          // Add popup on click
          map.on('click', category, (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const properties = e.features[0].properties;

            // Create and show popup with location details
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
              .addTo(map);
          });

          // Add hover effects
          map.on('mouseenter', category, () => {
            map.getCanvas().style.cursor = 'pointer';
          });

          map.on('mouseleave', category, () => {
            map.getCanvas().style.cursor = '';
          });
        });

        // Set initial layer visibility states
        Object.entries(visibleLayers).forEach(([category, visible]) => {
          map.setLayoutProperty(category, 'visibility', visible ? 'visible' : 'none');
        });
      });

      return map;
    };

    initializeMap();
  }, [mapContainer, sampleData, visibleLayers]); // Dependencies for the effect

  return (
    <div className="h-full flex flex-col">
      {/* Map Controls Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            NYC Amenities Map
          </h2>
          
          {/* Layer Toggle Controls */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 mr-2">Toggle Layers:</span>
            {Object.entries(categoryConfig).map(([category, config]) => (
              <button
                key={category}
                onClick={() => toggleLayer(category)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  visibleLayers[category]
                    ? 'text-white shadow-md'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                }`}
                style={visibleLayers[category] ? { backgroundColor: config.color } : {}}
              >
                {visibleLayers[category] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {config.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} id="map" className="w-full h-full" />
        
        {/* Zoom Controls */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2">
          <button
            onClick={() => handleZoom('in')}
            className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        {/* Loading Indicator */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )};
import { useState, useEffect } from 'react';

/**
 * Custom hook to handle Mapbox map initialization and layer management
 * @param {Object} mapContainer Reference to the map container DOM element
 * @param {Object} map Reference to store the Mapbox map instance
 * @param {string} currentView Current view state ('map' or 'analysis')
 * @param {Object} sampleData GeoJSON data to display on the map
 * @returns {Object} Object containing map state and layer control functions
 */
export const useMap = (mapContainer, map, currentView, sampleData) => {
  // Track map loading state
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Track visibility state for each category layer
  const [visibleLayers, setVisibleLayers] = useState({
    schools: true,
    supermarkets: true,
    police: true,
    parks: true
  });

  useEffect(() => {
    if (currentView === 'map' && !map.current) {
      const initializeMap = async () => {
        const MAPBOX_API_KEY = 'pk.eyJ1Ijoia2F5Y2VlcHJhZyIsImEiOiJjbWRsNGcyeHcxNmZqMmxxM3hjOTM3bm12In0.yboxKqGeZF8p9TAbIeQWgw';
        
        if (typeof window.mapboxgl === 'undefined') {
          console.error('Mapbox GL JS is not loaded');
          return;
        }

        window.mapboxgl.accessToken = MAPBOX_API_KEY;
        
        map.current = new window.mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-73.935242, 40.730610],
          zoom: 10
        });

        map.current.on('load', () => {
          setMapLoaded(true);
          
          map.current.addSource('amenities', {
            type: 'geojson',
            data: sampleData
          });

          // Apply initial layer visibility
          Object.entries(visibleLayers).forEach(([category, visible]) => {
            const visibility = visible ? 'visible' : 'none';
            if (map.current.getLayer(category)) {
              map.current.setLayoutProperty(category, 'visibility', visibility);
            }
          });
        });
      };

      initializeMap();
    }
  }, [currentView, sampleData, mapContainer, map]);

  const toggleLayer = (category) => {
    setVisibleLayers(prev => ({
      ...prev,
      [category]: !prev[category]
    }));

    if (map.current && mapLoaded) {
      const visibility = visibleLayers[category] ? 'none' : 'visible';
      try {
        map.current.setLayoutProperty(category, 'visibility', visibility);
      } catch (error) {
        console.log('Layer toggle will be applied when map loads');
      }
    }
  };

  return { mapLoaded, visibleLayers, toggleLayer };
};
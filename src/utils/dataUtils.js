import { categoryConfig } from '../config/categoryConfig';

export const realDataEstimates = {
  Brooklyn: { schools: 685, supermarkets: 1240, police: 23, parks: 532 },
  Queens: { schools: 456, supermarkets: 890, police: 16, parks: 378 },
  Manhattan: { schools: 287, supermarkets: 645, police: 22, parks: 156 }
};

export const generateStratifiedSample = () => {
  const features = [];
  const boroughCoordinates = {
    Brooklyn: { lat: 40.6782, lng: -73.9442, spread: 0.08 },
    Queens: { lat: 40.7282, lng: -73.8648, spread: 0.12 },
    Manhattan: { lat: 40.7831, lng: -73.9665, spread: 0.04 }
  };

  Object.entries(realDataEstimates).forEach(([borough, categories]) => {
    Object.entries(categories).forEach(([category, totalCount]) => {
      // Calculate 2.5% of the total count for each category
      const sampleSize = Math.max(1, Math.round(totalCount * 0.025));
      const coords = boroughCoordinates[borough];
      
      for (let i = 0; i < sampleSize; i++) {
        const lat = coords.lat + (Math.random() - 0.5) * coords.spread;
        const lng = coords.lng + (Math.random() - 0.5) * coords.spread;
        
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: { 
            category, 
            borough,
            name: `${category.charAt(0).toUpperCase() + category.slice(1)} ${i + 1}`,
            sampleId: `${borough}-${category}-${i}`
          }
        });
      }
    });
  });

  return { type: "FeatureCollection", features };
};

export const getStatistics = (sampleData) => {
  const stats = {};
  const boroughs = ['Brooklyn', 'Queens', 'Manhattan'];
  
  boroughs.forEach(borough => {
    stats[borough] = {};
    Object.keys(categoryConfig).forEach(category => {
      stats[borough][category] = sampleData.features.filter(
        f => f.properties.borough === borough && f.properties.category === category
      ).length;
    });
    stats[borough].total = Object.values(stats[borough]).reduce((sum, count) => sum + count, 0);
  });
  
  return stats;
};
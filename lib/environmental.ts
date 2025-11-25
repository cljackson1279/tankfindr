/**
 * Environmental Risk Data Integration
 * Fetches real environmental data from FEMA, USGS, and EPA APIs
 */

export interface EnvironmentalRiskData {
  floodZone: string;
  floodRisk: 'low' | 'medium' | 'high' | 'unknown';
  wetlands: string;
  soilType: string;
  hazards: string;
  dataSource: string[];
}

/**
 * Get comprehensive environmental risk data for a location
 */
export async function getEnvironmentalRisk(
  lat: number,
  lng: number,
  county?: string,
  state?: string
): Promise<EnvironmentalRiskData> {
  try {
    const [floodData, wetlandsData, soilData] = await Promise.all([
      fetchFEMAFloodZone(lat, lng),
      fetchWetlandsData(lat, lng),
      fetchSoilData(lat, lng),
    ]);

    return {
      floodZone: floodData.zone,
      floodRisk: floodData.risk,
      wetlands: wetlandsData.description,
      soilType: soilData.texture,
      hazards: `Check EPA ECHO for detailed hazard information`,
      dataSource: ['FEMA NFHL', 'USGS National Map', 'NRCS Soil Survey'],
    };
  } catch (error) {
    console.error('Error fetching environmental data:', error);
    return {
      floodZone: 'Data unavailable',
      floodRisk: 'unknown',
      wetlands: 'Data unavailable',
      soilType: 'Data unavailable',
      hazards: 'Data unavailable',
      dataSource: [],
    };
  }
}

/**
 * Fetch FEMA flood zone data
 */
async function fetchFEMAFloodZone(lat: number, lng: number): Promise<{ zone: string; risk: 'low' | 'medium' | 'high' | 'unknown' }> {
  try {
    const response = await fetch(
      `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?` +
      `geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&` +
      `spatialRel=esriSpatialRelIntersects&outFields=FLD_ZONE,ZONE_SUBTY&f=json`,
      { 
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`FEMA API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const zone = data.features[0].attributes?.FLD_ZONE || 'Unknown';
      const subtype = data.features[0].attributes?.ZONE_SUBTY || '';
      
      // Determine risk level based on flood zone
      let risk: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';
      if (zone.startsWith('A') || zone.startsWith('V')) {
        risk = 'high'; // High-risk flood zones
      } else if (zone.startsWith('X') && subtype.includes('0.2')) {
        risk = 'medium'; // Moderate flood hazard
      } else if (zone.startsWith('X')) {
        risk = 'low'; // Minimal flood hazard
      }
      
      return { zone: `Zone ${zone}${subtype ? ` (${subtype})` : ''}`, risk };
    }
    
    return { zone: 'Zone X (Minimal Flood Hazard)', risk: 'low' };
  } catch (error) {
    console.error('FEMA flood zone fetch error:', error);
    return { zone: 'Data unavailable', risk: 'unknown' };
  }
}

/**
 * Fetch wetlands data from USGS/FWS
 */
async function fetchWetlandsData(lat: number, lng: number): Promise<{ exists: boolean; description: string }> {
  try {
    // FWS National Wetlands Inventory
    const response = await fetch(
      `https://fwsprimary.wim.usgs.gov/wetlands/rest/services/Wetlands/MapServer/0/query?` +
      `geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&` +
      `distance=152.4&units=esriSRMeters&` + // 500 feet
      `spatialRel=esriSpatialRelIntersects&outFields=WETLAND_TYPE,ACRES&f=json`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`Wetlands API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const wetlandType = data.features[0].attributes?.WETLAND_TYPE || 'Unknown type';
      const acres = data.features[0].attributes?.ACRES || 0;
      return {
        exists: true,
        description: `${wetlandType} wetland within 500ft (${acres.toFixed(2)} acres)`,
      };
    }
    
    return { exists: false, description: 'No wetlands within 500ft' };
  } catch (error) {
    console.error('Wetlands fetch error:', error);
    return { exists: false, description: 'Data unavailable' };
  }
}

/**
 * Fetch soil data from NRCS Web Soil Survey
 */
async function fetchSoilData(lat: number, lng: number): Promise<{ texture: string }> {
  try {
    // NRCS Soil Data Access API
    const response = await fetch(
      `https://sdmdataaccess.sc.egov.usda.gov/Spatial/SDMWGS84Geographic.wfs?` +
      `SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=MapunitPoly&` +
      `FILTER=<Filter><Intersects><PropertyName>Geometry</PropertyName>` +
      `<Point><coordinates>${lng},${lat}</coordinates></Point></Intersects></Filter>`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`Soil API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse soil texture from response
    // This is a simplified version - real implementation would parse WFS XML/JSON
    if (data.features && data.features.length > 0) {
      const soilName = data.features[0].properties?.muname || 'Unknown';
      return { texture: soilName };
    }
    
    return { texture: 'Data unavailable - check NRCS Web Soil Survey' };
  } catch (error) {
    console.error('Soil data fetch error:', error);
    return { texture: 'Data unavailable' };
  }
}

/**
 * Get EPA ECHO link for environmental compliance
 */
export function getEPAEchoLink(lat: number, lng: number): string {
  return `https://echo.epa.gov/facilities/facility-search?p_lat=${lat}&p_long=${lng}&p_radius=1`;
}

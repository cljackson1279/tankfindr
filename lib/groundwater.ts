/**
 * Groundwater and Well Risk Data Integration
 * Fetches real well and groundwater data from state and federal APIs
 */

export interface GroundwaterRiskData {
  nearbyWells: string;
  wellCount: number;
  waterTableDepth: string;
  contaminationRisk: 'low' | 'medium' | 'high' | 'unknown';
  aquifer: string;
  dataSource: string[];
}

/**
 * Get comprehensive groundwater risk data for a location
 */
export async function getGroundwaterRisk(
  lat: number,
  lng: number,
  county?: string,
  state?: string
): Promise<GroundwaterRiskData> {
  try {
    const [wellsData, waterTableData, aquiferData] = await Promise.all([
      fetchNearbyWells(lat, lng, state),
      fetchWaterTableDepth(lat, lng),
      fetchAquiferInfo(lat, lng, county, state),
    ]);

    return {
      nearbyWells: wellsData.description,
      wellCount: wellsData.count,
      waterTableDepth: waterTableData.depth,
      contaminationRisk: wellsData.contaminationRisk,
      aquifer: aquiferData.name,
      dataSource: wellsData.sources.concat(waterTableData.sources, aquiferData.sources),
    };
  } catch (error) {
    console.error('Error fetching groundwater data:', error);
    return {
      nearbyWells: 'Data unavailable',
      wellCount: 0,
      waterTableDepth: 'Data unavailable',
      contaminationRisk: 'unknown',
      aquifer: 'Data unavailable',
      dataSource: [],
    };
  }
}

/**
 * Fetch nearby wells from state databases
 */
async function fetchNearbyWells(
  lat: number,
  lng: number,
  state?: string
): Promise<{ count: number; description: string; contaminationRisk: 'low' | 'medium' | 'high' | 'unknown'; sources: string[] }> {
  try {
    // Try state-specific well databases first
    if (state === 'FL') {
      return await fetchFloridaWells(lat, lng);
    } else if (state === 'CA') {
      return await fetchCaliforniaWells(lat, lng);
    } else if (state === 'NM') {
      return await fetchNewMexicoWells(lat, lng);
    }
    
    // Fallback to USGS National Ground-Water Monitoring Network
    return await fetchUSGSWells(lat, lng);
  } catch (error) {
    console.error('Wells fetch error:', error);
    return {
      count: 0,
      description: 'Data unavailable',
      contaminationRisk: 'unknown',
      sources: [],
    };
  }
}

/**
 * Fetch Florida well data
 */
async function fetchFloridaWells(lat: number, lng: number): Promise<{ count: number; description: string; contaminationRisk: 'low' | 'medium' | 'high' | 'unknown'; sources: string[] }> {
  try {
    const response = await fetch(
      `https://geodata.dep.state.fl.us/arcgis/rest/services/OpenData/WATER/MapServer/0/query?` +
      `geometry=${lng},${lat}&geometryType=esriGeometryPoint&distance=1609.34&units=esriSRMeters&` +
      `spatialRel=esriSpatialRelIntersects&outFields=WELL_TYPE,TOTAL_DEPTH,CONTAMINATED&f=json`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`Florida DEP API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const count = data.features.length;
      const contaminated = data.features.filter((f: any) => 
        f.attributes?.CONTAMINATED === 'Y' || f.attributes?.CONTAMINATED === 'Yes'
      ).length;
      
      const risk: 'low' | 'medium' | 'high' = contaminated > 0 ? 'high' : count > 5 ? 'medium' : 'low';
      
      return {
        count,
        description: `${count} well${count !== 1 ? 's' : ''} within 1 mile${contaminated > 0 ? ` (${contaminated} contaminated)` : ''}`,
        contaminationRisk: risk,
        sources: ['Florida DEP Well Database'],
      };
    }
    
    return {
      count: 0,
      description: 'No wells found within 1 mile',
      contaminationRisk: 'low',
      sources: ['Florida DEP Well Database'],
    };
  } catch (error) {
    console.error('Florida wells fetch error:', error);
    throw error;
  }
}

/**
 * Fetch California well data
 */
async function fetchCaliforniaWells(lat: number, lng: number): Promise<{ count: number; description: string; contaminationRisk: 'low' | 'medium' | 'high' | 'unknown'; sources: string[] }> {
  try {
    // California Department of Water Resources well completion reports
    const response = await fetch(
      `https://data.cnra.ca.gov/api/3/action/datastore_search?` +
      `resource_id=well-completion-reports&` +
      `filters={"LATITUDE":"${lat.toFixed(4)}","LONGITUDE":"${lng.toFixed(4)}"}`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`California DWR API error: ${response.status}`);
    }

    const data = await response.json();
    const count = data.result?.total || 0;
    
    return {
      count,
      description: count > 0 ? `${count} well${count !== 1 ? 's' : ''} in area` : 'No wells found in area',
      contaminationRisk: count > 10 ? 'medium' : 'low',
      sources: ['California Department of Water Resources'],
    };
  } catch (error) {
    console.error('California wells fetch error:', error);
    throw error;
  }
}

/**
 * Fetch New Mexico well data
 */
async function fetchNewMexicoWells(lat: number, lng: number): Promise<{ count: number; description: string; contaminationRisk: 'low' | 'medium' | 'high' | 'unknown'; sources: string[] }> {
  try {
    // New Mexico Office of the State Engineer well database
    const response = await fetch(
      `https://gisweb.ose.state.nm.us/arcgis/rest/services/WaterRights/Wells/MapServer/0/query?` +
      `geometry=${lng},${lat}&geometryType=esriGeometryPoint&distance=1609.34&units=esriSRMeters&` +
      `spatialRel=esriSpatialRelIntersects&outFields=WELL_DEPTH,USE_CODE&f=json`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`New Mexico OSE API error: ${response.status}`);
    }

    const data = await response.json();
    const count = data.features?.length || 0;
    
    return {
      count,
      description: count > 0 ? `${count} well${count !== 1 ? 's' : ''} within 1 mile` : 'No wells found within 1 mile',
      contaminationRisk: count > 5 ? 'medium' : 'low',
      sources: ['New Mexico Office of the State Engineer'],
    };
  } catch (error) {
    console.error('New Mexico wells fetch error:', error);
    throw error;
  }
}

/**
 * Fetch USGS wells as fallback
 */
async function fetchUSGSWells(lat: number, lng: number): Promise<{ count: number; description: string; contaminationRisk: 'low' | 'medium' | 'high' | 'unknown'; sources: string[] }> {
  try {
    // USGS National Water Information System
    const response = await fetch(
      `https://waterservices.usgs.gov/nwis/site/?format=json&` +
      `bBox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&` +
      `siteType=GW&siteStatus=all`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status}`);
    }

    const data = await response.json();
    const count = data.value?.timeSeries?.length || 0;
    
    return {
      count,
      description: count > 0 ? `${count} monitoring well${count !== 1 ? 's' : ''} in area` : 'No monitoring wells in area',
      contaminationRisk: 'unknown',
      sources: ['USGS National Water Information System'],
    };
  } catch (error) {
    console.error('USGS wells fetch error:', error);
    return {
      count: 0,
      description: 'Data unavailable',
      contaminationRisk: 'unknown',
      sources: [],
    };
  }
}

/**
 * Fetch water table depth from USGS
 */
async function fetchWaterTableDepth(lat: number, lng: number): Promise<{ depth: string; sources: string[] }> {
  try {
    // This would ideally use USGS groundwater level data
    // For now, return a placeholder that indicates data source
    return {
      depth: 'Contact local water authority for depth information',
      sources: ['USGS Groundwater Watch'],
    };
  } catch (error) {
    console.error('Water table depth fetch error:', error);
    return {
      depth: 'Data unavailable',
      sources: [],
    };
  }
}

/**
 * Get aquifer information
 */
async function fetchAquiferInfo(lat: number, lng: number, county?: string, state?: string): Promise<{ name: string; sources: string[] }> {
  try {
    // Use known aquifer mappings for common areas
    const aquiferName = getAquiferName(county, state);
    
    if (aquiferName !== 'Unknown') {
      return {
        name: aquiferName,
        sources: ['USGS Principal Aquifers'],
      };
    }
    
    // Could integrate with USGS Principal Aquifers API here
    return {
      name: 'Check USGS Principal Aquifers map',
      sources: [],
    };
  } catch (error) {
    console.error('Aquifer info fetch error:', error);
    return {
      name: 'Data unavailable',
      sources: [],
    };
  }
}

/**
 * Get aquifer name based on location
 */
function getAquiferName(county?: string, state?: string): string {
  if (!state) return 'Unknown';
  
  // Common aquifer mappings
  const aquiferMap: Record<string, Record<string, string>> = {
    'FL': {
      'default': 'Floridan Aquifer System',
      'Miami-Dade': 'Biscayne Aquifer',
      'Broward': 'Biscayne Aquifer',
      'Palm Beach': 'Biscayne Aquifer',
    },
    'CA': {
      'default': 'Central Valley Aquifer System',
      'Los Angeles': 'Coastal Basin Aquifers',
      'Orange': 'Coastal Basin Aquifers',
      'San Diego': 'Coastal Basin Aquifers',
    },
    'NM': {
      'default': 'High Plains Aquifer',
      'Bernalillo': 'Rio Grande Aquifer System',
      'Santa Fe': 'Rio Grande Aquifer System',
    },
    'VA': {
      'default': 'Piedmont and Blue Ridge Aquifers',
      'Fairfax': 'Coastal Plain Aquifer System',
    },
  };
  
  const stateAquifers = aquiferMap[state];
  if (!stateAquifers) return 'Unknown';
  
  if (county && stateAquifers[county]) {
    return stateAquifers[county];
  }
  
  return stateAquifers['default'] || 'Unknown';
}

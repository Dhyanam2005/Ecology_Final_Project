export const fetchNASAData = async (latitude, longitude) => {
    const url = 'https://power.larc.nasa.gov/api/temporal/daily/point';
    const params = new URLSearchParams({
      parameters: 'T2M,RH2M,WS10M,SRAD', // Required parameters for Penman equation
      start: '20250315',                  // Start date (YYYYMMDD)
      end: '20250315',                    // End date (YYYYMMDD)
      longitude: longitude,               // Dynamic longitude based on user location
      latitude: latitude,                 // Dynamic latitude based on user location
      community: 'AG',                    // Community type ('AG' for Agriculture)
      format: 'JSON'                      // Desired response format (JSON)
    });
  
    const response = await fetch(`${url}?${params.toString()}`);
  
    if (!response.ok) {
      throw new Error('Error fetching data');
    }
  
    const data = await response.json();
    return data;
  };
  
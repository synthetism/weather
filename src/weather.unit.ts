/**
 * WEATHER UNIT - Weather information for AI
 * 
 * Provides weather data capabilities to AI agents.
 * Demonstrates how Unit Architecture integrates external APIs.
 * 
 * @example
 * ```typescript
 * const weather = WeatherUnit.create({ apiKey: "your-key" });
 * const ai = AIUnit.create();
 * 
 * // AI can now access weather information
 * await ai.tools([weather.teach()], {
 *   instructions: "What's the weather like in Tokyo today?"
 * });
 * ```
 */

import { 
  Unit, 
  createUnitSchema,
  type UnitProps,
  type TeachingContract } from '@synet/unit';

// =============================================================================
// WEATHER INTERFACES
// =============================================================================

export interface WeatherConfig {
  apiKey?: string;
  defaultUnits?: 'metric' | 'imperial' | 'kelvin';
  timeout?: number;
  metadata?: Record<string, unknown>;
}

export interface WeatherProps extends UnitProps {
  apiKey?: string;
  defaultUnits: 'metric' | 'imperial' | 'kelvin';
  timeout: number;
}

export interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  uvIndex?: number;
  units: string;
  timestamp: Date;
}

export interface ForecastData {
  location: string;
  country: string;
  forecasts: {
    date: string;
    high: number;
    low: number;
    description: string;
    icon: string;
    precipitation: number;
  }[];
  units: string;
  timestamp: Date;
}

// OpenWeatherMap API response interfaces
interface OpenWeatherResponse {
  name: string;
  sys: { country: string };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind?: {
    speed: number;
    deg: number;
  };
  visibility?: number;
  uvi?: number;
}

interface ForecastResponse {
  city: {
    name: string;
    country: string;
  };
  list: Array<{
    dt: number;
    main: { temp: number };
    weather: Array<{
      description: string;
      icon: string;
    }>;
    rain?: { '3h': number };
  }>;
}

interface GeocodingResponse {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface LocationResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

// =============================================================================
// WEATHER UNIT IMPLEMENTATION
// =============================================================================

/**
 * Weather Unit - Provides weather information to AI agents
 * 
 * This unit can fetch real weather data from OpenWeatherMap API
 * or provide mock data for development/testing.
 */
export class WeatherUnit extends Unit<WeatherProps> {
  protected constructor(props: WeatherProps) {
    super(props);
  }

  static create(config: WeatherConfig = {}): WeatherUnit {
    const props: WeatherProps = {
      dna: createUnitSchema({
        id: 'weather',
        version: '1.0.0'
      }),
      created: new Date(),
      metadata: config.metadata || {},
      apiKey: config.apiKey,
      defaultUnits: config.defaultUnits || 'metric',
      timeout: config.timeout || 5000
    };

    return new WeatherUnit(props);
  }

  whoami(): string {
    return `🌤️ WeatherUnit - Weather information provider (${this.dna.id})`;
  }

  capabilities(): string[] {
    const native = ['getCurrentWeather', 'getForecast', 'getWeatherByCoords', 'searchLocation'];
    const learned = Array.from(this._capabilities.keys());
    return [...native, ...learned];
  }

  help(): void {
    console.log(`
🌤️ WeatherUnit - Weather Information Provider

Native Capabilities:
• getCurrentWeather(location) - Get current weather for a location
• getForecast(location, days?) - Get weather forecast (1-5 days)
• getWeatherByCoords(lat, lon) - Get weather by coordinates
• searchLocation(query) - Search for location coordinates

Configuration:
• API Key: ${this.props.apiKey ? '✅ Configured' : '❌ Not configured (using mock data)'}
• Default Units: ${this.props.defaultUnits}
• Timeout: ${this.props.timeout}ms

Usage Examples:
  await weather.getCurrentWeather("Tokyo");
  await weather.getForecast("London", 3);
  await weather.getWeatherByCoords(35.6762, 139.6503);
  
AI Integration:
  await ai.tools([weather.teach()]);
  // AI can now access weather information
  
Note: Without API key, returns realistic mock data for development.
`);
  }

  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: {
        'getCurrentWeather': (...args: unknown[]) => this.getCurrentWeather(args[0] as string, args[1] as 'metric' | 'imperial' | 'kelvin'),
        'getForecast': (...args: unknown[]) => this.getForecast(args[0] as string, args[1] as number),
        'getWeatherByCoords': (...args: unknown[]) => this.getWeatherByCoords(args[0] as number, args[1] as number),
        'searchLocation': (...args: unknown[]) => this.searchLocation(args[0] as string)
      },
      tools: {
        'getCurrentWeather': {
          name: 'getCurrentWeather',
          description: 'Get current weather conditions for a specific location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'City name, e.g., "London", "New York", "Tokyo"'
              },
              units: {
                type: 'string',
                description: 'Temperature units to use',
                enum: ['metric', 'imperial', 'kelvin']
              }
            },
            required: ['location']
          }
        },
        'getForecast': {
          name: 'getForecast',
          description: 'Get weather forecast for multiple days',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'City name, e.g., "London", "New York", "Tokyo"'
              },
              days: {
                type: 'number',
                description: 'Number of forecast days (1-5)'
              }
            },
            required: ['location', 'days']
          }
        },
        'getWeatherByCoords': {
          name: 'getWeatherByCoords',
          description: 'Get weather by geographic coordinates',
          parameters: {
            type: 'object',
            properties: {
              latitude: {
                type: 'number',
                description: 'Latitude coordinate'
              },
              longitude: {
                type: 'number',
                description: 'Longitude coordinate'
              }
            },
            required: ['latitude', 'longitude']
          }
        },
        'searchLocation': {
          name: 'searchLocation',
          description: 'Search for location coordinates by name',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Location search query'
              }
            },
            required: ['query']
          }
        }
      }
    };
  }

  // =============================================================================
  // WEATHER OPERATIONS
  // =============================================================================

  /**
   * Get current weather for a location
   */
  async getCurrentWeather(location: string, units?: 'metric' | 'imperial' | 'kelvin'): Promise<WeatherData> {
    const weatherUnits = units || this.props.defaultUnits;
    
    if (!location || typeof location !== 'string') {
      throw new Error('[WeatherUnit] Location is required');
    }

    // If no API key, return mock data
    if (!this.props.apiKey) {
      return this.getMockWeather(location, weatherUnits);
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${this.props.apiKey}&units=${weatherUnits}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.props.timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`[WeatherUnit] Location "${location}" not found`);
        }
        throw new Error(`[WeatherUnit] Weather API error: ${response.status}`);
      }

      const data = await response.json() as OpenWeatherResponse;
      return this.transformWeatherData(data, weatherUnits);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`[WeatherUnit] Failed to fetch weather data: ${error}`);
    }
  }

  /**
   * Get weather forecast for a location
   */
  async getForecast(location: string, days = 5): Promise<ForecastData> {
    if (!location || typeof location !== 'string') {
      throw new Error('[WeatherUnit] Location is required');
    }

    if (days < 1 || days > 5) {
      throw new Error('[WeatherUnit] Forecast days must be between 1 and 5');
    }

    // If no API key, return mock data
    if (!this.props.apiKey) {
      return this.getMockForecast(location, days);
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${this.props.apiKey}&units=${this.props.defaultUnits}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.props.timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`[WeatherUnit] Location "${location}" not found`);
        }
        throw new Error(`[WeatherUnit] Weather API error: ${response.status}`);
      }

      const data = await response.json() as ForecastResponse;
      return this.transformForecastData(data, days);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`[WeatherUnit] Failed to fetch forecast data: ${error}`);
    }
  }

  /**
   * Get weather by coordinates
   */
  async getWeatherByCoords(lat: number, lon: number, units?: 'metric' | 'imperial' | 'kelvin'): Promise<WeatherData> {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      throw new Error('[WeatherUnit] Valid latitude and longitude are required');
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error('[WeatherUnit] Invalid coordinates');
    }

    const weatherUnits = units || this.props.defaultUnits;
    const location = `${lat},${lon}`;

    // If no API key, return mock data
    if (!this.props.apiKey) {
      return this.getMockWeather(location, weatherUnits);
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.props.apiKey}&units=${weatherUnits}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.props.timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`[WeatherUnit] Weather API error: ${response.status}`);
      }

      const data = await response.json() as OpenWeatherResponse;
      return this.transformWeatherData(data, weatherUnits);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`[WeatherUnit] Failed to fetch weather data: ${error}`);
    }
  }

  /**
   * Search for location coordinates
   */
  async searchLocation(query: string): Promise<LocationResult[]> {
    if (!query || typeof query !== 'string') {
      throw new Error('[WeatherUnit] Search query is required');
    }

    // If no API key, return mock data
    if (!this.props.apiKey) {
      return this.getMockLocationSearch(query);
    }

    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.props.apiKey}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.props.timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`[WeatherUnit] Geocoding API error: ${response.status}`);
      }

      const data = await response.json() as GeocodingResponse[];
      return data.map((item) => ({
        name: item.name,
        country: item.country,
        lat: item.lat,
        lon: item.lon
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`[WeatherUnit] Failed to search location: ${error}`);
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private transformWeatherData(data: OpenWeatherResponse, units: string): WeatherData {
    return {
      location: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      visibility: data.visibility || 0,
      uvIndex: data.uvi,
      units: units,
      timestamp: new Date()
    };
  }

  private transformForecastData(data: ForecastResponse, days: number): ForecastData {
    const forecasts = [];
    const dailyData = new Map<string, ForecastResponse['list']>();

    // Group by date
    for (const item of data.list.slice(0, days * 8)) {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, []);
      }
      const dayArray = dailyData.get(date);
      if (dayArray) {
        dayArray.push(item);
      }
    }

    // Process each day
    for (const [date, dayData] of Array.from(dailyData.entries()).slice(0, days)) {
      const temps = dayData.map(d => d.main.temp);
      const high = Math.round(Math.max(...temps));
      const low = Math.round(Math.min(...temps));
      const midday = dayData.find(d => new Date(d.dt * 1000).getHours() === 12) || dayData[0];
      
      forecasts.push({
        date,
        high,
        low,
        description: midday.weather[0].description,
        icon: midday.weather[0].icon,
        precipitation: dayData.reduce((sum, d) => sum + (d.rain?.['3h'] || 0), 0)
      });
    }

    return {
      location: data.city.name,
      country: data.city.country,
      forecasts,
      units: this.props.defaultUnits,
      timestamp: new Date()
    };
  }

  private getMockWeather(location: string, units: string): WeatherData {
    const mockWeathers = [
      { temp: 22, desc: 'Partly cloudy', icon: '02d', humidity: 65 },
      { temp: 18, desc: 'Light rain', icon: '10d', humidity: 80 },
      { temp: 25, desc: 'Sunny', icon: '01d', humidity: 45 },
      { temp: 15, desc: 'Overcast', icon: '04d', humidity: 70 },
      { temp: 28, desc: 'Hot and humid', icon: '01d', humidity: 85 }
    ];

    const mock = mockWeathers[Math.floor(Math.random() * mockWeathers.length)];
    
    return {
      location: location.split(',')[0],
      country: 'XX',
      temperature: mock.temp,
      feelsLike: mock.temp + Math.floor(Math.random() * 6) - 3,
      humidity: mock.humidity,
      pressure: 1013 + Math.floor(Math.random() * 40) - 20,
      description: mock.desc,
      icon: mock.icon,
      windSpeed: Math.floor(Math.random() * 20),
      windDirection: Math.floor(Math.random() * 360),
      visibility: 10000,
      units: units,
      timestamp: new Date()
    };
  }

  private getMockForecast(location: string, days: number): ForecastData {
    const forecasts = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      forecasts.push({
        date: date.toISOString().split('T')[0],
        high: 20 + Math.floor(Math.random() * 15),
        low: 10 + Math.floor(Math.random() * 10),
        description: ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain'][Math.floor(Math.random() * 4)],
        icon: ['01d', '02d', '04d', '10d'][Math.floor(Math.random() * 4)],
        precipitation: Math.floor(Math.random() * 10)
      });
    }

    return {
      location: location.split(',')[0],
      country: 'XX',
      forecasts,
      units: this.props.defaultUnits,
      timestamp: new Date()
    };
  }

  private getMockLocationSearch(query: string): LocationResult[] {
    const mockLocations = [
      { name: query, country: 'US', lat: 40.7128, lon: -74.0060 },
      { name: `${query} City`, country: 'UK', lat: 51.5074, lon: -0.1278 },
      { name: `${query} Prefecture`, country: 'JP', lat: 35.6762, lon: 139.6503 }
    ];

    return mockLocations.slice(0, Math.floor(Math.random() * 3) + 1);
  }
}

/**
 * OpenWeather API 2.5 Provider
 * 
 * Production-ready weather data provider using OpenWeatherMap API v2.5.
 * Handles geocoding, current weather, and forecasts with comprehensive error handling.
 * 
 * @version 1.0.0
 */

import type {
  IWeather,
  WeatherData,
  ForecastData,
  LocationResult,
  OpenWeather2Config
} from '../types.js';

// =============================================================================
// OPENWEATHER API RESPONSE TYPES
// =============================================================================

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
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
  list: Array<{
    dt: number;
    main: { 
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: { all: number };
    wind: { speed: number; deg: number; gust?: number };
    visibility: number;
    pop: number;
    rain?: { '3h': number };
    sys: { pod: string };
    dt_txt: string;
  }>;
}

interface GeocodingResponse {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

// =============================================================================
// OPENWEATHER PROVIDER IMPLEMENTATION
// =============================================================================

export class OpenWeather2 implements IWeather {
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly baseUrl: string;

  constructor(config: OpenWeather2Config) {
    if (!config.apiKey) {
      throw new Error('[OpenWeather2] API key is required');
    }

    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 5000;
    this.baseUrl = config.baseUrl || 'https://api.openweathermap.org/data/2.5';
  }

  // =============================================================================
  // PUBLIC INTERFACE METHODS
  // =============================================================================

  async getCurrentWeather(location: string, units: 'metric' | 'imperial' | 'kelvin' = 'metric'): Promise<WeatherData> {
    if (!location || typeof location !== 'string') {
      throw new Error('[OpenWeather2] Location is required');
    }

    try {
      const url = `${this.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=${units}&lang=en`;
      
      const response = await this.makeRequest(url);
      const data = await response.json() as OpenWeatherResponse;
      
      return this.transformWeatherData(data, units);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`[OpenWeather2] Failed to fetch weather data: ${error}`);
    }
  }

  async getForecast(lat: number, lon: number, units: 'metric' | 'imperial' | 'kelvin' = 'metric'): Promise<ForecastData> {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      throw new Error('[OpenWeather2] Valid latitude and longitude are required');
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error('[OpenWeather2] Invalid coordinates');
    }

    try {
      const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}`;
      
      const response = await this.makeRequest(url);
      const data = await response.json() as ForecastResponse;
      
      return this.transformForecastData(data, units);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`[OpenWeather2] Failed to fetch forecast data: ${error}`);
    }
  }

  async getWeatherByCoords(lat: number, lon: number, units: 'metric' | 'imperial' | 'kelvin' = 'metric'): Promise<WeatherData> {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      throw new Error('[OpenWeather2] Valid latitude and longitude are required');
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error('[OpenWeather2] Invalid coordinates');
    }

    try {
      const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}`;
      
      const response = await this.makeRequest(url);
      const data = await response.json() as OpenWeatherResponse;
      
      return this.transformWeatherData(data, units);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`[OpenWeather2] Failed to fetch weather data: ${error}`);
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      // Test with a simple weather query for London
      const url = `${this.baseUrl}/weather?q=London&appid=${this.apiKey}&units=metric`;
      const response = await this.makeRequest(url);
      return response.ok;
    } catch {
      return false;
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private async makeRequest(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('[OpenWeather2] Location not found');
        }
        if (response.status === 401) {
          throw new Error('[OpenWeather2] Invalid API key');
        }
        throw new Error(`[OpenWeather2] API error: ${response.status}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

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

  private transformForecastData(data: ForecastResponse, units: string): ForecastData {
    const forecasts = [];
    const dailyData = new Map<string, ForecastResponse['list']>();

    // Group by date (OpenWeather gives 5-day forecast in 3-hour intervals)
    for (const item of data.list) {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, []);
      }
      const dayArray = dailyData.get(date);
      if (dayArray) {
        dayArray.push(item);
      }
    }

    // Process each day (limit to 5 days max)
    for (const [date, dayData] of Array.from(dailyData.entries()).slice(0, 5)) {
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
      units: units,
      timestamp: new Date()
    };
  }
}

/**
 * Weather Provider Interface and Types
 * 
 * Universal interface for weather data providers following Unit Architecture patterns.
 * Enables seamless provider switching while maintaining consistent API.
 * 
 * @version 1.0.0
 */

// =============================================================================
// CORE WEATHER INTERFACES
// =============================================================================

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

export interface LocationResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

// =============================================================================
// WEATHER PROVIDER INTERFACE
// =============================================================================

/**
 * Universal weather provider interface
 * 
 * All weather providers must implement this interface to ensure
 * consistent behavior across different weather services.
 */
export interface IWeather {
  /**
   * Get current weather conditions for a specific location
   */
  getCurrentWeather(location: string, units?: 'metric' | 'imperial' | 'kelvin'): Promise<WeatherData>;

  /**
   * Get weather forecast for specific coordinates
   */
  getForecast(lat: number, lon: number, units?: 'metric' | 'imperial' | 'kelvin'): Promise<ForecastData>;

  /**
   * Get weather by geographic coordinates
   */
  getWeatherByCoords(lat: number, lon: number, units?: 'metric' | 'imperial' | 'kelvin'): Promise<WeatherData>;

  /**
   * Validate provider connection and configuration
   */
  validateConnection(): Promise<boolean>;
}

// =============================================================================
// PROVIDER CONFIGURATION TYPES
// =============================================================================

export interface OpenWeather2Config {
  apiKey: string;
  timeout?: number;
  baseUrl?: string;
}

export interface WeatherConfig {
  provider: IWeather;
  defaultUnits?: 'metric' | 'imperial' | 'kelvin';
  metadata?: Record<string, unknown>;
}

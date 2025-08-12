/**
 * @synet/weather - Professional Weather Data Integration
 * 
 * AI-ready weather capabilities through configurable providers.
 * Built with Unit Architecture for seamless AI integration.
 * 
 * @version 1.0.0
 */

// Export main Weather unit
export { Weather } from './weather.unit.js';

// Export providers
export { OpenWeather2 } from './providers/openweather2.js';

// Export types and interfaces
export type {
  IWeather,
  WeatherData,
  ForecastData,
  LocationResult,
  WeatherConfig,
  OpenWeather2Config
} from './types.js';

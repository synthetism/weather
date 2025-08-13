/**
 * @synet/weather - Professional Weather Data Integration
 * 
 * AI-ready weather capabilities through configurable providers.
 * Built with Unit Architecture for seamless AI integration.
 * 
 * @version 1.0.1
 */

// Export main Weather unit
export { Weather, VERSION } from './weather.unit';

// Export providers
export { OpenWeather2 } from './providers/openweather2';

// Export types and interfaces
export type {
  IWeather,
  WeatherData,
  ForecastData,
  LocationResult,
  WeatherConfig,
  OpenWeather2Config
} from './types';

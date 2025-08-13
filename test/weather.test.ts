/**
 * Weather Unit Tests
 * 
 * Basic test suite for Weather unit construction and Unit Architecture compliance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Weather } from '../src/weather.unit.js';
import { OpenWeather2 } from '../src/providers/openweather2.js';
import type { IWeather } from '../src/types.js';

// Mock provider for testing
class MockWeatherProvider implements IWeather {
  async getCurrentWeather() {
    return {
      location: 'Test City',
      country: 'TC',
      temperature: 20,
      feelsLike: 22,
      humidity: 60,
      pressure: 1013,
      description: 'Clear sky',
      icon: '01d',
      windSpeed: 5,
      windDirection: 90,
      visibility: 10000,
      units: 'metric',
      timestamp: new Date()
    };
  }

  async getForecast() {
    return {
      location: 'Test City',
      country: 'TC',
      forecasts: [
        {
          date: '2025-08-12',
          high: 25,
          low: 15,
          description: 'Sunny',
          icon: '01d',
          precipitation: 0
        }
      ],
      units: 'metric',
      timestamp: new Date()
    };
  }

  async getWeatherByCoords() {
    return this.getCurrentWeather();
  }



  async validateConnection() {
    return true;
  }
}

describe('Weather Unit', () => {
  let weather: Weather;
  let mockProvider: IWeather;

  beforeEach(() => {
    mockProvider = new MockWeatherProvider();
    weather = Weather.create({
      provider: mockProvider,
      defaultUnits: 'metric'
    });
  });

  describe('Unit Architecture Compliance', () => {
    it('should create with valid configuration', () => {
      expect(weather).toBeDefined();
      expect(weather.dna.id).toBe('weather');
    });

    it('should implement Unit Architecture methods', () => {
      expect(typeof weather.whoami).toBe('function');
      expect(typeof weather.help).toBe('function');
      expect(typeof weather.teach).toBe('function');
      expect(typeof weather.can).toBe('function');
      expect(typeof weather.execute).toBe('function');
    });

    it('should implement consciousness trinity', () => {
      expect(typeof weather.capabilities).toBe('function');
      expect(typeof weather.schema).toBe('function');
      expect(typeof weather.validator).toBe('function');
    });

    it('should provide teaching contract', () => {
      const contract = weather.teach();
      expect(contract).toHaveProperty('unitId', 'weather');
      expect(contract).toHaveProperty('capabilities');
      expect(contract).toHaveProperty('schema');
      expect(contract).toHaveProperty('validator');
    });

    it('should have correct capabilities', () => {
      expect(weather.can('getCurrentWeather')).toBe(true);
      expect(weather.can('getForecast')).toBe(true);
      expect(weather.can('getWeatherByCoords')).toBe(true);

    });

    it('should have schemas for all capabilities', () => {
      const schema = weather.schema();
      expect(schema.has('getCurrentWeather')).toBe(true);
      expect(schema.has('getForecast')).toBe(true);
      expect(schema.has('getWeatherByCoords')).toBe(true);
   
    });
  });

  describe('Weather Operations', () => {
    it('should delegate getCurrentWeather to provider', async () => {
      const result = await weather.getCurrentWeather('London');
      expect(result).toHaveProperty('location', 'Test City');
      expect(result).toHaveProperty('temperature', 20);
    });

    it('should delegate getForecast to provider', async () => {
      const result = await weather.getForecast(51.5074, -0.1278);
      expect(result).toHaveProperty('location', 'Test City');
      expect(result.forecasts).toHaveLength(1);
    });

    it('should delegate getWeatherByCoords to provider', async () => {
      const result = await weather.getWeatherByCoords(51.5074, -0.1278);
      expect(result).toHaveProperty('location', 'Test City');
    });



    it('should delegate validateConnection to provider', async () => {
      const result = await weather.validateConnection();
      expect(result).toBe(true);
    });
  });

  describe('Integration with Real Provider', () => {
    it('should work with OpenWeather2 provider', () => {
      const realProvider = new OpenWeather2({ apiKey: 'test-key' });
      const realWeather = Weather.create({
        provider: realProvider,
        defaultUnits: 'metric'
      });

      expect(realWeather).toBeDefined();
      expect(realWeather.can('getCurrentWeather')).toBe(true);
    });
  });
});

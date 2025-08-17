/**
 * Wildcard Events Test
 * 
 * Test suite for wildcard event patterns in Weather unit
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Weather, type WeatherEvent } from '../src/weather.unit.js';
import type { IWeather } from '../src/types.js';

// Simple test provider
class SimpleProvider implements IWeather {
  async getCurrentWeather() {
    return {
      location: 'Test City',
      country: 'TC',
      temperature: 22,
      feelsLike: 25,
      humidity: 65,
      pressure: 1015,
      description: 'Sunny',
      icon: '01d',
      windSpeed: 5,
      windDirection: 180,
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
          date: '2025-08-17',
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
    return {
      location: 'Coordinate City',
      country: 'CC',
      temperature: 18,
      feelsLike: 20,
      humidity: 70,
      pressure: 1010,
      description: 'Cloudy',
      icon: '03d',
      windSpeed: 3,
      windDirection: 90,
      visibility: 8000,
      units: 'metric',
      timestamp: new Date()
    };
  }

  async validateConnection() {
    return true;
  }
}

describe('Weather Unit Wildcard Events', () => {
  let weather: Weather;
  
  beforeEach(() => {
    weather = Weather.create({
      provider: new SimpleProvider(),
      defaultUnits: 'metric'
    });
  });

  describe('Wildcard Pattern Support', () => {
    it('should support * wildcard to catch all events', async () => {
      const wildcardHandler = vi.fn();
      weather.on('*', wildcardHandler);
      
      // Trigger multiple different events
      await weather.getCurrentWeather('Tokyo');
      await weather.getForecast(35.6762, 139.6503);
      await weather.getWeatherByCoords(48.8566, 2.3522);
      
      // Wildcard handler should have caught all 3 events
      expect(wildcardHandler).toHaveBeenCalledTimes(3);
      
      const eventTypes = wildcardHandler.mock.calls.map(call => call[0].type);
      expect(eventTypes).toEqual(['weather.current', 'weather.forecast', 'weather.coords']);
    });

    it('should support pattern matching with weather.*', async () => {
      const patternHandler = vi.fn();
      weather.on('weather.*', patternHandler);
      
      // These should all match weather.*
      await weather.getCurrentWeather('London');
      await weather.getForecast(51.5074, -0.1278);
      await weather.getWeatherByCoords(40.7128, -74.0060);
      
      expect(patternHandler).toHaveBeenCalledTimes(3);
      
      const operations = patternHandler.mock.calls.map(call => {
        const weatherEvent = call[0] as WeatherEvent;
        return weatherEvent.operation;
      });
      expect(operations).toEqual(['getCurrentWeather', 'getForecast', 'getWeatherByCoords']);
    });

    it('should support both specific and wildcard handlers simultaneously', async () => {
      const wildcardHandler = vi.fn();
      const specificHandler = vi.fn();
      const patternHandler = vi.fn();
      
      weather.on('*', wildcardHandler);
      weather.on('weather.current', specificHandler);
      weather.on('weather.*', patternHandler);
      
      await weather.getCurrentWeather('Paris');
      
      // All three handlers should have been called for weather.current
      expect(wildcardHandler).toHaveBeenCalledOnce();
      expect(specificHandler).toHaveBeenCalledOnce();
      expect(patternHandler).toHaveBeenCalledOnce();
      
      // All should have received the same event
      const wildcardEvent = wildcardHandler.mock.calls[0][0];
      const specificEvent = specificHandler.mock.calls[0][0];
      const patternEvent = patternHandler.mock.calls[0][0];
      
      expect(wildcardEvent.type).toBe('weather.current');
      expect(specificEvent.type).toBe('weather.current');
      expect(patternEvent.type).toBe('weather.current');
    });

    it('should allow filtering events in wildcard handlers', async () => {
      const events: any[] = [];
      
      weather.on('*', (event) => {
        const weatherEvent = event as WeatherEvent;
        events.push({
          type: weatherEvent.type,
          operation: weatherEvent.operation,
          hasError: !!weatherEvent.error
        });
      });
      
      await weather.getCurrentWeather('Berlin');
      await weather.getForecast(52.5200, 13.4050);
      
      expect(events).toHaveLength(2);
      expect(events[0]).toEqual({
        type: 'weather.current',
        operation: 'getCurrentWeather',
        hasError: false
      });
      expect(events[1]).toEqual({
        type: 'weather.forecast',
        operation: 'getForecast',
        hasError: false
      });
    });

    it('should not interfere with exact type matching', async () => {
      const exactHandler = vi.fn();
      const wildcardHandler = vi.fn();
      
      weather.on('weather.current', exactHandler);
      weather.on('*', wildcardHandler);
      
      await weather.getCurrentWeather('Madrid');
      await weather.getForecast(40.4168, -3.7038);
      
      // Exact handler should only get weather.current
      expect(exactHandler).toHaveBeenCalledOnce();
      expect(exactHandler.mock.calls[0][0].type).toBe('weather.current');
      
      // Wildcard handler should get both
      expect(wildcardHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe('Advanced Pattern Matching', () => {
    it('should handle complex event stream observation', async () => {
      const eventLog: string[] = [];
      
      // Observer for all weather events
      weather.on('weather.*', (event) => {
        const weatherEvent = event as WeatherEvent;
        eventLog.push(`${weatherEvent.operation}:${weatherEvent.type}`);
      });
      
      // Observer for specific operations
      weather.on('*', (event) => {
        const weatherEvent = event as WeatherEvent;
        if (weatherEvent.operation === 'getCurrentWeather') {
          eventLog.push(`current-only:${weatherEvent.type}`);
        }
      });
      
      await weather.getCurrentWeather('Rome');
      await weather.getWeatherByCoords(41.9028, 12.4964);
      
      expect(eventLog).toEqual([
        'current-only:weather.current',
        'getCurrentWeather:weather.current',
        'getWeatherByCoords:weather.coords'
      ]);
    });
  });
});

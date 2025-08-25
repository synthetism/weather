/**
 * Weather Unit Events Tests
 * 
 * Test suite for event emission in weather operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Weather } from '../src/weather.unit.js';
import type { IWeather, WeatherData, ForecastData } from '../src/types.js';

// Mock provider for testing events
class MockEventProvider implements IWeather {
  async getCurrentWeather(location: string) {
    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate delay
    return {
      location,
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

  async getForecast(lat: number, lon: number) {
    await new Promise(resolve => setTimeout(resolve, 15)); // Simulate delay
    return {
      location: `${lat},${lon}`,
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

  async getWeatherByCoords(lat: number, lon: number) {
    await new Promise(resolve => setTimeout(resolve, 12)); // Simulate delay
    return {
      location: `${lat},${lon}`,
      country: 'TC',
      temperature: 18,
      feelsLike: 20,
      humidity: 65,
      pressure: 1015,
      description: 'Partly cloudy',
      icon: '02d',
      windSpeed: 3,
      windDirection: 180,
      visibility: 8000,
      units: 'metric',
      timestamp: new Date()
    };
  }

  async validateConnection() {
    return true;
  }
}

// Error provider for testing error events
class ErrorProvider implements IWeather {
  async getCurrentWeather(location: string): Promise<WeatherData> {
    throw new Error('API key invalid');
  }

  async getForecast(lat: number, lon: number, units?: 'metric' | 'imperial' | 'kelvin'): Promise<ForecastData> {
    throw new Error('Rate limit exceeded');
  }

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    throw new Error('Location not found');
  }

  async validateConnection() {
    return false;
  }
}

describe('Weather Unit Events', () => {
  let weather: Weather;
  let errorWeather: Weather;
  
  beforeEach(() => {
    weather = Weather.create({
      provider: new MockEventProvider(),
      defaultUnits: 'metric'
    });
    
    errorWeather = Weather.create({
      provider: new ErrorProvider(),
      defaultUnits: 'metric'
    });
  });

  describe('getCurrentWeather Events', () => {
    it('should emit weather.current event on request', async () => {
      const handler = vi.fn();
      weather.on('weather.current', handler);
      
      await weather.getCurrentWeather({ location: 'Tokyo' });
      
      expect(handler).toHaveBeenCalledOnce();
      const event = handler.mock.calls[0][0];
      expect(event.type).toBe('weather.current');
      expect(event.unitId).toBe('weather');
      expect(event.operation).toBe('getCurrentWeather');
      expect(event.data.location).toBe('Tokyo');
      expect(event.data.units).toBe('metric');
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should emit weather.current event on error', async () => {
      const handler = vi.fn();
      errorWeather.on('weather.current', handler);
      
      try {
        await errorWeather.getCurrentWeather({ location: 'London' });
      } catch (error) {
        // Expected to throw
      }
      
      expect(handler).toHaveBeenCalledOnce();
      const event = handler.mock.calls[0][0];
      expect(event.type).toBe('weather.current');
      expect(event.unitId).toBe('weather');
      expect(event.operation).toBe('getCurrentWeather');
      expect(event.data.location).toBe('London');
      expect(event.data.units).toBe('metric');
      expect(typeof event.data.duration).toBe('number');
      expect(event.error.message).toBe('API key invalid');
    });
  });

  describe('getForecast Events', () => {
    it('should emit weather.forecast event on request', async () => {
      const handler = vi.fn();
      weather.on('weather.forecast', handler);
      
      await weather.getForecast({ latitude: 35.6762, longitude: 139.6503 });
      
      expect(handler).toHaveBeenCalledOnce();
      const event = handler.mock.calls[0][0];
      expect(event.type).toBe('weather.forecast');
      expect(event.unitId).toBe('weather');
      expect(event.operation).toBe('getForecast');
      expect(event.data.latitude).toBe(35.6762);
      expect(event.data.longitude).toBe(139.6503);
      expect(event.data.units).toBe('metric');
    });

    it('should emit weather.forecast event on error', async () => {
      const handler = vi.fn();
      errorWeather.on('weather.forecast', handler);
      
      try {
        await errorWeather.getForecast({ latitude: 40.7128, longitude: -74.0060 });
      } catch (error) {
        // Expected to throw
      }
      
      expect(handler).toHaveBeenCalledOnce();
      const event = handler.mock.calls[0][0];
      expect(event.type).toBe('weather.forecast');
      expect(event.error.message).toBe('Rate limit exceeded');
    });
  });

  describe('getWeatherByCoords Events', () => {
    it('should emit weather.coords event on request', async () => {
      const handler = vi.fn();
      weather.on('weather.coords', handler);
      
      await weather.getWeatherByCoords({ latitude: 48.8566, longitude: 2.3522 });
      
      expect(handler).toHaveBeenCalledOnce();
      const event = handler.mock.calls[0][0];
      expect(event.type).toBe('weather.coords');
      expect(event.unitId).toBe('weather');
      expect(event.operation).toBe('getWeatherByCoords');
      expect(event.data.latitude).toBe(48.8566);
      expect(event.data.longitude).toBe(2.3522);
    });

    it('should emit weather.coords event on error', async () => {
      const handler = vi.fn();
      errorWeather.on('weather.coords', handler);
      
      try {
        await errorWeather.getWeatherByCoords({ latitude: 0, longitude: 0 });
      } catch (error) {
        // Expected to throw
      }
      
      expect(handler).toHaveBeenCalledOnce();
      const event = handler.mock.calls[0][0];
      expect(event.type).toBe('weather.coords');
      expect(event.error.message).toBe('Location not found');
    });
  });

  describe('Event Cleanup', () => {
    it('should support event unsubscription', async () => {
      const handler = vi.fn();
      const unsubscribe = weather.on('weather.current', handler);
      
      // Unsubscribe immediately
      unsubscribe();
      
      await weather.getCurrentWeather({ location: 'Test' });
      
      // Handler should not have been called
      expect(handler).not.toHaveBeenCalled();
    });

    it('should support once() for single event handling', async () => {
      const handler = vi.fn();
      weather.once('weather.current', handler);
      
      // Make two requests
      await weather.getCurrentWeather({ location: 'Test1' });
      await weather.getCurrentWeather({ location: 'Test2' });
      
      // Handler should only be called once
      expect(handler).toHaveBeenCalledOnce();
    });

    it('should support off() to remove all handlers for event type', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      weather.on('weather.current', handler1);
      weather.on('weather.current', handler2);
      
      // Remove all handlers for this event type
      weather.off('weather.current');
      
      await weather.getCurrentWeather({ location: 'Test' });
      
      // No handlers should be called
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Event Data Integrity', () => {
    it('should include all required fields in event data', async () => {
      const handler = vi.fn();
      weather.on('weather.current', handler);
      
      await weather.getCurrentWeather({ location: 'Berlin', units: 'imperial' });
      
      const event = handler.mock.calls[0][0];
      
      // Check all required event fields
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('timestamp');
      expect(event).toHaveProperty('unitId');
      expect(event).toHaveProperty('operation');
      expect(event).toHaveProperty('data');
      
      // Check data content
      expect(event.data.location).toBe('Berlin');
      expect(event.data.units).toBe('imperial');
      expect(typeof event.data.duration).toBe('number');
    });

    it('should preserve custom units in events', async () => {
      const handler = vi.fn();
      weather.on('weather.forecast', handler);
      
      await weather.getForecast({ latitude: 35.6762, longitude: 139.6503, units: 'kelvin' });
      
      const event = handler.mock.calls[0][0];
      expect(event.data.units).toBe('kelvin');
    });

    it('should use default units when not specified', async () => {
      const handler = vi.fn();
      weather.on('weather.coords', handler);
      
      await weather.getWeatherByCoords({ latitude: 48.8566, longitude: 2.3522 });
      
      const event = handler.mock.calls[0][0];
      expect(event.data.units).toBe('metric'); // Default from weather unit
    });
  });
});

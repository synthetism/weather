/**
 * WEATHER UNIT - AI-Ready Weather Information Provider
 * 
 * Weather data integration for AI systems using Unit Architecture.
 * Provides seamless weather capabilities through configurable providers.
 * 
 * @example
 * ```typescript
 * import { OpenWeather2, Weather } from '@synet/weather';
 * 
 * const provider = new OpenWeather2({ apiKey: "your-api-key" });
 * const weather = Weather.create({ provider });
 * 
 * // AI learns weather capabilities
 * ai.learn([weather.teach()]);
 * 
 * // AI can now access weather information
 * const result = await ai.call("What's the weather in Tokyo?", { useTools: true });
 * ```
 */

import { 
  Unit, 
  createUnitSchema,
  type UnitProps,
  type TeachingContract,
  type UnitCore,
  type Capabilities,
  type Schema,
  type Validator,
  type Event
} from '@synet/unit';
import { 
  Capabilities as CapabilitiesClass, 
  Schema as SchemaClass, 
  Validator as ValidatorClass 
} from '@synet/unit';
import type { 
  IWeather, 
  WeatherData, 
  ForecastData, 
  LocationResult, 
  WeatherConfig 
} from './types.js';

// =============================================================================
// WEATHER EVENT INTERFACES
// =============================================================================

export interface WeatherEvent extends Event {
  type: 'weather.current' | 'weather.forecast' | 'weather.coords';
  unitId: string;
  operation: string;
  data: Record<string, unknown>;
}

// =============================================================================
// WEATHER UNIT INTERFACES
// =============================================================================

export interface WeatherProps extends UnitProps {
  provider: IWeather;
  defaultUnits: 'metric' | 'imperial' | 'kelvin';
}

// =============================================================================
// WEATHER UNIT IMPLEMENTATION
// =============================================================================

export const VERSION = '1.0.5';
/**
 * Weather Unit - AI-Ready Weather Information Provider
 * 
 * Integrates weather data providers with Unit Architecture for seamless
 * AI system integration. Supports multiple weather providers through
 * universal IWeather interface.
 */
export class Weather extends Unit<WeatherProps> {
  protected constructor(props: WeatherProps) {
    super(props);
  }

  /**
   * Build consciousness trinity - creates living instances once
   */
  protected build(): UnitCore {
    const capabilities = CapabilitiesClass.create(this.dna.id, {
      getCurrentWeather: (...args: unknown[]) => {
        const params = args[0] as { location: string; units?: 'metric' | 'imperial' | 'kelvin' };
        return this.getCurrentWeather(params);
      },
      getForecast: (...args: unknown[]) => {
        const params = args[0] as { latitude: number; longitude: number; units?: 'metric' | 'imperial' | 'kelvin' };
        return this.getForecast(params);
      },
      getWeatherByCoords: (...args: unknown[]) => {
        const params = args[0] as { latitude: number; longitude: number; units?: 'metric' | 'imperial' | 'kelvin' };
        return this.getWeatherByCoords(params);
      }
    });

    const schema = SchemaClass.create(this.dna.id, {
      getCurrentWeather: {
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
        },
        response: { 
          type: 'object', 
          properties: { 
            location: { type: 'string', description: 'Location name' }, 
            temperature: { type: 'number', description: 'Temperature value' },
            humidity: { type: 'number', description: 'Humidity percentage' },
            description: { type: 'string', description: 'Weather description' }
          } 
        }
      },
      getForecast: {
        name: 'getForecast',
        description: 'Get weather forecast for multiple days using coordinates',
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
            },
            units: {
              type: 'string',
              description: 'Temperature units to use',
              enum: ['metric', 'imperial', 'kelvin']
            }
          },
          required: ['latitude', 'longitude']
        },
        response: { 
          type: 'object', 
          properties: { 
            location: { type: 'string', description: 'Location name' }, 
            forecasts: { type: 'array', description: 'Array of forecast data' } 
          } 
        }
      },
      getWeatherByCoords: {
        name: 'getWeatherByCoords',
        description: 'Get current weather by geographic coordinates',
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
            },
            units: {
              type: 'string',
              description: 'Temperature units to use',
              enum: ['metric', 'imperial', 'kelvin']
            }
          },
          required: ['latitude', 'longitude']
        },
        response: { 
          type: 'object', 
          properties: { 
            location: { type: 'string', description: 'Location name' }, 
            temperature: { type: 'number', description: 'Temperature value' } 
          } 
        }
      },     
    });

    const validator = ValidatorClass.create({
      unitId: this.dna.id,
      capabilities,
      schema,
      strictMode: false
    });

    return { capabilities, schema, validator };
  }

  /**
   * Get capabilities consciousness - returns living instance
   */
  capabilities(): Capabilities {
    return this._unit.capabilities;
  }

  /**
   * Get schema consciousness - returns living instance  
   */
  schema(): Schema {
    return this._unit.schema;
  }

  /**
   * Get validator consciousness - returns living instance
   */
  validator(): Validator {
    return this._unit.validator;
  }

  static create(config: WeatherConfig): Weather {
    if (!config.provider) {
      throw new Error('[Weather] Provider is required');
    }

    const props: WeatherProps = {
      dna: createUnitSchema({
        id: 'weather',
        version: VERSION
      }),
      created: new Date(),
      metadata: config.metadata || {},
      provider: config.provider,
      defaultUnits: config.defaultUnits || 'metric'
    };

    return new Weather(props);
  }

  whoami(): string {
    return `🌤️ Weather Unit - AI-ready weather information provider (${this.dna.id})`;
  }

  help(): void {
    console.log(`
🌤️ Weather Unit - AI-Ready Weather Information Provider

Native Capabilities:
• getCurrentWeather({ location, units? }) - Get current weather for a location
• getForecast({ latitude, longitude, units? }) - Get weather forecast using coordinates
• getWeatherByCoords({ latitude, longitude, units? }) - Get weather by coordinates

Configuration:
• Provider: ${this.props.provider.constructor.name}
• Default Units: ${this.props.defaultUnits}

Usage Examples:
  await weather.getCurrentWeather({ location: "Tokyo" });
  await weather.getForecast({ latitude: 35.6762, longitude: 139.6503 });
  await weather.getWeatherByCoords({ latitude: 35.6762, longitude: 139.6503 });
  await weather.searchLocation("French Riviera");
  
AI Integration:
  ai.learn([weather.teach()]);
  const result = await ai.call("What's the weather in Paris?", { useTools: true });
  
Provider Integration:
  const provider = new OpenWeather2({ apiKey: "your-key" });
  const weather = Weather.create({ provider });

Events:
  
 interface WeatherEvent  {
  type: 'weather.current' | 'weather.forecast' | 'weather.coords';
  unitId: string;
  operation: string;
  data: Record<string, unknown>;
 }

`);
  }

  teach(): TeachingContract {
    return {
      unitId: this.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }

  // =============================================================================
  // WEATHER OPERATIONS (Delegate to Provider with Event Consciousness)
  // =============================================================================

  /**
   * Get current weather for a location
   */
  async getCurrentWeather(params: { location: string; units?: 'metric' | 'imperial' | 'kelvin' }): Promise<WeatherData> {
    const { location, units } = params;
    const startTime = Date.now();
    const actualUnits = units || this.props.defaultUnits;
    
    try {
      const result = await this.props.provider.getCurrentWeather(location, actualUnits);
      const duration = Date.now() - startTime;

      // Emit success event with result
      this.emit({
        type: 'weather.current',
        timestamp: new Date(),
        unitId: this.dna.id,
        operation: 'getCurrentWeather',
        data: { 
          location, 
          units: actualUnits, 
          duration,
          temperature: result.temperature,
          humidity: result.humidity,
          pressure: result.pressure,
          description: result.description,
          icon: result.icon,
          windSpeed: result.windSpeed,
          windDirection: result.windDirection,
          visibility: result.visibility
        }
      } as WeatherEvent);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Emit error event
      this.emit({
        type: 'weather.current',
        timestamp: new Date(),
        unitId: this.dna.id,
        operation: 'getCurrentWeather',
        data: { location, units: actualUnits, duration },
        error: {
          message: error instanceof Error ? error.message : String(error)
        }
      } as WeatherEvent);

      throw error;
    }
  }

  /**
   * Get weather forecast for coordinates
   */
  async getForecast(params: { latitude: number; longitude: number; units?: 'metric' | 'imperial' | 'kelvin' }): Promise<ForecastData> {
    const { latitude, longitude, units } = params;
    const startTime = Date.now();
    const actualUnits = units || this.props.defaultUnits;
    
    try {
      const result = await this.props.provider.getForecast(latitude, longitude, actualUnits);
      const duration = Date.now() - startTime;

      // Emit success event with result
      this.emit({
        type: 'weather.forecast',
        timestamp: new Date(),
        unitId: this.dna.id,
        operation: 'getForecast',
        data: { 
          latitude, 
          longitude, 
          units: actualUnits, 
          location: result.location,
          country: result.country,
          forecastCount: result.forecasts.length
        }
      } as WeatherEvent);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Emit error event
      this.emit({
        type: 'weather.forecast',
        timestamp: new Date(),
        unitId: this.dna.id,
        operation: 'getForecast',
        data: { latitude, longitude, units: actualUnits, duration },
        error: {
          message: error instanceof Error ? error.message : String(error)
        }
      } as WeatherEvent);

      throw error;
    }
  }

  /**
   * Get weather by coordinates
   */
  async getWeatherByCoords(params: { latitude: number; longitude: number; units?: 'metric' | 'imperial' | 'kelvin' }): Promise<WeatherData> {
    const { latitude, longitude, units } = params;
    const startTime = Date.now();
    const actualUnits = units || this.props.defaultUnits;
    
    try {
      // Emit request event
  
      const result = await this.props.provider.getWeatherByCoords(latitude, longitude, actualUnits);
      const duration = Date.now() - startTime;

      // Emit success event
      this.emit({
        type: 'weather.coords',
        timestamp: new Date(),
        unitId: this.dna.id,
        operation: 'getWeatherByCoords',
        data: { 
          latitude, 
          longitude, 
          units: actualUnits, 
          duration,
          temperature: result.temperature,
          humidity: result.humidity,
          pressure: result.pressure,
          description: result.description,
          icon: result.icon,
          windSpeed: result.windSpeed,
          windDirection: result.windDirection,
          visibility: result.visibility
        }
      } as WeatherEvent);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Emit error event
      this.emit({
        type: 'weather.coords',
        timestamp: new Date(),
        unitId: this.dna.id,
        operation: 'getWeatherByCoords',
        data: { latitude, longitude, units: actualUnits, duration },
        error: {
          message: error instanceof Error ? error.message : String(error)
        }
      } as WeatherEvent);

      throw error;
    }
  }

  /**
   * Validate provider connection
   */
  async validateConnection(): Promise<boolean> {
    return this.props.provider.validateConnection();
  }
}


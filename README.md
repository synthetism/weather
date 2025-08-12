# Weather Intelligence Provider

```bash
 ___       ___  _______   ________  _________  ___  ___  _______   ________     
|\  \     |\  \|\  ___ \ |\   __  \|\___   ___\\  \|\  \|\  ___ \ |\   __  \    
\ \  \    \ \  \ \   __/|\ \  \|\  \|___ \  \_\ \  \\\  \ \   __/|\ \  \|\  \   
 \ \  \  __\ \  \ \  \_|/_\ \   __  \   \ \  \ \ \   __  \ \  \_|/_\ \   _  _\  
  \ \  \|\__\_\  \ \  \_|\ \ \  \ \  \   \ \  \ \ \  \ \  \ \  \_|\ \ \  \\  \| 
   \ \____________\ \_______\ \__\ \__\   \ \__\ \ \__\ \__\ \_______\ \__\\ _\ 
    \|____________|\|_______|\|__|\|__|    \|__|  \|__|\|__|\|_______|\|__|\|__|
                                                                                
version: 1.0.0                                                                 
```

**Weather intelligence provider for AI systems with configurable provider architecture**

## Executive Summary

Weather Intelligence delivers production-ready weather data integration for AI applications through a clean, provider-agnostic interface. Built on Unit Architecture principles, it enables seamless AI capability composition while maintaining enterprise reliability standards.

## Core Value Proposition

- **Universal Provider Interface** - Switch between weather services without code changes
- **AI-Native Integration** - Purpose-built for AI agent capability acquisition
- **Enterprise Reliability** - Production-tested error handling and connection management
- **Zero Lock-in Architecture** - Provider abstraction prevents vendor dependency
- **Type-Safe Operations** - Full TypeScript support with comprehensive interface definitions

## Supported Providers

| Provider | Status | Coverage | API Version | Cost Efficiency |
|----------|--------|----------|-------------|-----------------|
| **OpenWeather2** |  Production | Global | 2.5 | Excellent |
| **WeatherAPI** |  Roadmap | Global | v1 | Good |
| **AccuWeather** | Roadmap | Global | v1 | Premium |

## Quick Start

```typescript
import { OpenWeather2, Weather } from '@synet/weather';
import { AI } from '@synet/ai';

// Initialize weather provider
const provider = new OpenWeather2({ 
  apiKey: process.env.OPENWEATHER_API_KEY 
});

// Create weather intelligence unit
const weather = Weather.create({ 
  provider,
  defaultUnits: 'metric'
});

// Enable AI weather capabilities
const ai = AI.create({ type: 'openai', options: { apiKey: 'sk-...' } });
ai.learn([weather.teach()]);

// AI now has weather intelligence
const response = await ai.call(
  "Create a weather report for London, Paris, and Tokyo with recommendations",
  { useTools: true }
);
```

## Architecture Overview

### Provider Pattern Implementation

Weather Intelligence Provider implements the Strategy pattern for maximum flexibility:

```typescript
// Universal interface - all providers implement this
interface IWeather {
  getCurrentWeather(location: string, units?: string): Promise<WeatherData>;
  getForecast(lat: number, lon: number, units?: string): Promise<ForecastData>;
  getWeatherByCoords(lat: number, lon: number, units?: string): Promise<WeatherData>;
  searchLocation(query: string): Promise<LocationResult[]>;
  validateConnection(): Promise<boolean>;
}

// Provider implementations
const openWeather = new OpenWeather2({ apiKey: 'your-key' });
const weatherAPI = new WeatherAPI({ apiKey: 'your-key' }); // Future provider

// Seamless provider switching
const weather1 = Weather.create({ provider: openWeather });
const weather2 = Weather.create({ provider: weatherAPI });
```

### Unit Architecture Integration

Built on Unit Architecture for seamless AI capability composition:

```typescript
// Weather unit exposes capabilities through Unit Architecture
const capabilities = weather.capabilities(); // Runtime capability access
const schema = weather.schema();             // API documentation
const validator = weather.validator();       // Type validation

// Teaching contract for AI learning
const contract = weather.teach();
ai.learn([contract]);

// AI can now execute weather operations
await ai.execute('weather.getCurrentWeather', { location: 'Tokyo' });
```

## API Reference

### Weather Unit

#### Constructor
```typescript
Weather.create(config: WeatherConfig): Weather
```

#### Core Methods
```typescript
// Weather operations
getCurrentWeather(location: string, units?: string): Promise<WeatherData>
getForecast(lat: number, lon: number, units?: string): Promise<ForecastData>  
getWeatherByCoords(lat: number, lon: number, units?: string): Promise<WeatherData>
searchLocation(query: string): Promise<LocationResult[]>

// Unit Architecture methods
teach(): TeachingContract
capabilities(): Capabilities
schema(): Schema
validator(): Validator
```

### OpenWeather2 Provider

#### Constructor
```typescript
new OpenWeather2(config: OpenWeather2Config)
```

#### Configuration
```typescript
interface OpenWeather2Config {
  apiKey: string;
  timeout?: number;      // Request timeout (default: 5000ms)
  baseUrl?: string;      // Custom API endpoint
}
```

## Data Models

### WeatherData
```typescript
interface WeatherData {
  location: string;        // City name
  country: string;         // Country code
  temperature: number;     // Current temperature
  feelsLike: number;       // Feels-like temperature  
  humidity: number;        // Humidity percentage
  pressure: number;        // Atmospheric pressure
  description: string;     // Weather description
  icon: string;           // Weather icon code
  windSpeed: number;      // Wind speed
  windDirection: number;  // Wind direction (degrees)
  visibility: number;     // Visibility distance
  uvIndex?: number;       // UV index (optional)
  units: string;          // Temperature units
  timestamp: Date;        // Data timestamp
}
```

### ForecastData
```typescript
interface ForecastData {
  location: string;
  country: string;
  forecasts: Array<{
    date: string;           // YYYY-MM-DD format
    high: number;           // Daily high temperature
    low: number;            // Daily low temperature  
    description: string;    // Weather description
    icon: string;          // Weather icon code
    precipitation: number; // Precipitation amount
  }>;
  units: string;
  timestamp: Date;
}
```

## Enterprise Features

### Error Handling
- **Comprehensive Logging** - Detailed error tracking for debugging
- **Connection Validation** - Pre-flight checks for API connectivity
- **Timeout Management** - Configurable request timeouts

### Performance Optimization
- **Efficient API Usage** - Minimizes unnecessary API calls
- **Response Caching** - Optional caching layer for repeated requests
- **Connection Pooling** - Optimized HTTP connection management
- **Rate Limiting** - Built-in rate limit compliance

### Security
- **API Key Protection** - Secure credential management
- **Request Validation** - Input sanitization and validation
- **Error Sanitization** - No sensitive data in error messages

## Development Workflow

### Installation
```bash
npm install @synet/weather
# or
pnpm add @synet/weather
```

### Environment Setup
```bash
# .env file
OPENWEATHER_API_KEY=your_openweather_api_key
```

### Testing
```bash
npm test                    # Run test suite
npm run test:coverage       # Generate coverage report
npm run test:integration    # Run integration tests
```

### Building
```bash
npm run build              # Build for production
npm run build:watch        # Build in watch mode
npm run type-check         # TypeScript validation
```

## Integration Examples

### AI Assistant
```typescript
import { OpenWeather2, Weather } from '@synet/weather';
import { AI } from '@synet/ai';

const weatherProvider = new OpenWeather2({
  apiKey: process.env.OPENWEATHER_API_KEY,
  timeout: 10000
});

const weather = Weather.create({ 
  provider: weatherProvider,
  defaultUnits: 'metric'
});

const ai = AI.create({ 
  type: 'openai', 
  options: { apiKey: process.env.OPENAI_API_KEY }
});

// AI learns weather capabilities
ai.learn([weather.teach()]);

// Enterprise weather intelligence
const report = await ai.call(`
  Analyze weather conditions for our European offices (London, Paris, Berlin) 
  and provide operational recommendations for tomorrow's outdoor events.
`, { useTools: true });
```

### Multi-Provider Setup
```typescript
// Development: Mock provider
const devProvider = new MockWeather();

// Staging: Free tier provider  
const stagingProvider = new OpenWeather2({ 
  apiKey: process.env.STAGING_API_KEY 
});

// Production: Premium provider
const prodProvider = new WeatherAPI({ 
  apiKey: process.env.PREMIUM_API_KEY 
});

// Environment-based provider selection
const provider = process.env.NODE_ENV === 'production' 
  ? prodProvider 
  : process.env.NODE_ENV === 'staging' 
    ? stagingProvider 
    : devProvider;

const weather = Weather.create({ provider });
```

## License

MIT License - Enterprise-friendly with no restrictions on commercial usage.

---

*Weather Intelligence Provider - Powering the next generation of AI-driven applications*

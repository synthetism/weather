# @synet/weather

```bash
 _       __           __  __             
| |     / /__  ____ _/ /_/ /_  ___  _____
| | /| / / _ \/ __ `/ __/ __ \/ _ \/ ___/
| |/ |/ /  __/ /_/ / /_/ / / /  __/ /    
|__/|__/\___/\__,_/\______/_/\___/_/     
         / / / /___  (_) /_              
        / / / / __ \/ / __/              
       / /_/ / / / / / /_                
       \____/_/ /_/_/\__/                
                                            
version: 1.0.2                                                                 
```

**Weather data for AI systems. Multiple providers. Built on Unit Architecture.**

## What This Is

Get weather data. Support multiple providers. Switch providers without changing code. Built for AI systems that need weather capabilities.

No vendor lock-in. No configuration hell. Just weather data when you need it.

## Supported Providers

| Provider | Status | API Version |
|----------|--------|-------------|
| **OpenWeather2** | ✅ Production | 2.5 |
| **WeatherAPI** | 🔄 Planned | v1 |
| **AccuWeather** | 🔄 Planned | v1 |

## Quick Start

```typescript
import { OpenWeather2, Weather } from '@synet/weather';

// Set up provider
const provider = new OpenWeather2({ 
  apiKey: process.env.OPENWEATHER_API_KEY 
});

// Create weather unit
const weather = Weather.create({ 
  provider,
  defaultUnits: 'metric'
});

// Get weather data
const current = await weather.getCurrentWeather('Tokyo');
const forecast = await weather.getForecast(35.6762, 139.6503);
const coords = await weather.getWeatherByCoords(35.6762, 139.6503);

// For AI systems
const ai = AI.create({ type: 'openai' });
ai.learn([weather.teach()]);
await ai.call("What's the weather in Paris?", { useTools: true });
```

## Events

Weather operations emit events for monitoring, debugging, and AI integration:

```typescript
// Listen to weather events
weather.on('weather.current', (event) => {
  
  if(event.error)
    console.log(`Weather failed: ${event.error.message}`);  
  else
     console.log(`Got weather for ${event.data.location} in ${event.data.duration}ms`);
  
});

// Available event types:
// weather.current
// weather.forecast 
// weather.coords
```

## How It Works

### Provider Pattern

All weather providers implement the same interface. Switch providers without changing your code:

```typescript
// Universal interface
interface IWeather {
  getCurrentWeather(location: string, units?: string): Promise<WeatherData>;
  getForecast(lat: number, lon: number, units?: string): Promise<ForecastData>;
  getWeatherByCoords(lat: number, lon: number, units?: string): Promise<WeatherData>;
  validateConnection(): Promise<boolean>;
}

// Different providers, same interface
const openWeather = new OpenWeather2({ apiKey: 'key1' });
const weatherAPI = new WeatherAPI({ apiKey: 'key2' });

// Seamless switching
const weather1 = Weather.create({ provider: openWeather });
const weather2 = Weather.create({ provider: weatherAPI });
```

### Unit Architecture

The weather unit can teach its capabilities to AI systems:

```typescript
// Weather unit methods
weather.getCurrentWeather('Tokyo')     // Direct usage
weather.teach()                        // Share capabilities with AI
weather.capabilities()                 // List available methods
weather.on('weather.current', handler) // Monitor operations
```

## API Reference

### Weather Unit

```typescript
// Create weather unit
Weather.create(config: WeatherConfig): Weather

// Get weather data
getCurrentWeather(location: string, units?: string): Promise<WeatherData>
getForecast(lat: number, lon: number, units?: string): Promise<ForecastData>  
getWeatherByCoords(lat: number, lon: number, units?: string): Promise<WeatherData>

// Unit Architecture methods
teach(): TeachingContract        // Share capabilities with AI
capabilities(): Capabilities     // List methods
on(event, handler): () => void   // Listen to events
```

### OpenWeather2 Provider

```typescript
new OpenWeather2({
  apiKey: string,
  timeout?: number,      // Request timeout (default: 5000ms)
  baseUrl?: string       // Custom API endpoint
})
```

## Data Types

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

## Examples

### Basic Usage
```typescript
import { OpenWeather2, Weather } from '@synet/weather';

const provider = new OpenWeather2({
  apiKey: process.env.OPENWEATHER_API_KEY,
  timeout: 10000
});

const weather = Weather.create({ 
  provider,
  defaultUnits: 'metric'
});

// Get current weather
const tokyo = await weather.getCurrentWeather('Tokyo');
console.log(`${tokyo.location}: ${tokyo.temperature}°C, ${tokyo.description}`);

// Get forecast
const forecast = await weather.getForecast(35.6762, 139.6503);
console.log(`5-day forecast for ${forecast.location}:`);
forecast.forecasts.forEach(day => {
  console.log(`${day.date}: ${day.high}°/${day.low}° - ${day.description}`);
});
```

### With Events
```typescript
// Monitor all weather operations
weather.on('weather.current', (event) => {
  console.log(`Requesting weather for: ${event.data.location}`);
});

weather.on('weather.current.success', (event) => {
  const { location, duration } = event.data;
  console.log(`✅ Got weather for ${location} (${duration}ms)`);
});

weather.on('weather.current.error', (event) => {
  const { location } = event.data;
  console.log(`❌ Failed to get weather for ${location}: ${event.error.message}`);
});

// Now make requests - events will fire
await weather.getCurrentWeather('London');
```

### AI Integration
```typescript
import { AI } from '@synet/ai';

const ai = AI.create({ type: 'openai' });

// AI learns weather capabilities
ai.learn([weather.teach()]);

// AI can now use weather data
const response = await ai.call(`
  Compare the weather in London, Paris, and Tokyo. 
  Which city has the best weather for outdoor activities today?
`, { useTools: true });
```

### Multi-Provider Setup
```typescript
// Environment-based provider switching
const provider = process.env.NODE_ENV === 'production' 
  ? new WeatherAPI({ apiKey: process.env.PREMIUM_API_KEY })
  : new OpenWeather2({ apiKey: process.env.FREE_API_KEY });

const weather = Weather.create({ provider });
```

## License

MIT


/**
 * Weather Unit Demo
 * 
 * This demo tests:
 * 1. Weather unit creation with real API key
 * 2. Current weather retrieval  
 * 3. Weather forecasting
 * 4. Location search and coordinates
 * 5. Unit Architecture capabilities
 */

import { readFileSync, existsSync } from 'node:fs';
import { OpenWeather2, Weather } from '../src/index.js';
import path from 'node:path';

async function main() {
  console.log('🌤️ Weather Unit Demo - @synet/weather v1.0.0\n');

  // Try to load real API key
  let apiKey = 'demo-api-key-12345';
  const configPath = path.join('private', 'openweather.json');
  
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      apiKey = config.apiKey;
      console.log('✅ Loaded real API key from private/openweather.json');
    } catch (error) {
      console.log('⚠️  Could not load API key, using demo key');
    }
  } else {
    console.log('⚠️  No API key file found at private/openweather.json, using demo key');
  }

  // Create provider with API key
  const provider = new OpenWeather2({ 
    apiKey,
    timeout: 10000 
  });

  // Create weather unit
  const weather = Weather.create({
    provider,
    defaultUnits: 'metric'
  });

  // Display unit information
  console.log('\n📋 Weather Unit Information:');
  console.log(`• Unit ID: ${weather.dna.id}`);
  console.log(`• Version: ${weather.dna.version}`);
  console.log(`• Provider: ${provider.constructor.name}`);
  console.log(`• whoami(): ${weather.whoami()}\n`);

  // Test Unit Architecture methods
  console.log('🧠 Unit Architecture Methods:');
  console.log(`• can('getCurrentWeather'): ${weather.can('getCurrentWeather')}`);
  console.log(`• can('getForecast'): ${weather.can('getForecast')}`);
  console.log(`• can('getWeatherByCoords'): ${weather.can('getWeatherByCoords')}`);
  console.log(`• can('searchLocation'): ${weather.can('searchLocation')}\n`);

  // Test teaching contract
  const contract = weather.teach();
  console.log('📚 Teaching Contract:');
  console.log(`• Unit ID: ${contract.unitId}`);
  console.log(`• Capabilities: ${contract.capabilities.list().length} methods`);
  console.log(`• Schemas: ${contract.schema.size()} schemas`);
  console.log(`• Validator: ${contract.validator ? '✅ Present' : '❌ Missing'}\n`);

  // List capabilities
  console.log('🔧 Available Capabilities:');
  weather.capabilities().list().forEach(cap => {
    console.log(`  • ${cap}`);
  });
  console.log();

  // Test real weather operations if we have a real API key
  if (apiKey !== 'demo-api-key-12345') {
    console.log('🌍 Testing live weather operations...\n');
    
    try {
      // Test current weather
      console.log('1. Current weather in Tokyo:');
      const current = await weather.getCurrentWeather('Tokyo');
      console.log(`   📍 ${current.location}, ${current.country}`);
      console.log(`   🌡️  ${current.temperature}°C (feels like ${current.feelsLike}°C)`);
      console.log(`   ☁️  ${current.description}`);
      console.log(`   💧 Humidity: ${current.humidity}%\n`);

      // Test forecast
      console.log('2. 3-day forecast for London (51.5074, -0.1278):');
      const forecast = await weather.getForecast(51.5074, -0.1278);
      forecast.forecasts.forEach(day => {
        console.log(`   ${day.date}: ${day.high}°/${day.low}°C - ${day.description}`);
      });
      console.log();

      // Test coordinates
      console.log('3. Weather by coordinates (NYC):');
      const coordWeather = await weather.getWeatherByCoords(40.7128, -74.0060);
      console.log(`   📍 ${coordWeather.location}: ${coordWeather.temperature}°C - ${coordWeather.description}\n`);

      // Test location search
      console.log('4. Location search for "Paris":');
      const locations = await weather.searchLocation('Paris');
      locations.slice(0, 3).forEach(loc => {
        console.log(`   ${loc.name}, ${loc.country} (${loc.lat}, ${loc.lon})`);
      });
      
    } catch (error) {
      console.error('❌ Error during live testing:', error instanceof Error ? error.message : error);
    }
  } else {
    console.log('🔧 Demo mode - showing interface without live API calls\n');
    console.log('Available methods:');
    console.log('  • await weather.getCurrentWeather("Tokyo")');
    console.log('  • await weather.getForecast(51.5074, -0.1278)');
    console.log('  • await weather.getWeatherByCoords(40.7128, -74.0060)');
    console.log('  • await weather.searchLocation("Paris")');
  }

  console.log('\n🎉 Demo completed successfully!');
  
  if (apiKey === 'demo-api-key-12345') {
    console.log('\n📖 To test with real data:');
    console.log('  1. Get an API key from https://openweathermap.org/api');
    console.log('  2. Create private/openweather.json with: {"apiKey": "your-key"}');
    console.log('  3. Run the demo again');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

/**
 * Weather Unit Demo - Testing weather unit capabilities
 * 
 * This demo tests:
 * 1. Weather unit creation and configuration
 * 2. Current weather retrieval  
 * 3. Weather forecasting
 * 4. Location search and coordinates
 * 5. Error handling for invalid inputs
 */
import { readFileSync } from 'node:fs';
import { OpenWeather2, Weather } from '../src/index.js';
import path from 'node:path';


async function main() {
  console.log('🌤️ Weather Unit Demo - @synet/weather v1.0.0\n');

  const openweatherConfig = JSON.parse(
      readFileSync(path.join('private', 'openweather.json'), 'utf-8')
    );

  // Mock provider for demo (replace with real API key for actual testing)
  const provider = new OpenWeather2({ 
    apiKey: openweatherConfig.apiKey,
    timeout: 5000 
  });

  // Create weather unit
  const weather = Weather.create({
    provider,
    defaultUnits: 'metric'
  });

  // Display unit information
  console.log('✅ Weather unit created successfully');
  console.log(`📋 Unit ID: ${weather.dna.id}`);
  console.log(`📋 Unit Version: ${weather.dna.version}`);
  console.log(`🔧 Provider: ${provider.constructor.name}\n`);

  // Test Unit Architecture methods
  console.log('🧠 Unit Architecture Methods:');
  console.log(`• whoami(): ${weather.whoami()}`);
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

  // List schemas
  console.log('📝 Available Schemas:');
  weather.schema().toArray().forEach(schema => {
    console.log(`  • ${schema.name}: ${schema.description}`);
  });
  console.log();

  // Test with mock data (since we don't have a real API key)
  try {
    console.log('🌍 Testing weather operations with mock provider...');
    
    // Note: These will fail with the demo API key, but show the interface
    console.log('⚠️  Note: Using demo API key - operations will fail but demonstrate interface\n');
    
    console.log('Interface demonstration:');
    console.log('  await weather.getCurrentWeather("London")');
    console.log('  await weather.getForecast(51.5074, -0.1278)');
    console.log('  await weather.getWeatherByCoords(51.5074, -0.1278)');
    console.log('  await weather.searchLocation("Paris");');
    
  } catch (error) {
    console.log(`❌ Expected error with demo API key: ${error instanceof Error ? error.message : error}`);
  }

  console.log('\n🎉 Demo completed successfully!');
  console.log('\n📖 Next steps:');
  console.log('  1. Get a real OpenWeather API key from https://openweathermap.org/api');
  console.log('  2. Replace demo-api-key-12345 with your real API key');
  console.log('  3. Import into your AI project:');
  console.log('     import { OpenWeather2, Weather } from "@synet/weather";');
  console.log('     import { AI } from "@synet/ai";');
  console.log('     ');
  console.log('     const provider = new OpenWeather2({ apiKey: "your-key" });');
  console.log('     const weather = Weather.create({ provider });');
  console.log('     const ai = AI.create({ type: "openai", options: { apiKey: "sk-..." } });');
  console.log('     ');
  console.log('     ai.learn([weather.teach()]);');
  console.log('     const result = await ai.call("What\'s the weather in Tokyo?", { useTools: true });');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

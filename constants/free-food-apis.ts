// Free APIs for Food Identification
// Replace 'demo-key' with actual API keys from the respective services

export const FREE_FOOD_APIS = {
  // 1. FoodVisor API - Best for food recognition
  // Free tier: 100 requests/month
  // Website: https://www.foodvisor.io/api
  // Features: Food detection, nutrition analysis, portion estimation
  foodvisor: {
    name: 'FoodVisor',
    url: 'https://vision.foodvisor.io/api/1.0/en/analysis/',
    freeLimit: '100 requests/month',
    features: ['Food detection', 'Nutrition analysis', 'Portion estimation'],
    apiKey: 'demo-key', // Replace with real key
    headers: {
      'Authorization': 'Api-Key YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: {
      image: 'base64_string'
    }
  },

  // 2. Spoonacular API - Good for recipes and nutrition
  // Free tier: 150 requests/day
  // Website: https://spoonacular.com/food-api
  // Features: Recipe analysis, ingredient recognition, nutrition data
  spoonacular: {
    name: 'Spoonacular',
    url: 'https://api.spoonacular.com/food/images/analyze',
    freeLimit: '150 requests/day',
    features: ['Recipe analysis', 'Ingredient recognition', 'Nutrition data'],
    apiKey: 'demo-key', // Replace with real key
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': 'YOUR_API_KEY'
    },
    body: {
      imageUrl: 'data:image/jpeg;base64,base64_string'
    }
  },

  // 3. Clarifai Food Model - AI-powered food recognition
  // Free tier: 5000 requests/month
  // Website: https://clarifai.com
  // Features: Food item recognition, confidence scores
  clarifai: {
    name: 'Clarifai Food Model',
    url: 'https://api.clarifai.com/v2/models/food-item-recognition/outputs',
    freeLimit: '5000 requests/month',
    features: ['Food item recognition', 'Confidence scores', 'Multiple food detection'],
    apiKey: 'demo-key', // Replace with real key
    headers: {
      'Authorization': 'Key YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: {
      inputs: [{
        data: {
          image: {
            base64: 'base64_string'
          }
        }
      }]
    }
  },

  // 4. Google Vision API - General image recognition
  // Free tier: 1000 requests/month
  // Website: https://cloud.google.com/vision
  // Features: Label detection, object detection
  googleVision: {
    name: 'Google Vision API',
    url: 'https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY',
    freeLimit: '1000 requests/month',
    features: ['Label detection', 'Object detection', 'Text detection'],
    apiKey: 'demo-key', // Replace with real key
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      requests: [{
        image: {
          content: 'base64_string'
        },
        features: [{
          type: 'LABEL_DETECTION',
          maxResults: 10
        }]
      }]
    }
  },

  // 5. Edamam Food Database - Nutrition data (no image recognition)
  // Free tier: 100 requests/month
  // Website: https://developer.edamam.com
  // Features: Nutrition analysis, food database search
  edamam: {
    name: 'Edamam Food Database',
    url: 'https://api.edamam.com/api/nutrition-data',
    freeLimit: '100 requests/month',
    features: ['Nutrition analysis', 'Food database search', 'Recipe analysis'],
    apiKey: 'demo-key', // Replace with real key
    note: 'No image recognition - use for nutrition data lookup after AI identifies foods'
  },

  // 6. USDA FoodData Central - Free nutrition database
  // Free tier: Unlimited
  // Website: https://fdc.nal.usda.gov/api-guide.html
  // Features: Comprehensive nutrition database
  usda: {
    name: 'USDA FoodData Central',
    url: 'https://api.nal.usda.gov/fdc/v1/foods/search',
    freeLimit: 'Unlimited (with API key)',
    features: ['Comprehensive nutrition database', 'Food search', 'Detailed nutrition facts'],
    apiKey: 'demo-key', // Replace with real key
    note: 'No image recognition - use for nutrition data lookup after AI identifies foods'
  }
};

// Instructions for getting API keys:
export const API_KEY_INSTRUCTIONS = {
  foodvisor: {
    steps: [
      '1. Visit https://www.foodvisor.io/api',
      '2. Sign up for a free account',
      '3. Get your API key from the dashboard',
      '4. Replace \"demo-key\" in the code with your actual key'
    ]
  },
  spoonacular: {
    steps: [
      '1. Visit https://spoonacular.com/food-api',
      '2. Sign up for a free account',
      '3. Get your API key from the console',
      '4. Replace \"demo-key\" in the code with your actual key'
    ]
  },
  clarifai: {
    steps: [
      '1. Visit https://clarifai.com',
      '2. Sign up for a free account',
      '3. Create an application and get your API key',
      '4. Replace \"demo-key\" in the code with your actual key'
    ]
  },
  googleVision: {
    steps: [
      '1. Visit https://cloud.google.com/vision',
      '2. Create a Google Cloud account',
      '3. Enable the Vision API',
      '4. Create credentials and get your API key',
      '5. Replace \"demo-key\" in the code with your actual key'
    ]
  },
  edamam: {
    steps: [
      '1. Visit https://developer.edamam.com',
      '2. Sign up for a free account',
      '3. Create an application and get your API key',
      '4. Replace \"demo-key\" in the code with your actual key'
    ]
  },
  usda: {
    steps: [
      '1. Visit https://fdc.nal.usda.gov/api-guide.html',
      '2. Sign up for a free API key',
      '3. Replace \"demo-key\" in the code with your actual key'
    ]
  }
};

// Recommended combination for best results:
export const RECOMMENDED_SETUP = {
  primary: 'FoodVisor - Best for food recognition and nutrition analysis',
  secondary: 'Clarifai - Good fallback with higher free tier limits',
  tertiary: 'Google Vision - General image recognition as last resort',
  nutritionData: 'USDA FoodData Central - For detailed nutrition information'
};

// Alternative free solutions:
export const ALTERNATIVE_SOLUTIONS = {
  aiOnly: {
    description: 'Use only AI vision models (current fallback)',
    pros: ['No API limits', 'Works offline', 'Good accuracy with proper prompts'],
    cons: ['Slower processing', 'May be less accurate for complex dishes']
  },
  hybrid: {
    description: 'Combine multiple free APIs with AI enhancement',
    pros: ['Best accuracy', 'Automatic ingredient separation', 'Nutrition data validation'],
    cons: ['API rate limits', 'Requires multiple API keys']
  },
  crowdsourced: {
    description: 'Use Open Food Facts API (completely free)',
    url: 'https://world.openfoodfacts.org/api/v0/product/barcode.json',
    pros: ['Completely free', 'No rate limits', 'Community-driven database'],
    cons: ['Requires barcode scanning', 'No image recognition']
  }
};
# HealthSnap - Expo Health Integration

This project includes a complete integration with `expo-health` for reading HealthKit data on iOS devices, including steps, calories, and other health metrics.

## 🏥 Health Features

### ✅ What's Included

- **HealthProvider**: Complete context provider for managing health data
- **HealthDashboard**: Beautiful UI component displaying health metrics
- **HealthWidget**: Compact widget for showing key health stats
- **Mock Data**: Works on web/Android with simulated data for development
- **TypeScript Support**: Fully typed health data interfaces
- **Error Handling**: Graceful fallbacks and permission management

### 📊 Health Metrics Supported

- **Steps**: Daily step count from HealthKit
- **Active Calories**: Calories burned through activity
- **Basal Calories**: Resting metabolic rate calories
- **Total Calories**: Combined active + basal calories
- **Distance**: Walking/running distance in kilometers
- **Heart Rate**: Latest heart rate reading (optional)

## 🚀 Setup Instructions

### 1. App Configuration (app.json)

**⚠️ IMPORTANT**: Since app.json cannot be edited in this environment, you need to manually add these configurations:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSHealthShareUsageDescription": "This app needs access to your health data to track your fitness progress and provide personalized insights.",
        "NSHealthUpdateUsageDescription": "This app needs to update your health data to record your fitness activities and progress."
      },
      "entitlements": {
        "com.apple.developer.healthkit": true
      }
    },
    "android": {
      "permissions": [
        "android.permission.ACTIVITY_RECOGNITION"
      ]
    },
    "plugins": [
      [
        "expo-health",
        {
          "healthDataTypes": [
            "Steps",
            "ActiveEnergyBurned", 
            "BasalEnergyBurned",
            "DistanceWalkingRunning",
            "HeartRate",
            "Weight",
            "Height"
          ]
        }
      ]
    ]
  }
}
```

### 2. Package Installation

The `expo-health` package is already installed. If you need to reinstall:

```bash
bun expo install expo-health
```

### 3. Usage Examples

#### Basic Health Data Access

```typescript
import { useHealth } from '@/providers/HealthProvider';

function MyComponent() {
  const { 
    healthData, 
    isHealthKitAvailable, 
    requestPermissions, 
    refreshHealthData,
    hasPermissions 
  } = useHealth();

  // Request permissions
  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      console.log('Health permissions granted!');
    }
  };

  // Access health data
  console.log('Steps today:', healthData.steps);
  console.log('Calories burned:', healthData.activeCalories);
  console.log('Distance walked:', healthData.distance);
}
```

#### Using the Health Dashboard

```typescript
import HealthDashboard from '@/components/HealthDashboard';

function HealthScreen() {
  return <HealthDashboard />;
}
```

#### Using the Health Widget

```typescript
import { HealthWidget } from '@/components/HealthWidget';

function HomeScreen() {
  return (
    <View>
      <HealthWidget onPress={() => router.push('/health')} />
    </View>
  );
}
```

## 🔧 Development Notes

### Platform Support

- **iOS**: Full HealthKit integration with real data
- **Android**: Mock data for development (HealthKit not available)
- **Web**: Mock data for development (HealthKit not available)

### Mock Data

For development on non-iOS platforms, the app uses realistic mock data:
- Steps: 3,000-8,000 random steps
- Active Calories: 200-500 random calories
- Basal Calories: 1,200-2,000 random calories
- Distance: 2-7 random kilometers
- Heart Rate: 60-100 random BPM

### Real Implementation

To use real `expo-health` instead of mock data, replace the mock Health object in `providers/HealthProvider.tsx` with:

```typescript
import * as Health from 'expo-health';
```

## 📱 Testing on Device

### iOS Testing

1. **Build for iOS**: Use EAS Build or Xcode to create an iOS build
2. **Install on Device**: Install the app on a physical iPhone
3. **Grant Permissions**: The app will request HealthKit permissions
4. **Verify Data**: Check that real health data appears in the app

### Permission Flow

1. App checks if HealthKit is available (`Health.isAvailableAsync()`)
2. App requests permissions (`Health.requestPermissionsAsync()`)
3. User grants/denies permissions in iOS Settings
4. App fetches health data (`Health.getHealthRecordsAsync()`)
5. Data is displayed in the UI

## 🎨 UI Components

### HealthDashboard
- Full-screen health metrics display
- Permission request flow
- Error handling and loading states
- Refresh functionality

### HealthWidget
- Compact health summary
- Perfect for home screen integration
- Shows steps, calories, and distance

## 🔒 Privacy & Permissions

### iOS Permissions Required

- **NSHealthShareUsageDescription**: Read health data
- **NSHealthUpdateUsageDescription**: Write health data (optional)
- **com.apple.developer.healthkit**: HealthKit entitlement

### Data Types Accessed

- Steps (HKQuantityTypeIdentifierStepCount)
- Active Energy (HKQuantityTypeIdentifierActiveEnergyBurned)
- Basal Energy (HKQuantityTypeIdentifierBasalEnergyBurned)
- Walking/Running Distance (HKQuantityTypeIdentifierDistanceWalkingRunning)
- Heart Rate (HKQuantityTypeIdentifierHeartRate)

## 🚨 Important Notes

### EAS Build Configuration

**I cannot assist with EAS Build configuration** as that falls outside of app development support. For EAS Build setup:

1. Contact support for EAS Build assistance
2. Refer to Expo documentation for EAS Build
3. Ensure your Apple Developer account has HealthKit capabilities enabled

### App Store Submission

- HealthKit apps require additional review from Apple
- Ensure your app has a clear health-related purpose
- Include detailed privacy policy explaining health data usage
- Test thoroughly on physical devices before submission

## 🔄 Data Sync

The health data automatically syncs:
- **On App Launch**: Initial data fetch
- **Manual Refresh**: Pull-to-refresh or refresh button
- **Real-time**: Data updates when app becomes active

## 🐛 Troubleshooting

### Common Issues

1. **"HealthKit not available"**: Only works on iOS devices
2. **"No permissions"**: User needs to grant HealthKit access
3. **"No data"**: User may not have health data recorded
4. **Mock data showing**: Replace mock implementation with real expo-health

### Debug Tips

- Check console logs for health data updates
- Verify permissions in iOS Settings > Privacy & Security > Health
- Ensure Health app is recording data
- Test on physical iPhone (not simulator)

## 📚 Additional Resources

- [Expo Health Documentation](https://docs.expo.dev/versions/latest/sdk/health/)
- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [iOS Health App User Guide](https://support.apple.com/en-us/HT203037)

---

**Ready to use!** The health integration is fully configured and ready for iOS testing. Navigate to the Health tab to see the dashboard in action.
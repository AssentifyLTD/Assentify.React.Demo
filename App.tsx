/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Button, DeviceEventEmitter, Alert, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ActivityIndicator } from 'react-native';


/* Assentify Imports */
import { AssentifyProvider } from 'assentify-sdk-react-native';
import { Assentify, Language , ActiveLiveType , BackgroundType } from 'assentify-sdk-react-native';
import { type FlowCompletedModel } from 'assentify-sdk-react-native';


function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AssentifyProvider />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [isSdkInitialized, setIsSdkInitialized] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const requestCameraPermission = async () => {
    const cameraPermission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    try {
      const status = await check(cameraPermission);

      if (status === RESULTS.GRANTED) {
        console.log('Camera permission already granted');
       onInitialize(
         'QwWzzKOYLkDzCLJ9lENlgvRQ1kmkKDv76KbJ9sPfr9Joxwj2DUuzC7htaZP89RqzgB9i9lHc4IpYOA7g',
         '2937c91f-c905-434b-d13d-08dcc04755ec',
         'E4BDD59C3B69A3F89AE8C756FCD67EBC72A45F405B256B3C3BDD643BE282B195'
       );
      } else if (status === RESULTS.DENIED || status === RESULTS.BLOCKED) {
        const result = await request(cameraPermission);
        if (result === RESULTS.GRANTED) {
          console.log('Camera permission granted');
        onInitialize(
          'QwWzzKOYLkDzCLJ9lENlgvRQ1kmkKDv76KbJ9sPfr9Joxwj2DUuzC7htaZP89RqzgB9i9lHc4IpYOA7g',
          '2937c91f-c905-434b-d13d-08dcc04755ec',
          'E4BDD59C3B69A3F89AE8C756FCD67EBC72A45F405B256B3C3BDD643BE282B195'
        );
        } else {
          console.log('Camera permission denied');
          Alert.alert(
            'Permission Denied',
            'You need to grant camera permissions to use this feature.',
          );
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Initialize
  const onInitialize = (API_KEY: string, tenantIdentifier: string, instanceHash: string) => {
    setLoading(true)
    setIsSdkInitialized(false);
    Assentify.initialize(
      API_KEY,
      tenantIdentifier,
      instanceHash,
      false, // Active Perform Liveness Face
      '#32a852', // Custom Color
      false, // Enable Detect
      undefined, // androidMotionCardLimit
      undefined, // androidMotionPassportLimit
      undefined, // iOSMotionCardsLimit
      undefined, // iOSMotionFaceLimit
      undefined, // androidBrightnessHighThreshold
      undefined, // androidBrightnessLowThreshold
      undefined, // iOSBrightnessHighThreshold
      undefined, // iOSBrightnessLowThreshold
      ActiveLiveType.BLINK,// ActiveLiveType.Wink // activeLiveType
      1 , //Active Liveness Check Count
      2 ,// faceLivenessRetryCount
      1 ,// minRam
      2 ,// iOSMinRam
      6 , // minCPUCores
      '#a83236',// manualClickColor
      '#3a32a8',// countDownNumbersColor
    );
  };


   // Start Flow 
  const startFlow = () => {
    Assentify.startFlow(
                "https://i.postimg.cc/3xY0ybsp/icon-1-(1).png", // logoUrl
                "", // svgBackgroundImageUrl
                "#000000", // textColor
                "#000000", // secondaryTextColor
                "#F2F2F2", // backgroundCardColor
                "#833F89", // accentColor
                ["#FFFFFF"], // backgroundColors
                ["#833F89", "#C82B47"], // clickColors
                90.0, // angleDegreesBackgroundColors
                0.4, // holdUntilBackgroundColors
                0.0, // angleDegreesClickColors
                0.6, // holdUntilClickColors
                BackgroundType.Color, // backgroundType
                false, // clear
                "en", // language
                true, // enableNfc
                true, // enableQr
                { phoneNumber: "121212"} // blockLoaderCustomProperties
              );
  };


  useEffect(() => {
    // Initialize Callback 
    const assentifySdkInit = DeviceEventEmitter.addListener(
      'assentifySdkInit',
      (AppResult) => {
        if (AppResult.status === true) {
         setLoading(false)
          console.log("Templates : ",AppResult.templates);
          console.log("StepDefinitions : ",AppResult.stepDefinitions);
          setIsSdkInitialized(true);
        }
      }
    );
  
   // Flow  Callback 
     const onFlowCompleted = DeviceEventEmitter.addListener(
        'OnFlowCompleted',
        (result) => {
          const  model = result.dataModel as FlowCompletedModel[]
        model.forEach((item, index) => {
          console.log(`OnFlowCompleted StepData ${index}:`, item.stepData);
          console.log(`OnFlowCompleted SubmitRequestModel ${index}:`, item.submitRequestModel);
        });
        }
      );
  
   return () => {
      assentifySdkInit.remove();
      onFlowCompleted.remove();
    };
  }, []);

return (
  <View style={styles.container}>
    {isLoading === false ? (
      <>
       {isSdkInitialized === false && (
          <>
        <View style={styles.buttonWrapper}>
          <Button title="Initialize KYC Flow " onPress={requestCameraPermission} />
        </View>
            </>
        )}
        {isSdkInitialized && (
          <>
              <View style={styles.buttonWrapper}>
                <Button title="Flow 1" onPress={startFlow} />
              </View>
          </>
        )}
      </>
    ) : (
      <ActivityIndicator size="large" />
    )}
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // vertical center
    alignItems: 'center',     // horizontal center
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    marginVertical: 8,
    width: '80%',
  },
});

export default App;

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, useColorScheme, View ,   Text, Image, TouchableOpacity, StyleSheet,} from 'react-native';
import {SafeAreaProvider,  useSafeAreaInsets,} from 'react-native-safe-area-context';
import { Button, DeviceEventEmitter, Alert, Platform  } from 'react-native';
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
         '',
         '',
        '',
       );
      } else if (status === RESULTS.DENIED || status === RESULTS.BLOCKED) {
        const result = await request(cameraPermission);
        if (result === RESULTS.GRANTED) {
          console.log('Camera permission granted');
          onInitialize(
         '',
         '',
        '',
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
      '#E6BF00', // Custom Color
      true, // Enable Detect
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
      '#E6BF00',// manualClickColor
      '#E6BF00',// countDownNumbersColor
    );
  };


   // Start Flow 
  const startFlow = () => {
    Assentify.startFlow(
                "", // logoUrl
                "", // svgBackgroundImageUrl
                "", // textColor
                "", // secondaryTextColor
                "", // backgroundCardColor
                "", // accentColor
                undefined, // backgroundColors
                [""], // clickColors
                0.0, // angleDegreesBackgroundColors  90.0,
                0.0, // holdUntilBackgroundColors  0.4
                0.0, // angleDegreesClickColors  0.0
                0.0, // holdUntilClickColors  0.6
                BackgroundType.Image, // backgroundType
                true, // clear
                "en", // language
                true, // enableNfc
                true, // enableQr
                {} // blockLoaderCustomProperties { phoneNumber: "121212"}
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
  
       const onStepCompleted = DeviceEventEmitter.addListener(
            'OnStepCompleted',
            (result) => {
                     const  model = result.dataModel as FlowCompletedModel[]
                   model.forEach((item, index) => {
                     console.log(`onStepCompleted StepData ${index}:`, item.stepData);
                     console.log(`onStepCompleted SubmitRequestModel ${index}:`, item.submitRequestModel);
                   });
                   }
          );

   return () => {
      assentifySdkInit.remove();
      onFlowCompleted.remove();
      onStepCompleted.remove();
    };
  }, []);



return (
  <View style={styles.container}>

    {/* 🔹 APP BAR */}
    <View style={styles.appBar}>
      <Image source={{ uri: "https://image2url.com/r2/default/images/1774601396029-0d566673-586b-4d36-9f30-19704f88dba6.png" }} style={styles.appBarLogo} />
      <Text style={styles.appBarTitle}>BOB Demo</Text>
    </View>

    {/* 🔹 CONTENT */}
    <View style={styles.centerContent}>
      {isLoading === false ? (
        <>
          {isSdkInitialized === false && (
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={requestCameraPermission}
              >
                <Text style={styles.primaryButtonText}>
                  Initialize KYC Flow
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isSdkInitialized && (
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={startFlow}
              >
                <Text style={styles.primaryButtonText}>Start Flow</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <ActivityIndicator size="large" color="#E6BF00" />
      )}
    </View>

  </View>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2C2E',
  },

  /* 🔹 APP BAR */
  appBar: {
    height: 90,
    paddingTop: 10, // status bar spacing
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderBottomWidth: 0.5,
    borderBottomColor: '#3A3A3C',
  },

  appBarLogo: {
    width: 50,
    height: 40,
    marginRight: 10,
   // tintColor: '#E6BF00',
  },

  appBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* 🔹 CENTER CONTENT */
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonWrapper: {
    marginBottom: 12,
  },

  primaryButton: {
    backgroundColor: '#E6BF00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 180,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;

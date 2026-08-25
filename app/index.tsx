import { useEffect } from 'react';
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

export default function Index() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return <Redirect href="/(tabs)/dashboard" />;
}

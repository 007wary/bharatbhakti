import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { isOnboardingDone } from '../services/storageService';

export default function Index() {
  const [done, setDone] = useState(null);

  useEffect(() => {
    isOnboardingDone().then(setDone);
  }, []);

  if (done === null) return null;
  if (!done) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/aaj" />;
}
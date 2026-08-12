import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import SesionEfectos from '../src/components/SesionEfectos';

// Aviso esperado y sin arreglo posible en Expo Go (Android quitó el soporte
// de push remoto desde el SDK 53, ver src/hooks/usePushRegistration.js) --
// solo estorba en pantalla mientras se prueba, no indica un error real.
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

export default function RootLayout() {
  return (
    <AuthProvider>
      <SesionEfectos />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}

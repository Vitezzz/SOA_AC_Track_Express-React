import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import SesionEfectos from '../src/components/SesionEfectos';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SesionEfectos />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}

import { Alert, Linking, Platform } from 'react-native';

// Primero intentamos el esquema nativo de mapas (abre la app de mapas
// instalada directo, con el destino ya cargado); si no hay ninguna que lo
// atienda, caemos a la URL web de Google Maps. Todo atrapado -- antes esto
// tronaba con una promesa sin manejar si `openURL` fallaba.
export const abrirNavegacion = async (lat, lng) => {
  const urlNativa = Platform.select({
    ios: `maps://?daddr=${lat},${lng}`,
    android: `geo:0,0?q=${lat},${lng}`,
  });
  const urlWeb = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  try {
    const puedeAbrirNativa = urlNativa && (await Linking.canOpenURL(urlNativa));
    await Linking.openURL(puedeAbrirNativa ? urlNativa : urlWeb);
  } catch {
    Alert.alert('No se pudo abrir el mapa', 'No encontramos una app de mapas instalada en tu celular.');
  }
};

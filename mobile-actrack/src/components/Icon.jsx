import Svg, { Path, Circle } from 'react-native-svg';

// Mismo criterio que desktop-actrack/.../components/Icon.jsx -- un solo
// componente con los paths a mano (sin librería de iconos completa, para
// no meter una dependencia grande por unos cuantos símbolos). Es función
// de "color" (no un objeto fijo) porque el puntito del centro de "target"
// necesita rellenarse del mismo color, y currentColor no es confiable en
// todas las versiones de react-native-svg.
const paths = (color) => ({
  check: <Path d="M5 12.5 9.5 17 19 7" />,
  lock: (
    <>
      <Path d="M6.5 11V8a5.5 5.5 0 0 1 11 0v3" />
      <Path d="M5 11h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9Z" />
    </>
  ),
  pin: (
    <>
      <Path d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21Z" />
      <Circle cx="12" cy="9.5" r="2.3" />
    </>
  ),
  target: (
    <>
      <Circle cx="12" cy="12" r="8.2" />
      <Circle cx="12" cy="12" r="4" />
      <Circle cx="12" cy="12" r="0.6" fill={color} stroke="none" />
    </>
  ),
  navigation: <Path d="M12 2 19 21 12 17 5 21 12 2Z" />,
  x: <Path d="M6 6 18 18M18 6 6 18" />,
});

export default function Icon({ name, size = 20, color = '#111827', style }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths(color)[name] || null}
    </Svg>
  );
}

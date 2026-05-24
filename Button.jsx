import React from 'react';
import { View, Text, Pressable } from 'react-native';

const Button = ({ mode, setMode, theme, styles }) => {
  const isLight = mode === 'light';
  // Lógica de inversión de colores: fondo oscuro para texto claro y viceversa
  const buttonBgColor = isLight ? '#f8f9fa' : '#343a40';
  const buttonTextColor = isLight ? '#343a40' : '#f8f9fa';
    const buttonTextColorIn = isLight ? '#f8f9fa' : '#343a40';
  return (
    <View style={styles.themeRow}>
      <Pressable
        style={[
          styles.toggleButton,
          {
            backgroundColor: buttonBgColor,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            borderWidth: 1,
            borderColor: theme.border,
          },
        ]}
        onPress={() => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))}
      >
        <Text style={[styles.label, { color: buttonTextColor, marginBottom: 0, marginRight: 10 }]}>
          Estilo de la app
        </Text>
        <View style={{
          backgroundColor: isLight ? '#969696' : '#999999',
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 8,
        }}>
          <Text style={[styles.toggleText, { color: buttonTextColorIn }]}>
            {isLight ? 'Light' : 'Dark'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

export default Button;
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function OnboardingWelcome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const features = [
    { icon: 'heartbeat', title: 'Cuerpo', desc: 'Rutinas personalizadas con IA' },
    { icon: 'cutlery', title: 'Nutrición', desc: 'Recetas desde tu nevera' },
    { icon: 'leaf', title: 'Mente', desc: 'Diario y bienestar mental' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.welcome, { color: colors.textSecondary }]}>
            ¡Bienvenido a
          </Text>
          <Text style={[styles.logo, { color: colors.primary }]}>Be Fit</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Tu compañero de bienestar holístico
          </Text>
        </View>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={[styles.featureCard, { backgroundColor: colors.card }]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <FontAwesome
                  name={feature.icon as any}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text
                  style={[styles.featureDesc, { color: colors.textSecondary }]}
                >
                  {feature.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Necesitamos conocerte mejor para personalizar tu experiencia
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/onboarding/biometrics')}
          >
            <Text style={styles.buttonText}>Comenzar</Text>
            <FontAwesome name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcome: {
    fontSize: 18,
  },
  logo: {
    fontSize: 56,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  features: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    width: '100%',
    borderRadius: 16,
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

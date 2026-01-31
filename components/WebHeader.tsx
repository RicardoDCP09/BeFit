import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/store/authStore';

interface WebHeaderProps {
  title?: string;
  showNav?: boolean;
}

export default function WebHeader({ title = 'Be Fit', showNav = true }: WebHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, logout } = useAuthStore();

  if (Platform.OS !== 'web') {
    return null;
  }

  const navItems = [
    { label: 'Inicio', route: '/(tabs)', icon: 'home' },
    { label: 'Gym', route: '/(tabs)/gym', icon: 'heartbeat' },
    { label: 'Cocina', route: '/(tabs)/kitchen', icon: 'cutlery' },
    { label: 'Mente', route: '/(tabs)/mind', icon: 'leaf' },
    { label: 'Perfil', route: '/(tabs)/profile', icon: 'user' },
  ];

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.container}>
        {/* Logo */}
        <TouchableOpacity style={styles.logo} onPress={() => router.push('/(tabs)')}>
          <FontAwesome name="heartbeat" size={24} color={colors.primary} />
          <Text style={[styles.logoText, { color: colors.primary }]}>{title}</Text>
        </TouchableOpacity>

        {/* Navigation */}
        {showNav && (
          <View style={styles.nav}>
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.navItem}
                onPress={() => router.push(item.route as any)}
              >
                <FontAwesome name={item.icon as any} size={16} color={colors.textSecondary} />
                <Text style={[styles.navText, { color: colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* User Menu */}
        <View style={styles.userMenu}>
          {user && (
            <>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user.name || user.email}
              </Text>
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: colors.error + '15' }]}
                onPress={logout}
              >
                <FontAwesome name="sign-out" size={14} color={colors.error} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
  },
  nav: {
    flexDirection: 'row',
    gap: 24,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 14,
  },
  logoutButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const ProfileScreen = () => {
  const menuItems = [
    { icon: 'settings-outline', title: 'Settings', subtitle: 'App preferences and notifications' },
    { icon: 'location-outline', title: 'Location', subtitle: 'Change your prayer times location' },
    { icon: 'moon-outline', title: 'Theme', subtitle: 'Change app appearance' },
    { icon: 'language-outline', title: 'Language', subtitle: 'Change app language' },
    { icon: 'information-circle-outline', title: 'About', subtitle: 'About the app' },
  ];

  const renderMenuItem = ({ icon, title, subtitle }: typeof menuItems[0]) => (
    <TouchableOpacity style={styles.menuItem} key={title}>
      <Ionicons name={icon as any} size={24} color={COLORS.primary} />
      <View style={styles.menuItemText}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={COLORS.primary} />
        </View>
        <Text style={styles.userName}>Guest User</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map(renderMenuItem)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  userSection: {
    alignItems: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.background,
    ...SHADOWS.light,
  },
  avatarContainer: {
    marginBottom: SIZES.padding,
  },
  userName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  editButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  editButtonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  menuSection: {
    marginTop: SIZES.padding,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemText: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  menuItemTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuItemSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default ProfileScreen;

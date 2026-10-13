import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import { ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, token } = useAuth();
  const [stats, setStats] = useState({ total: 0, blr: 0, hyd: 0, linkedIn: 0, naukri: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(ENDPOINTS.jobStats);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.warn('Stats error:', err.message);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const getRoleBadge = () => {
    if (!user) return { label: 'Guest', color: COLORS.textMuted, icon: 'person-outline' };
    switch (user.role) {
      case 'admin':
        return { label: 'Admin', color: COLORS.accentOrange, icon: 'shield' };
      case 'company_hr':
        return { label: 'Company HR', color: COLORS.accentGreen, icon: 'business' };
      default:
        return { label: 'Job Seeker', color: COLORS.primary, icon: 'person' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient colors={COLORS.gradientHero} style={styles.profileHeader}>
          <View style={[styles.avatar, { borderColor: roleBadge.color }]}>
            <Ionicons name={roleBadge.icon} size={36} color={roleBadge.color} />
          </View>

          {user ? (
            <>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.phoneNumber ? (
                <Text style={styles.userPhoneText}>📱 {user.phoneNumber}</Text>
              ) : null}
              <View style={styles.badgeRow}>
                <View style={[styles.roleBadge, { backgroundColor: roleBadge.color + '20', borderColor: roleBadge.color + '40' }]}>
                  <Ionicons name={roleBadge.icon} size={14} color={roleBadge.color} />
                  <Text style={[styles.roleText, { color: roleBadge.color }]}>{roleBadge.label}</Text>
                </View>

                <View style={[styles.roleBadge, { backgroundColor: user.isPhoneVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', borderColor: user.isPhoneVerified ? COLORS.accentGreen : COLORS.accentOrange }]}>
                  <Ionicons name={user.isPhoneVerified ? 'checkmark-circle' : 'time'} size={14} color={user.isPhoneVerified ? COLORS.accentGreen : COLORS.accentOrange} />
                  <Text style={[styles.roleText, { color: user.isPhoneVerified ? COLORS.accentGreen : COLORS.accentOrange }]}>
                    {user.isPhoneVerified ? 'Phone Verified' : 'OTP Pending'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.userName}>Guest User</Text>
              <Text style={styles.userEmail}>Sign in with Email or Mobile to apply</Text>
            </>
          )}
        </LinearGradient>

        {/* My Applications Quick Shortcut (If User Logged In) */}
        {user && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.myApplicationsCard}
              onPress={() => navigation.navigate('Main', { screen: 'Applications' })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.gradientPrimary}
                style={styles.myAppsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.myAppsIconCircle}>
                  <Ionicons name="document-text" size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.myAppsTitle}>My Job Applications</Text>
                  <Text style={styles.myAppsDesc}>
                    View submitted applications, candidate contact logs & hiring status
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Platform Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="stats-chart" size={18} color={COLORS.primary} /> Platform Stats
          </Text>
          <View style={styles.statsGrid}>
            <StatCard label="Total Jobs" value={stats.total} color={COLORS.primary} icon="briefcase" />
            <StatCard label="Bangalore" value={stats.blr} color={COLORS.bangalore} icon="location" />
            <StatCard label="Hyderabad" value={stats.hyd} color={COLORS.hyderabad} icon="location" />
            <StatCard label="Pune" value={stats.pune} color={COLORS.pune || '#06b6d4'} icon="location" />
            <StatCard label="Mumbai" value={stats.mumbai} color={COLORS.mumbai || '#f59e0b'} icon="location" />
            <StatCard label="LinkedIn" value={stats.linkedIn} color={COLORS.linkedin} icon="logo-linkedin" />
            <StatCard label="Naukri" value={stats.naukri} color={COLORS.naukri} icon="briefcase" />
            <StatCard label="Unstop" value={stats.unstop} color={COLORS.unstop || '#8b5cf6'} icon="school" />
            <StatCard label="Non-IT" value={stats.nonItCount} color={COLORS.accentPink} icon="person" />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="settings-outline" size={18} color={COLORS.primary} /> Settings
          </Text>

          {user && (
            <MenuItem
              icon="key-outline"
              label="Verify Phone / Email via OTP"
              subtitle={user.isPhoneVerified ? 'Phone number verified' : 'Enter 6-digit OTP code'}
              color={COLORS.primary}
              onPress={() => navigation.navigate('Login', { initialMode: 'otp' })}
            />
          )}

          <MenuItem
            icon="notifications-outline"
            label="Job Alerts"
            subtitle="Get daily push notifications"
            color={COLORS.accentPurple}
          />
          <MenuItem
            icon="moon-outline"
            label="Dark Mode"
            subtitle="Always on"
            color={COLORS.accent}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About NexHire"
            subtitle="v2.0 • 1,000+ Daily Jobs"
            color={COLORS.primary}
          />
        </View>

        {/* Daily Update Info */}
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
            style={styles.infoCardGradient}
          >
            <Ionicons name="sync-circle" size={28} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Auto Daily Updates</Text>
              <Text style={styles.infoText}>
                NexHire automatically collects up to 1,000 fresh jobs from LinkedIn and Naukri.com every 24 hours for Bangalore & Hyderabad.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Auth Buttons */}
        {user ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.signInBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.signInText}>Sign In / Register</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const StatCard = ({ label, value, color, icon }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={18} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuItem = ({ icon, label, subtitle, color, onPress }) => (
  <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
    <View style={[styles.menuIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.menuLabel}>{label}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Profile Header
  profileHeader: {
    paddingTop: 70,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 14,
    ...SHADOWS.card,
  },
  userName: {
    color: COLORS.textWhite,
    fontSize: SIZES.h3,
    ...FONTS.bold,
  },
  userEmail: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    marginTop: 4,
  },
  userPhoneText: {
    color: COLORS.primaryLight,
    fontSize: SIZES.sm,
    marginTop: 2,
    ...FONTS.medium,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
  },
  roleText: {
    fontSize: SIZES.xs,
    ...FONTS.semiBold,
  },
  myApplicationsCard: {
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  myAppsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.paddingLg,
    gap: 14,
  },
  myAppsIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myAppsTitle: {
    color: '#fff',
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
  myAppsDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: SIZES.xs,
    marginTop: 2,
    lineHeight: 16,
  },

  // Section
  section: {
    paddingHorizontal: SIZES.paddingXl,
    marginTop: 24,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    ...FONTS.semiBold,
    marginBottom: 14,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: COLORS.bgCard,
    borderRadius: SIZES.radiusMd,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 3,
    ...SHADOWS.soft,
  },
  statValue: {
    color: COLORS.textWhite,
    fontSize: SIZES.xl,
    ...FONTS.bold,
    marginTop: 4,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    ...FONTS.medium,
    marginTop: 2,
  },

  // Menu
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.bgCard,
    borderRadius: SIZES.radiusMd,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    ...FONTS.semiBold,
  },
  menuSubtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    marginTop: 2,
  },

  // Info Card
  infoCard: {
    marginHorizontal: SIZES.paddingXl,
    marginTop: 24,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  infoCardGradient: {
    flexDirection: 'row',
    gap: 12,
    padding: SIZES.paddingLg,
    alignItems: 'flex-start',
  },
  infoTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    ...FONTS.semiBold,
    marginBottom: 4,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    lineHeight: 20,
  },

  // Buttons
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: SIZES.paddingXl,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
    backgroundColor: COLORS.error + '10',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: SIZES.md,
    ...FONTS.semiBold,
  },
  signInBtn: {
    marginHorizontal: SIZES.paddingXl,
    marginTop: 24,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  signInBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  signInText: {
    color: '#fff',
    fontSize: SIZES.lg,
    ...FONTS.bold,
  },
});

export default ProfileScreen;

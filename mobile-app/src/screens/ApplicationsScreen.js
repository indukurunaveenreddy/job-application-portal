import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import { ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const ApplicationsScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!user) {
      setApplications([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const url = `${ENDPOINTS.myApplications}?email=${encodeURIComponent(user.email || '')}&phone=${encodeURIComponent(user.phoneNumber || '')}`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.warn('Failed to load applications:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted':
        return COLORS.accentGreen;
      case 'Interview Scheduled':
        return COLORS.accentOrange;
      case 'Under Review':
        return COLORS.accentPurple;
      case 'Offer Extended':
        return '#10b981';
      case 'Rejected':
        return COLORS.error;
      default:
        return COLORS.primary;
    }
  };

  const renderApplicationCard = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const job = item.job || {};

    return (
      <View style={styles.card}>
        {/* Top Row: Job Title & Status */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {job.title || 'Position Applied'}
            </Text>
            <Text style={styles.companyName}>
              {job.company?.name || 'Partner Company'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '50' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status || 'Submitted'}</Text>
          </View>
        </View>

        {/* Location & Compensation */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{job.location || 'Bangalore / Remote'}</Text>
          </View>
          {job.salary && (
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color={COLORS.accentGreen} />
              <Text style={[styles.metaText, { color: COLORS.accentGreen }]}>{job.salary}</Text>
            </View>
          )}
        </View>

        {/* Candidate Recorded Info Box */}
        <View style={styles.candidateBox}>
          <Text style={styles.candidateBoxTitle}>
            <Ionicons name="checkmark-circle" size={13} color={COLORS.accentGreen} /> Candidate Information Recorded:
          </Text>
          <View style={styles.candidateDetails}>
            <Text style={styles.candidateLine}>
              <Text style={styles.boldLabel}>Applicant: </Text>{item.candidateName}
            </Text>
            <Text style={styles.candidateLine}>
              <Text style={styles.boldLabel}>Email: </Text>{item.candidateEmail}
            </Text>
            <Text style={styles.candidateLine}>
              <Text style={styles.boldLabel}>Mobile: </Text>{item.candidatePhone}
            </Text>
            {item.experienceYears && (
              <Text style={styles.candidateLine}>
                <Text style={styles.boldLabel}>Experience: </Text>{item.experienceYears} • Expected: {item.expectedSalary || 'N/A'}
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.appliedDate}>
            Applied: {new Date(item.appliedAt || item.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
          {item.resumeUrl ? (
            <TouchableOpacity
              style={styles.resumeBtn}
              onPress={() => Linking.openURL(item.resumeUrl)}
            >
              <Ionicons name="document-text-outline" size={14} color={COLORS.primary} />
              <Text style={styles.resumeBtnText}>View Resume</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  // If user is guest / not signed in:
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Job Applications</Text>
        </View>

        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={styles.emptyIconBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="lock-closed" size={38} color="#fff" />
          </LinearGradient>

          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptySubtitle}>
            Only registered and logged-in candidates can view job applications and track their hiring pipeline.
          </Text>

          <View style={styles.featurePoints}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.accentGreen} />
              <Text style={styles.featureText}>Sign up with Email or Mobile Number</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.accentGreen} />
              <Text style={styles.featureText}>6-Digit OTP security & instant verification</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.accentGreen} />
              <Text style={styles.featureText}>1-Click Apply to all 1,000+ top jobs</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Login', { initialMode: 'signin' })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.btnText}>Sign In / Sign Up Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Applications</Text>
          <Text style={styles.headerSubtitle}>
            {`Logged in as ${user.name || user.email}`}
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="reload" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Candidate Verification Status Banner */}
      <View style={styles.candidateStatusBanner}>
        <View style={styles.statusPillsRow}>
          <View style={[styles.miniBadge, user.isPhoneVerified ? styles.verifiedBadge : styles.pendingBadge]}>
            <Ionicons
              name={user.isPhoneVerified ? 'checkmark-circle' : 'time-outline'}
              size={13}
              color={user.isPhoneVerified ? COLORS.accentGreen : COLORS.accentOrange}
            />
            <Text style={[styles.miniBadgeText, { color: user.isPhoneVerified ? COLORS.accentGreen : COLORS.accentOrange }]}>
              {user.isPhoneVerified ? 'Phone Verified' : 'Phone OTP Pending'}
            </Text>
          </View>

          <View style={[styles.miniBadge, user.isEmailVerified ? styles.verifiedBadge : styles.pendingBadge]}>
            <Ionicons
              name={user.isEmailVerified ? 'checkmark-circle' : 'time-outline'}
              size={13}
              color={user.isEmailVerified ? COLORS.accentGreen : COLORS.accentOrange}
            />
            <Text style={[styles.miniBadgeText, { color: user.isEmailVerified ? COLORS.accentGreen : COLORS.accentOrange }]}>
              {user.isEmailVerified ? 'Email Verified' : 'Email OTP Pending'}
            </Text>
          </View>
        </View>
        <Text style={styles.contactRecordText}>
          Recorded: {user.email || 'N/A'} • {user.phoneNumber || '+91 Mobile Active'}
        </Text>
      </View>

      {/* Content List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      ) : applications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={60} color={COLORS.textDim} />
          <Text style={styles.emptyTitle}>No Applications Yet</Text>
          <Text style={styles.emptySubtitle}>
            Browse our 1,000+ fresh daily job openings across Bangalore, Hyderabad, Pune & Mumbai and apply directly through the portal!
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.browseButtonText}>Browse Vacancies</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item._id || String(Math.random())}
          renderItem={renderApplicationCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: SIZES.paddingXl,
    paddingBottom: 14,
    backgroundColor: COLORS.bgAccent,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h3,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  candidateStatusBanner: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SIZES.paddingXl,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  miniBadgeText: {
    fontSize: 10,
    ...FONTS.semiBold,
  },
  contactRecordText: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
  },
  listContent: {
    padding: SIZES.paddingXl,
    paddingBottom: 100,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: SIZES.md,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  companyName: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: SIZES.xs,
    ...FONTS.semiBold,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
  },
  candidateBox: {
    backgroundColor: COLORS.bgAccent,
    borderRadius: SIZES.radiusMd,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  candidateBoxTitle: {
    fontSize: 11,
    ...FONTS.semiBold,
    color: COLORS.accentGreen,
    marginBottom: 6,
  },
  candidateDetails: {
    gap: 2,
  },
  candidateLine: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  boldLabel: {
    ...FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  appliedDate: {
    fontSize: SIZES.xs,
    color: COLORS.textDim,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resumeBtnText: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    ...SHADOWS.button,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  featurePoints: {
    gap: 10,
    marginBottom: 24,
    alignSelf: 'stretch',
    backgroundColor: COLORS.bgCard,
    padding: 16,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  signInButton: {
    width: '100%',
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  btnText: {
    color: '#fff',
    fontSize: SIZES.md,
    ...FONTS.semiBold,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: SIZES.radiusMd,
    marginTop: 10,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },
});

export default ApplicationsScreen;

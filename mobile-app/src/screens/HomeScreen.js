import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Animated,
  Linking,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import { ENDPOINTS } from '../config/api';
import { getOrFetchJobs } from '../services/jobService';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchJobs();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getOrFetchJobs();
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (err) {
      console.warn('Failed to fetch jobs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, []);

  const handleSyncDaily = async () => {
    try {
      setSyncing(true);
      const res = await fetch(ENDPOINTS.syncDaily, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 1000 }),
      });
      await res.json();
      await fetchJobs();
    } catch (err) {
      console.warn('Sync error:', err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Counts
  const blrCount = jobs.filter(j => j.city === 'Bangalore' || (j.location && (j.location.toLowerCase().includes('bengaluru') || j.location.toLowerCase().includes('bangalore')))).length;
  const hydCount = jobs.filter(j => j.city === 'Hyderabad' || (j.location && j.location.toLowerCase().includes('hyderabad'))).length;
  const puneCount = jobs.filter(j => j.city === 'Pune' || (j.location && j.location.toLowerCase().includes('pune'))).length;
  const mumbaiCount = jobs.filter(j => j.city === 'Mumbai' || (j.location && (j.location.toLowerCase().includes('mumbai') || j.location.toLowerCase().includes('navi mumbai')))).length;
  const liCount = jobs.filter(j => j.source === 'LinkedIn').length;
  const nkCount = jobs.filter(j => j.source === 'Naukri').length;
  const unstopCount = jobs.filter(j => j.source === 'Unstop').length;
  const itCount = jobs.filter(j => j.category === 'IT' || !j.category).length;
  const nonItCount = jobs.filter(j => j.category === 'Non-IT').length;
  const civilCount = jobs.filter(j => j.category === 'Civil').length;
  const securityCount = jobs.filter(j => j.category === 'Security').length;
  const airForceCount = jobs.filter(j => j.category === 'Air Force').length;

  // Filter
  const filtered = jobs.filter(j => {
    const matchSearch = !search || 
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.company?.name && j.company.name.toLowerCase().includes(search.toLowerCase())) ||
      (j.skills && j.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))) ||
      j.location.toLowerCase().includes(search.toLowerCase());

    const matchCity = cityFilter === 'all' ||
      (cityFilter === 'Bangalore' && (j.city === 'Bangalore' || j.location?.toLowerCase().includes('bengaluru') || j.location?.toLowerCase().includes('bangalore'))) ||
      (cityFilter === 'Hyderabad' && (j.city === 'Hyderabad' || j.location?.toLowerCase().includes('hyderabad'))) ||
      (cityFilter === 'Pune' && (j.city === 'Pune' || j.location?.toLowerCase().includes('pune'))) ||
      (cityFilter === 'Mumbai' && (j.city === 'Mumbai' || j.location?.toLowerCase().includes('mumbai') || j.location?.toLowerCase().includes('navi mumbai')));

    const matchSource = sourceFilter === 'all' || j.source === sourceFilter;
    const matchCategory = categoryFilter === 'all' ||
      (categoryFilter === 'IT' && (j.category === 'IT' || !j.category)) ||
      (categoryFilter === 'Non-IT' && j.category === 'Non-IT') ||
      (categoryFilter === 'Civil' && j.category === 'Civil') ||
      (categoryFilter === 'Security' && j.category === 'Security') ||
      (categoryFilter === 'Air Force' && j.category === 'Air Force');
    const matchType = typeFilter === 'all' || j.employmentType === typeFilter;

    return matchSearch && matchCity && matchSource && matchCategory && matchType;
  });

  const renderStatCard = (label, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderJobCard = ({ item: job, index }) => {
    const isLinkedIn = job.source === 'LinkedIn';
    const isUnstop = job.source === 'Unstop';

    return (
      <Animated.View
        style={[
          styles.jobCard,
          SHADOWS.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header Row */}
        <View style={styles.jobCardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
            <TouchableOpacity
              style={styles.companyRow}
              onPress={() => job.companyWebsite && Linking.openURL(job.companyWebsite)}
            >
              <Ionicons name="business-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.companyName}>{job.company?.name || 'Company'}</Text>
              {job.companyWebsite && (
                <Ionicons name="open-outline" size={12} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <View style={[
              styles.sourceBadge,
              {
                backgroundColor:
                  job.category === 'Civil' ? '#f59e0b25' :
                  job.category === 'Security' ? '#10b98125' :
                  job.category === 'Air Force' ? '#38bdf825' :
                  job.category === 'Non-IT' ? COLORS.accentPink + '20' : COLORS.accent + '20'
              }
            ]}>
              <Text style={[
                styles.sourceBadgeText,
                {
                  color:
                    job.category === 'Civil' ? '#f59e0b' :
                    job.category === 'Security' ? '#10b981' :
                    job.category === 'Air Force' ? '#38bdf8' :
                    job.category === 'Non-IT' ? COLORS.accentPink : COLORS.accent,
                  fontWeight: '700'
                }
              ]}>
                {job.category === 'Civil' ? '🏗️ Civil' :
                 job.category === 'Security' ? '🛡️ Security' :
                 job.category === 'Air Force' ? '✈️ Air Force' :
                 job.category === 'Non-IT' ? 'Non-IT' : 'IT'}
              </Text>
            </View>

            <View style={[
              styles.sourceBadge,
              { backgroundColor: isLinkedIn ? COLORS.linkedin + '20' : isUnstop ? COLORS.unstop + '20' : COLORS.naukri + '20' }
            ]}>
              <FontAwesome5
                name={isLinkedIn ? 'linkedin' : isUnstop ? 'graduation-cap' : 'briefcase'}
                size={12}
                color={isLinkedIn ? COLORS.linkedinLight : isUnstop ? COLORS.unstopLight : COLORS.naukriLight}
              />
              <Text style={[
                styles.sourceBadgeText,
                { color: isLinkedIn ? COLORS.linkedinLight : isUnstop ? COLORS.unstopLight : COLORS.naukriLight }
              ]}>
                {job.source || 'Portal'}
              </Text>
            </View>
          </View>
        </View>

        {/* Meta Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={COLORS.bangalore} />
            <Text style={styles.metaText} numberOfLines={1}>{job.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="briefcase-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{job.employmentType || 'Full-time'}</Text>
          </View>
          {job.experienceLevel && (
            <View style={styles.metaItem}>
              <Ionicons name="layers-outline" size={13} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{job.experienceLevel}</Text>
            </View>
          )}
        </View>

        {/* Salary */}
        <View style={styles.salaryRow}>
          <Ionicons name="cash-outline" size={14} color={COLORS.accentGreen} />
          <Text style={styles.salaryText}>{job.salary || 'Starting ₹3,00,000 / yr'}</Text>
        </View>

        {/* Description */}
        <Text style={styles.jobDescription} numberOfLines={3}>{job.description}</Text>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.skillsRow}>
            {job.skills.map((skill, idx) => (
              <View key={idx} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Footer Actions */}
        <View style={styles.jobFooter}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate('JobDetail', { job })}
            activeOpacity={0.8}
          >
            <Ionicons name="paper-plane" size={13} color={COLORS.primary} />
            <Text style={styles.detailsButtonText}>Apply on Portal</Text>
          </TouchableOpacity>

          {(job.companyWebsite || job.company?.website) && (
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={() => Linking.openURL(job.companyWebsite || job.company?.website)}
              activeOpacity={0.8}
            >
              <Ionicons name="globe-outline" size={13} color={COLORS.primary} />
              <Text style={styles.websiteButtonText}>Website</Text>
            </TouchableOpacity>
          )}

          {job.applyUrl && (
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => Linking.openURL(job.applyUrl)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isLinkedIn ? COLORS.gradientLinkedin : isUnstop ? ['#8b5cf6', '#6d28d9'] : COLORS.gradientNaukri}
                style={styles.applyButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <FontAwesome5
                  name={isLinkedIn ? 'linkedin' : isUnstop ? 'graduation-cap' : 'briefcase'}
                  size={13}
                  color="#fff"
                />
                <Text style={styles.applyButtonText}>
                  {isLinkedIn ? 'LinkedIn' : isUnstop ? 'Unstop' : 'Naukri'}
                </Text>
                <Ionicons name="open-outline" size={12} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  const ListHeader = () => (
    <View>
      {/* Top User Sign In / Account Bar */}
      <View style={styles.userBar}>
        {user ? (
          <View style={styles.userBarContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userGreeting}>
                👋 Welcome, <Text style={{ color: COLORS.textWhite, fontWeight: 'bold' }}>{user.name || 'Candidate'}</Text>
              </Text>
              <Text style={styles.userContactText}>
                {user.email || user.phoneNumber || 'Registered Member'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.myAppsPill}
              onPress={() => navigation.navigate('Main', { screen: 'Applications' })}
            >
              <Ionicons name="document-text" size={14} color="#fff" />
              <Text style={styles.myAppsPillText}>My Applications</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.guestBar}
            onPress={() => navigation.navigate('Login', { initialMode: 'signin' })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.guestBarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="person-circle-outline" size={20} color="#fff" />
              <Text style={styles.guestBarText}>
                Sign In / Sign Up (Email or Mobile Phone)
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Hero Section */}
      <LinearGradient colors={COLORS.gradientHero} style={styles.heroSection}>
        <View style={styles.heroPill}>
          <Ionicons name="sparkles" size={14} color={COLORS.accentPurple} />
          <Text style={styles.heroPillText}>5,000+ Daily Openings • LinkedIn, Naukri & Unstop</Text>
        </View>

        <Text style={styles.heroTitle}>
          Top Tech, Civil, Security & Defense Careers in{'\n'}
          <Text style={{ color: COLORS.primary }}>BLR, HYD, Pune & Mumbai</Text>
        </Text>

        <Text style={styles.heroSubtitle}>
          IT, Non-IT, Civil, Security & Air Force opportunities starting from ₹3 LPA with direct company links.
        </Text>

        {/* Stats Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          {renderStatCard('Total', jobs.length, 'briefcase', COLORS.primary)}
          {renderStatCard('Bangalore', blrCount, 'location', COLORS.bangalore)}
          {renderStatCard('Hyderabad', hydCount, 'location', COLORS.hyderabad)}
          {renderStatCard('Pune', puneCount, 'location', COLORS.pune || '#06b6d4')}
          {renderStatCard('Mumbai', mumbaiCount, 'location', COLORS.mumbai || '#f59e0b')}
          {renderStatCard('IT Tech', itCount, 'laptop-outline', COLORS.accent)}
          {renderStatCard('Non-IT', nonItCount, 'person-outline', COLORS.accentPink)}
          {renderStatCard('Civil', civilCount, 'business-outline', '#f59e0b')}
          {renderStatCard('Security', securityCount, 'shield-checkmark-outline', '#10b981')}
          {renderStatCard('Air Force', airForceCount, 'airplane-outline', '#38bdf8')}
          {renderStatCard('Unstop', unstopCount, 'school-outline', COLORS.unstop || '#8b5cf6')}
        </ScrollView>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search role, civil, security, air force, skills..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Domain Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterScroll, { marginBottom: 4 }]}>
        <FilterPill
          label="All Domains"
          icon="layers-outline"
          active={categoryFilter === 'all'}
          onPress={() => setCategoryFilter('all')}
        />
        <FilterPill
          label={`💻 IT (${itCount})`}
          icon="laptop-outline"
          active={categoryFilter === 'IT'}
          onPress={() => setCategoryFilter(categoryFilter === 'IT' ? 'all' : 'IT')}
          activeColor={COLORS.accent}
        />
        <FilterPill
          label={`💼 Non-IT (${nonItCount})`}
          icon="person-outline"
          active={categoryFilter === 'Non-IT'}
          onPress={() => setCategoryFilter(categoryFilter === 'Non-IT' ? 'all' : 'Non-IT')}
          activeColor={COLORS.accentPink}
        />
        <FilterPill
          label={`🏗️ Civil (${civilCount})`}
          icon="construct-outline"
          active={categoryFilter === 'Civil'}
          onPress={() => setCategoryFilter(categoryFilter === 'Civil' ? 'all' : 'Civil')}
          activeColor="#f59e0b"
        />
        <FilterPill
          label={`🛡️ Security (${securityCount})`}
          icon="shield-outline"
          active={categoryFilter === 'Security'}
          onPress={() => setCategoryFilter(categoryFilter === 'Security' ? 'all' : 'Security')}
          activeColor="#10b981"
        />
        <FilterPill
          label={`✈️ Air Force (${airForceCount})`}
          icon="airplane-outline"
          active={categoryFilter === 'Air Force'}
          onPress={() => setCategoryFilter(categoryFilter === 'Air Force' ? 'all' : 'Air Force')}
          activeColor="#38bdf8"
        />
      </ScrollView>

      {/* Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <FilterPill
          label={`All Cities (${jobs.length})`}
          icon="globe-outline"
          active={cityFilter === 'all'}
          onPress={() => setCityFilter('all')}
        />
        <FilterPill
          label={`Bangalore (${blrCount})`}
          icon="location"
          active={cityFilter === 'Bangalore'}
          onPress={() => setCityFilter('Bangalore')}
          activeColor={COLORS.bangalore}
        />
        <FilterPill
          label={`Hyderabad (${hydCount})`}
          icon="location"
          active={cityFilter === 'Hyderabad'}
          onPress={() => setCityFilter('Hyderabad')}
          activeColor={COLORS.hyderabad}
        />
        <FilterPill
          label={`Pune (${puneCount})`}
          icon="location"
          active={cityFilter === 'Pune'}
          onPress={() => setCityFilter('Pune')}
          activeColor={COLORS.pune || '#06b6d4'}
        />
        <FilterPill
          label={`Mumbai (${mumbaiCount})`}
          icon="location"
          active={cityFilter === 'Mumbai'}
          onPress={() => setCityFilter('Mumbai')}
          activeColor={COLORS.mumbai || '#f59e0b'}
        />
        <FilterPill
          label={`LinkedIn (${liCount})`}
          icon="logo-linkedin"
          active={sourceFilter === 'LinkedIn'}
          onPress={() => setSourceFilter(sourceFilter === 'LinkedIn' ? 'all' : 'LinkedIn')}
          activeColor={COLORS.linkedin}
        />
        <FilterPill
          label={`Naukri (${nkCount})`}
          icon="briefcase"
          active={sourceFilter === 'Naukri'}
          onPress={() => setSourceFilter(sourceFilter === 'Naukri' ? 'all' : 'Naukri')}
          activeColor={COLORS.naukri}
        />
        <FilterPill
          label={`Unstop (${unstopCount})`}
          icon="school-outline"
          active={sourceFilter === 'Unstop'}
          onPress={() => setSourceFilter(sourceFilter === 'Unstop' ? 'all' : 'Unstop')}
          activeColor={COLORS.unstop || '#8b5cf6'}
        />
      </ScrollView>

      {/* Sync Button */}
      <TouchableOpacity
        style={styles.syncButton}
        onPress={handleSyncDaily}
        disabled={syncing}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={styles.syncButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons
            name={syncing ? 'sync' : 'sync-outline'}
            size={18}
            color="#fff"
          />
          <Text style={styles.syncButtonText}>
            {syncing ? 'Collecting 1,000 Jobs...' : 'Collect Fresh 1,000 Daily Jobs'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filtered.length} {filtered.length === 1 ? 'Job' : 'Jobs'} Found
        </Text>
        <Text style={styles.resultsSubtext}>
          Updated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading verified vacancies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderJobCard}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No matching jobs found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </View>
  );
};

// Filter pill component
const FilterPill = ({ label, icon, active, onPress, activeColor }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[
      styles.filterPill,
      active && {
        backgroundColor: (activeColor || COLORS.primary) + '25',
        borderColor: activeColor || COLORS.primary,
      },
    ]}
  >
    <Ionicons
      name={icon}
      size={14}
      color={active ? (activeColor || COLORS.primary) : COLORS.textSecondary}
    />
    <Text style={[
      styles.filterPillText,
      active && { color: activeColor || COLORS.primary },
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 12,
    fontSize: SIZES.md,
  },
  listContent: {
    paddingBottom: 100,
  },

  // User Auth Top Bar
  userBar: {
    backgroundColor: COLORS.bgAccent,
    paddingTop: Platform.OS === 'ios' ? 48 : 42,
    paddingHorizontal: SIZES.paddingXl,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  userGreeting: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  userContactText: {
    fontSize: SIZES.xs,
    color: COLORS.primaryLight,
    marginTop: 2,
  },
  myAppsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: SIZES.radiusFull,
  },
  myAppsPillText: {
    color: '#fff',
    fontSize: SIZES.xs,
    ...FONTS.semiBold,
  },
  guestBar: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  guestBarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  guestBarText: {
    color: '#fff',
    fontSize: SIZES.xs,
    ...FONTS.bold,
  },

  // Hero
  heroSection: {
    paddingTop: 20,
    paddingHorizontal: SIZES.paddingXl,
    paddingBottom: SIZES.paddingXxl,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
    marginBottom: 16,
  },
  heroPillText: {
    color: COLORS.primaryLight,
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },
  heroTitle: {
    fontSize: SIZES.h1,
    color: COLORS.textWhite,
    ...FONTS.extraBold,
    lineHeight: 42,
    marginBottom: 12,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    lineHeight: 22,
    marginBottom: 20,
  },

  // Stats
  statsScroll: {
    marginTop: 8,
  },
  statCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    minWidth: 100,
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

  // Search
  searchContainer: {
    paddingHorizontal: SIZES.paddingXl,
    paddingVertical: SIZES.paddingMd,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: 16,
    height: SIZES.inputHeight,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
  },

  // Filters
  filterScroll: {
    paddingHorizontal: SIZES.paddingLg,
    marginBottom: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bgCard,
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    ...FONTS.medium,
  },

  // Sync
  syncButton: {
    marginHorizontal: SIZES.paddingXl,
    marginBottom: 16,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  syncButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: SIZES.md,
    ...FONTS.semiBold,
  },

  // Results
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingXl,
    marginBottom: 12,
  },
  resultsCount: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    ...FONTS.semiBold,
  },
  resultsSubtext: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
  },

  // Job Card
  jobCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    marginHorizontal: SIZES.paddingXl,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobTitle: {
    color: COLORS.textWhite,
    fontSize: SIZES.lg,
    ...FONTS.bold,
    flex: 1,
    marginRight: 10,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  companyName: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    ...FONTS.medium,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
  },
  sourceBadgeText: {
    fontSize: SIZES.xs,
    ...FONTS.semiBold,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  salaryText: {
    color: COLORS.accentGreen,
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },
  jobDescription: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    lineHeight: 20,
    marginBottom: 10,
  },
  skillsRow: {
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  skillText: {
    color: COLORS.primaryLight,
    fontSize: SIZES.xs,
    ...FONTS.medium,
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applyButton: {
    flex: 1,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.bgAccent,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  websiteButtonText: {
    color: COLORS.primaryLight,
    fontSize: SIZES.xs,
    ...FONTS.semiBold,
  },
  detailsButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.xl,
    ...FONTS.semiBold,
    marginTop: 16,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    marginTop: 6,
  },
});

export default HomeScreen;

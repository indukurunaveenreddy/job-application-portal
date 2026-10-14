import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  StatusBar,
  Share,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { ENDPOINTS } from '../config/api';

const JobDetailScreen = ({ route, navigation }) => {
  const { job } = route.params;
  const { user, token } = useAuth();
  const isLinkedIn = job.source === 'LinkedIn';
  const isUnstop = job.source === 'Unstop';

  // Application Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [candidateName, setCandidateName] = useState(user?.name || '');
  const [candidateEmail, setCandidateEmail] = useState(user?.email || '');
  const [candidatePhone, setCandidatePhone] = useState(user?.phoneNumber || '');
  const [experienceYears, setExperienceYears] = useState('2-4 Years');
  const [expectedSalary, setExpectedSalary] = useState(job.salary || '₹18 LPA');
  const [noticePeriod, setNoticePeriod] = useState('Immediate / 15 Days');
  const [resumeUrl, setResumeUrl] = useState('https://drive.google.com/my-resume-preview');
  const [coverLetter, setCoverLetter] = useState(
    `Excited to apply for ${job.title} at ${job.company?.name || 'Company'}. Ready to contribute immediately!`
  );

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this job: ${job.title} at ${job.company?.name || 'Company'}\n\nLocation: ${job.location}\n\nApply here: ${job.applyUrl || 'N/A'}\n\nFound on NexHire App`,
        title: `${job.title} - NexHire`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleOpenPortalApply = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Only registered & logged-in candidates can submit applications through the portal and track their application status.\n\nWould you like to Sign In or Sign Up now with your Email or Mobile Phone?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In / Register',
            style: 'default',
            onPress: () => navigation.navigate('Login', { initialMode: 'signin' }),
          },
        ]
      );
      return;
    }

    // Pre-populate with logged-in user contact info
    setCandidateName(user.name || '');
    setCandidateEmail(user.email || '');
    setCandidatePhone(user.phoneNumber || '');
    setModalVisible(true);
  };

  const handleSubmitApplication = async () => {
    if (!candidateName.trim() || !candidateEmail.trim() || !candidatePhone.trim()) {
      Alert.alert('Required Fields', 'Candidate Name, Email, and Mobile Phone are required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(ENDPOINTS.applications, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          jobId: job._id,
          candidateName: candidateName.trim(),
          candidateEmail: candidateEmail.trim(),
          candidatePhone: candidatePhone.trim(),
          experienceYears,
          expectedSalary,
          noticePeriod,
          resumeUrl,
          coverLetter,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Could not submit application.');
      }

      setModalVisible(false);
      Alert.alert(
        'Application Submitted! 🎉',
        `Your application for "${job.title}" has been successfully submitted and candidate contact details recorded.\n\nYou can track real-time hiring updates in the "Applications" tab.`,
        [
          { text: 'OK', style: 'default' },
          {
            text: 'View in Applications',
            style: 'default',
            onPress: () => navigation.navigate('Main', { screen: 'Applications' }),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Submission Error', err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8, alignItems: 'center' }}>
            <View style={[
              styles.sourceBadge,
              { backgroundColor: job.category === 'Non-IT' ? COLORS.accentPink + '20' : COLORS.accent + '20' }
            ]}>
              <Text style={[
                styles.sourceBadgeText,
                { color: job.category === 'Non-IT' ? COLORS.accentPink : COLORS.accent, fontWeight: '700' }
              ]}>
                {job.category === 'Non-IT' ? '💼 Non-IT' : '💻 IT Tech'}
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

          <Text style={styles.jobTitle}>{job.title}</Text>

          <View style={styles.companyRow}>
            <Ionicons name="business" size={16} color={COLORS.primary} />
            <Text style={styles.companyName}>{job.company?.name || 'Company'}</Text>
          </View>

          {/* Official Company Website Card */}
          <TouchableOpacity
            style={styles.companyWebsiteCard}
            onPress={() => {
              const site =
                job.companyWebsite ||
                job.company?.website ||
                (job.company?.name
                  ? `https://www.${job.company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/careers`
                  : 'https://careers.google.com');
              Linking.openURL(site);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.globeIconCircle}>
              <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.companyWebsiteLabel}>Official Company Website</Text>
              <Text style={styles.companyWebsiteUrl} numberOfLines={1}>
                {job.companyWebsite || job.company?.website || 'Visit Official Careers Page'}
              </Text>
            </View>
            <View style={styles.visitPill}>
              <Text style={styles.visitPillText}>Visit Website</Text>
              <Ionicons name="open-outline" size={13} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoGrid}>
          <InfoCard
            icon="location"
            label="Location"
            value={job.location}
            color={COLORS.bangalore}
          />
          <InfoCard
            icon="briefcase"
            label="Type"
            value={job.employmentType || 'Full-time'}
            color={COLORS.primary}
          />
          <InfoCard
            icon="layers"
            label="Level"
            value={job.experienceLevel || 'Mid-level'}
            color={COLORS.accentPurple}
          />
          {job.salary && (
            <InfoCard
              icon="cash"
              label="Salary"
              value={job.salary}
              color={COLORS.accentGreen}
            />
          )}
        </View>

        {/* Portal 1-Click Apply Banner */}
        <View style={styles.portalCard}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.15)', 'rgba(168, 85, 247, 0.15)']}
            style={styles.portalGradient}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.portalCardTitle}>Apply Directly on Portal</Text>
              <Text style={styles.portalCardDesc}>
                {user
                  ? `Signed in as ${user.name || user.email}. Tap below to submit your profile & resume with 1-click!`
                  : 'Sign in with Email or Mobile Number to submit your application & track hiring in real time.'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.portalApplyBtn}
              onPress={handleOpenPortalApply}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.gradientPrimary}
                style={styles.portalApplyGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="paper-plane" size={16} color="#fff" />
                <Text style={styles.portalApplyText}>Apply on Portal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Official Company Career Site Referral */}
        {(job.companyWebsite || job.company?.website) && (
          <View style={styles.companyWebsiteCard}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.accentGreen} style={{ marginRight: 6 }} />
                <Text style={styles.companyWebsiteTitle}>Official Company Career Site</Text>
              </View>
              <Text style={styles.companyWebsiteDesc} numberOfLines={1}>
                {job.companyWebsite || job.company?.website}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.companyWebsiteBtn}
              onPress={() => Linking.openURL(job.companyWebsite || job.company?.website)}
              activeOpacity={0.8}
            >
              <Text style={styles.companyWebsiteBtnText}>Visit Site</Text>
              <Ionicons name="open-outline" size={13} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="document-text-outline" size={18} color={COLORS.primary} /> Description
          </Text>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="code-slash-outline" size={18} color={COLORS.primary} /> Required Skills
            </Text>
            <View style={styles.skillsContainer}>
              {job.skills.map((skill, idx) => (
                <View key={idx} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* City Badge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="map-outline" size={18} color={COLORS.primary} /> City
          </Text>
          <View style={[
            styles.cityBadge,
            {
              backgroundColor:
                job.city === 'Bangalore'
                  ? COLORS.bangalore + '15'
                  : job.city === 'Hyderabad'
                  ? COLORS.hyderabad + '15'
                  : job.city === 'Pune'
                  ? (COLORS.pune || '#06b6d4') + '15'
                  : (COLORS.mumbai || '#f59e0b') + '15',
            }
          ]}>
            <Text style={[
              styles.cityText,
              {
                color:
                  job.city === 'Bangalore'
                    ? COLORS.bangalore
                    : job.city === 'Hyderabad'
                    ? COLORS.hyderabad
                    : job.city === 'Pune'
                    ? (COLORS.pune || '#06b6d4')
                    : (COLORS.mumbai || '#f59e0b'),
              }
            ]}>
              📍 {job.city || 'Bangalore'}
            </Text>
          </View>
        </View>

        {/* Posted Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} /> Posted
          </Text>
          <Text style={styles.dateText}>
            {new Date(job.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Bottom Apply Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.portalActionBtn}
          onPress={handleOpenPortalApply}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={styles.portalActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="paper-plane" size={16} color="#fff" />
            <Text style={styles.portalActionText}>Apply on Portal</Text>
          </LinearGradient>
        </TouchableOpacity>

        {job.applyUrl && (
          <TouchableOpacity
            style={styles.externalBtn}
            onPress={() => Linking.openURL(job.applyUrl)}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name={isLinkedIn ? 'linkedin' : isUnstop ? 'graduation-cap' : 'briefcase'}
              size={15}
              color="#fff"
            />
            <Text style={styles.externalBtnText}>
              {isLinkedIn ? 'LinkedIn' : isUnstop ? 'Unstop' : 'Naukri'}
            </Text>
            <Ionicons name="open-outline" size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Application Submission Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Portal Job Application</Text>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  {job.title} • {job.company?.name || 'Company'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Candidate Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={COLORS.textDim}
                  value={candidateName}
                  onChangeText={setCandidateName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Registered Email Address *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. rahul@example.com"
                  placeholderTextColor={COLORS.textDim}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={candidateEmail}
                  onChangeText={setCandidateEmail}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Candidate Mobile Phone Number *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={COLORS.textDim}
                  keyboardType="phone-pad"
                  value={candidatePhone}
                  onChangeText={setCandidatePhone}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Experience</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 3+ Years"
                    placeholderTextColor={COLORS.textDim}
                    value={experienceYears}
                    onChangeText={setExperienceYears}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Expected Salary</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. ₹20 LPA"
                    placeholderTextColor={COLORS.textDim}
                    value={expectedSalary}
                    onChangeText={setExpectedSalary}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notice Period</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Immediate / 15 Days"
                  placeholderTextColor={COLORS.textDim}
                  value={noticePeriod}
                  onChangeText={setNoticePeriod}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Resume Link / Drive URL</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://drive.google.com/resume"
                  placeholderTextColor={COLORS.textDim}
                  autoCapitalize="none"
                  value={resumeUrl}
                  onChangeText={setResumeUrl}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Pitch / Cover Note</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Brief pitch..."
                  placeholderTextColor={COLORS.textDim}
                  multiline
                  numberOfLines={3}
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitApplication}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={COLORS.gradientPrimary}
                  style={styles.modalSubmitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={styles.modalSubmitText}>Confirm & Submit Application</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const InfoCard = ({ icon, label, value, color }) => (
  <View style={[styles.infoCard, { borderLeftColor: color }]}>
    <View style={styles.infoCardHeader}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.infoCardLabel}>{label}</Text>
    </View>
    <Text style={styles.infoCardValue} numberOfLines={2}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SIZES.paddingXl,
    paddingBottom: 12,
    backgroundColor: COLORS.bgAccent,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.xl,
    ...FONTS.semiBold,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SIZES.paddingXl,
  },

  // Title
  titleSection: {
    marginBottom: 20,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SIZES.radiusFull,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  sourceBadgeText: {
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },
  jobTitle: {
    color: COLORS.textWhite,
    fontSize: SIZES.h2,
    ...FONTS.bold,
    lineHeight: 36,
    marginBottom: 10,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyName: {
    color: COLORS.textSecondary,
    fontSize: SIZES.lg,
    ...FONTS.medium,
  },
  companyWebsiteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.primary + '35',
    borderRadius: SIZES.radiusMd,
    padding: 12,
    marginTop: 12,
    gap: 12,
    ...SHADOWS.soft,
  },
  globeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyWebsiteLabel: {
    fontSize: 11,
    ...FONTS.semiBold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  companyWebsiteUrl: {
    fontSize: SIZES.sm,
    color: COLORS.primaryLight,
    ...FONTS.medium,
    marginTop: 2,
  },
  visitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
  },
  visitPillText: {
    color: '#fff',
    fontSize: 11,
    ...FONTS.bold,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.bgCard,
    borderRadius: SIZES.radiusMd,
    padding: 14,
    borderLeftWidth: 3,
    ...SHADOWS.soft,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoCardLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    ...FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCardValue: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    ...FONTS.semiBold,
  },

  // Portal banner
  portalCard: {
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  portalGradient: {
    padding: SIZES.paddingLg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  portalCardTitle: {
    color: COLORS.textWhite,
    fontSize: SIZES.md,
    ...FONTS.bold,
    marginBottom: 4,
  },
  portalCardDesc: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xs,
    lineHeight: 18,
  },
  portalApplyBtn: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  portalApplyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  portalApplyText: {
    color: '#fff',
    fontSize: SIZES.sm,
    ...FONTS.bold,
  },

  // Company Website Card
  companyWebsiteCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: SIZES.radiusMd,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  companyWebsiteTitle: {
    color: COLORS.accentGreen,
    fontSize: SIZES.sm,
    ...FONTS.bold,
  },
  companyWebsiteDesc: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
  },
  companyWebsiteBtn: {
    backgroundColor: COLORS.accentGreen,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusSm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyWebsiteBtnText: {
    color: '#fff',
    fontSize: SIZES.xs,
    ...FONTS.bold,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    ...FONTS.semiBold,
    marginBottom: 10,
  },
  descriptionText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  skillText: {
    color: COLORS.primaryLight,
    fontSize: SIZES.sm,
    ...FONTS.medium,
  },
  cityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radiusFull,
  },
  cityText: {
    fontSize: SIZES.md,
    ...FONTS.semiBold,
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    padding: SIZES.paddingXl,
    paddingBottom: 34,
    backgroundColor: COLORS.bgAccent,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.card,
  },
  portalActionBtn: {
    flex: 1.2,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  portalActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  portalActionText: {
    color: '#fff',
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
  externalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  externalBtnText: {
    color: '#fff',
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.paddingXl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalForm: {
    padding: SIZES.paddingXl,
    gap: 14,
    paddingBottom: 40,
  },
  formGroup: {
    gap: 6,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formLabel: {
    fontSize: SIZES.xs,
    ...FONTS.medium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  formInput: {
    backgroundColor: COLORS.bgInput,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: SIZES.inputHeight,
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
  },
  textArea: {
    height: 75,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    marginTop: 10,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  modalSubmitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
});

export default JobDetailScreen;

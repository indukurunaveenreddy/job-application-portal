import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation, route }) => {
  const { login, register, sendOtp, verifyOtp, quickLogin } = useAuth();

  // Mode: 'signin' | 'signup' | 'otp'
  const initialMode = route?.params?.initialMode || 'signin';
  const [activeTab, setActiveTab] = useState(initialMode);

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [role, setRole] = useState('job_seeker');

  // Sign Up State
  const [signupMethod, setSignupMethod] = useState('mobile'); // 'mobile' | 'email'
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // OTP State
  const [otpTarget, setOtpTarget] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 1. Handle Sign In
  const handleLogin = async () => {
    if (!loginIdentifier.trim()) {
      Alert.alert('Required Field', 'Please enter your email address or mobile phone number.');
      return;
    }

    try {
      setLoading(true);
      await login(loginIdentifier.trim(), loginPassword || 'nexhire123', role);
      Alert.alert('Welcome!', 'Signed in successfully.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Sign In Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Sign Up
  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }

    if (signupMethod === 'mobile' && !signupPhone.trim()) {
      Alert.alert('Required Field', 'Please enter your mobile phone number.');
      return;
    }

    if (signupMethod === 'email' && !signupEmail.trim()) {
      Alert.alert('Required Field', 'Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        email: signupEmail.trim(),
        phoneNumber: signupPhone.trim(),
        password: signupPassword || 'nexhire123',
      });

      Alert.alert('Welcome!', 'Account created and verified! You are now logged in.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Verify OTP (Optional)
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(otpTarget, otpCode.trim());
      Alert.alert('Success!', 'Phone & Email verified! You are now logged in.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Verification Failed', err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Resend OTP
  const handleResendOtp = async () => {
    if (!otpTarget) {
      Alert.alert('Missing Target', 'Please enter your mobile phone or email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(otpTarget);
      if (res.otp) {
        setLastGeneratedOtp(res.otp);
        setOtpCode(res.otp);
      }
      Alert.alert('OTP Resent!', `New OTP sent to ${otpTarget}: ${res.otp || 'Sent'}`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 5. One-Click Demo
  const handleQuickLogin = async (selectedRole) => {
    try {
      setLoading(true);
      await quickLogin(selectedRole);
      Alert.alert('Demo Active', `Logged in as ${selectedRole.replace('_', ' ')}.`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Demo Login Failed', err.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>
            {activeTab === 'signin' ? 'Sign In' : activeTab === 'signup' ? 'Create Account' : 'Verify OTP'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Branding */}
        <View style={styles.header}>
          <LinearGradient
            colors={COLORS.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBadge}
          >
            <Ionicons name="shield-checkmark" size={32} color={COLORS.textWhite} />
          </LinearGradient>
          <Text style={styles.title}>NexHire Portal</Text>
          <Text style={styles.subtitle}>
            {activeTab === 'signin'
              ? 'Sign in with your Email or Mobile Phone to apply and track jobs'
              : activeTab === 'signup'
              ? 'Sign up with Email or Mobile Number to apply and track jobs instantly'
              : `Enter the 6-digit OTP code sent to ${otpTarget || 'your phone'}`}
          </Text>
        </View>

        {/* 3-Way Mode Tabs */}
        <View style={styles.tabNav}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'signin' && styles.tabBtnActive]}
            onPress={() => setActiveTab('signin')}
          >
            <Ionicons
              name="log-in-outline"
              size={16}
              color={activeTab === 'signin' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabBtnText, activeTab === 'signin' && styles.tabBtnTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'signup' && styles.tabBtnActive]}
            onPress={() => setActiveTab('signup')}
          >
            <Ionicons
              name="person-add-outline"
              size={16}
              color={activeTab === 'signup' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabBtnText, activeTab === 'signup' && styles.tabBtnTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'otp' && styles.tabBtnActive]}
            onPress={() => setActiveTab('otp')}
          >
            <Ionicons
              name="key-outline"
              size={16}
              color={activeTab === 'otp' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.tabBtnText, activeTab === 'otp' && styles.tabBtnTextActive]}>
              Verify OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* ===================== TAB 1: SIGN IN ===================== */}
        {activeTab === 'signin' && (
          <View style={styles.form}>
            {/* Role Switcher */}
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleTab, role === 'job_seeker' && styles.roleTabActive]}
                onPress={() => setRole('job_seeker')}
              >
                <Ionicons
                  name="person"
                  size={15}
                  color={role === 'job_seeker' ? COLORS.primary : COLORS.textMuted}
                />
                <Text style={[styles.roleTabText, role === 'job_seeker' && styles.roleTabTextActive]}>
                  Job Seeker
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleTab, role === 'company_hr' && styles.roleTabActive]}
                onPress={() => setRole('company_hr')}
              >
                <Ionicons
                  name="business"
                  size={15}
                  color={role === 'company_hr' ? COLORS.primary : COLORS.textMuted}
                />
                <Text style={[styles.roleTabText, role === 'company_hr' && styles.roleTabTextActive]}>
                  Company HR
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email or Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address or Mobile Phone</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com or +91 98765 43210"
                  placeholderTextColor={COLORS.textDim}
                  autoCapitalize="none"
                  value={loginIdentifier}
                  onChangeText={setLoginIdentifier}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textDim}
                  secureTextEntry={!showPassword}
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textWhite} />
                ) : (
                  <>
                    <Text style={styles.btnText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.textWhite} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Go to OTP option */}
            <TouchableOpacity
              style={styles.textLinkRow}
              onPress={() => {
                if (loginIdentifier) setOtpTarget(loginIdentifier);
                setActiveTab('otp');
              }}
            >
              <Text style={styles.textLinkMuted}>Need to verify via OTP instead? </Text>
              <Text style={styles.textLinkHighlight}>Verify with OTP</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ===================== TAB 2: SIGN UP ===================== */}
        {activeTab === 'signup' && (
          <View style={styles.form}>
            {/* Method Toggle: Mobile vs Email */}
            <View style={styles.methodToggle}>
              <TouchableOpacity
                style={[styles.methodBtn, signupMethod === 'mobile' && styles.methodBtnActive]}
                onPress={() => setSignupMethod('mobile')}
              >
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={signupMethod === 'mobile' ? '#fff' : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.methodBtnText,
                    signupMethod === 'mobile' && styles.methodBtnTextActive,
                  ]}
                >
                  Sign Up with Mobile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodBtn, signupMethod === 'email' && styles.methodBtnActive]}
                onPress={() => setSignupMethod('email')}
              >
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color={signupMethod === 'email' ? '#fff' : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.methodBtnText,
                    signupMethod === 'email' && styles.methodBtnTextActive,
                  ]}
                >
                  Sign Up with Email
                </Text>
              </TouchableOpacity>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Candidate Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={COLORS.textDim}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* If Mobile Method */}
            {signupMethod === 'mobile' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Phone Number (Will Receive OTP)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={COLORS.textDim}
                    keyboardType="phone-pad"
                    value={signupPhone}
                    onChangeText={setSignupPhone}
                  />
                </View>
              </View>
            )}

            {/* If Email Method */}
            {signupMethod === 'email' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address (Will Receive OTP)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="rahul.sharma@example.com"
                    placeholderTextColor={COLORS.textDim}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={signupEmail}
                    onChangeText={setSignupEmail}
                  />
                </View>
              </View>
            )}

            {/* Optional second contact field */}
            {signupMethod === 'mobile' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address (Optional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com (optional)"
                    placeholderTextColor={COLORS.textDim}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={signupEmail}
                    onChangeText={setSignupEmail}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Phone (Optional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210 (optional)"
                    placeholderTextColor={COLORS.textDim}
                    keyboardType="phone-pad"
                    value={signupPhone}
                    onChangeText={setSignupPhone}
                  />
                </View>
              </View>
            )}

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Create Password (min. 6 chars)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textDim}
                  secureTextEntry={!showPassword}
                  value={signupPassword}
                  onChangeText={setSignupPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Action Button */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textWhite} />
                ) : (
                  <>
                    <Text style={styles.btnText}>Create Account & Sign In</Text>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.textWhite} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.textLinkRow} onPress={() => setActiveTab('signin')}>
              <Text style={styles.textLinkMuted}>Already registered? </Text>
              <Text style={styles.textLinkHighlight}>Sign In to Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ===================== TAB 3: VERIFY OTP ===================== */}
        {activeTab === 'otp' && (
          <View style={styles.form}>
            {/* Target identifier info */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Mobile Number to Verify</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="phone-portrait-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210 or user@email.com"
                  placeholderTextColor={COLORS.textDim}
                  value={otpTarget}
                  onChangeText={setOtpTarget}
                />
              </View>
            </View>

            {/* 6-Digit Code Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Enter 6-Digit Verification Code</Text>
              <View style={[styles.inputContainer, styles.otpContainer]}>
                <Ionicons name="key" size={22} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="123456"
                  placeholderTextColor={COLORS.textDim}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />
              </View>
            </View>

            {/* Simulation Helper Card */}
            {lastGeneratedOtp ? (
              <View style={styles.otpHelperCard}>
                <Ionicons name="information-circle" size={18} color={COLORS.accentGreen} />
                <Text style={styles.otpHelperText}>
                  Recent 6-Digit OTP: <Text style={{ fontWeight: 'bold', color: COLORS.accentGreen }}>{lastGeneratedOtp}</Text>
                </Text>
              </View>
            ) : null}

            {/* Verify Button */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleVerifyOtp}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textWhite} />
                ) : (
                  <>
                    <Text style={styles.btnText}>Verify OTP & Log In</Text>
                    <Ionicons name="checkmark-done" size={18} color={COLORS.textWhite} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend OTP Row */}
            <TouchableOpacity style={styles.resendBtn} onPress={handleResendOtp} disabled={loading}>
              <Ionicons name="refresh" size={16} color={COLORS.primary} />
              <Text style={styles.resendBtnText}>Resend 6-Digit OTP</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR ONE-CLICK DEMO LOGIN</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Demo Fast Login Buttons */}
        <View style={styles.demoButtonsContainer}>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => handleQuickLogin('job_seeker')}
            disabled={loading}
          >
            <Ionicons name="person-circle" size={20} color={COLORS.primary} />
            <Text style={styles.demoBtnText}>Job Seeker Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => handleQuickLogin('company_hr')}
            disabled={loading}
          >
            <Ionicons name="business" size={20} color={COLORS.accentGreen} />
            <Text style={styles.demoBtnText}>HR Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => handleQuickLogin('admin')}
            disabled={loading}
          >
            <Ionicons name="shield-checkmark" size={20} color={COLORS.accentOrange} />
            <Text style={styles.demoBtnText}>Admin Demo</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    padding: SIZES.paddingXl,
    paddingTop: 50,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topBarTitle: {
    fontSize: SIZES.lg,
    ...FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.button,
  },
  title: {
    fontSize: SIZES.h2,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: SIZES.sm,
    ...FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },

  // 3-Way Tabs
  tabNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgAccent,
    borderRadius: SIZES.radiusMd,
    padding: 4,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: SIZES.radiusSm,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.bgCardHover,
    borderColor: COLORS.primary + '50',
    borderWidth: 1,
  },
  tabBtnText: {
    fontSize: SIZES.xs,
    ...FONTS.medium,
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    color: COLORS.primary,
    ...FONTS.semiBold,
  },

  // Role Switcher
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgAccent,
    borderRadius: SIZES.radiusMd,
    padding: 3,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: SIZES.radiusSm,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: COLORS.bgCardHover,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  roleTabText: {
    fontSize: SIZES.xs,
    ...FONTS.medium,
    color: COLORS.textMuted,
  },
  roleTabTextActive: {
    color: COLORS.primary,
    ...FONTS.semiBold,
  },

  // Method Toggle for Sign Up
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgAccent,
    borderRadius: SIZES.radiusMd,
    padding: 3,
    marginBottom: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: SIZES.radiusSm,
    gap: 6,
  },
  methodBtnActive: {
    backgroundColor: COLORS.primary,
  },
  methodBtnText: {
    fontSize: SIZES.xs,
    ...FONTS.medium,
    color: COLORS.textMuted,
  },
  methodBtnTextActive: {
    color: '#fff',
    ...FONTS.semiBold,
  },

  // Form Elements
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: SIZES.xs,
    ...FONTS.medium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: SIZES.inputHeight,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    ...FONTS.regular,
  },
  otpContainer: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  otpInput: {
    fontSize: 22,
    letterSpacing: 8,
    ...FONTS.bold,
  },
  eyeBtn: {
    padding: 4,
  },
  actionBtn: {
    marginTop: 6,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  btnGradient: {
    height: SIZES.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnText: {
    color: COLORS.textWhite,
    fontSize: SIZES.md,
    ...FONTS.semiBold,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  resendBtnText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },
  textLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  textLinkMuted: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
  },
  textLinkHighlight: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },
  otpHelperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    padding: 10,
    borderRadius: SIZES.radiusSm,
  },
  otpHelperText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: SIZES.xs,
    ...FONTS.semiBold,
    color: COLORS.textDim,
    letterSpacing: 0.8,
  },
  demoButtonsContainer: {
    gap: 10,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgAccent,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 12,
    gap: 10,
  },
  demoBtnText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.sm,
    ...FONTS.medium,
  },
});

export default LoginScreen;

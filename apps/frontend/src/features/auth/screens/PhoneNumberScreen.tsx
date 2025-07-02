// src/features/auth/screens/PhoneNumberScreen.tsx
import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';

// Type fix for the PhoneInput component
const PhoneInputComponent = PhoneInput as any;

interface PhoneNumberScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const {height: screenHeight} = Dimensions.get('window');

export default function PhoneNumberScreen({
  navigation,
}: PhoneNumberScreenProps) {
  const phoneInput = useRef<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US'); // Default to US
  const [countryCode, setCountryCode] = useState('1'); // Default to +1

  const handleNext = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Phone Required', 'Please enter your phone number');
      return;
    }

    // Use the formatted value for validation if appropriate, or ensure
    // the check is done with the full number including the country code.
    // The library's isValidNumber usually expects the raw number.
    const checkValid = phoneInput.current?.isValidNumber(formattedValue);

    if (!checkValid) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid phone number for your country',
      );
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Simulate API call or processing time
      await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));

      console.log('Phone:', formattedValue);
      navigation.navigate('NameInputScreen', {phone: formattedValue});
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryChange = (country: any) => {
    console.log('Country changed:', country);
    setSelectedCountry(country.cca2);
    // Ensure callingCode exists and is an array before accessing
    if (country.callingCode && country.callingCode.length > 0) {
      setCountryCode(country.callingCode[0]);
    } else {
      // Fallback or handle cases where callingCode might be missing
      setCountryCode('');
    }
    setPhoneNumber(''); // Clear phone number when country changes
    setFormattedValue(''); // Clear formatted value too
  };

  const isValidNumber = formattedValue
    ? phoneInput.current?.isValidNumber(formattedValue)
    : false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ios: 'padding', android: 'height'})}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.progressIndicator}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>What's your phone number?</Text>
            <Text style={styles.subtitle}>
              We'll text you a verification code to keep your account secure
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Phone Number</Text>

            {/* Display selected country info - This will now update correctly */}
            <View style={styles.countryInfo}>
              <Text style={styles.countryInfoText}>
                Selected: {selectedCountry} (+{countryCode})
              </Text>
            </View>

            <View
              style={[
                styles.phoneInputWrapper,
                isFocused && styles.phoneInputWrapperFocused,
              ]}>
              <PhoneInputComponent
                key={selectedCountry} // <--- KEY CHANGE: Forces re-mount on country change
                ref={phoneInput}
                value={phoneNumber} // <--- KEY CHANGE: Use 'value' instead of 'defaultValue'
                defaultCode={selectedCountry}
                layout="first"
                onChangeText={(text: string) => {
                  setPhoneNumber(text);
                  console.log('Phone number changed:', text);
                }}
                onChangeFormattedText={(text: string) => {
                  setFormattedValue(text);
                  console.log('Formatted phone:', text);
                }}
                onChangeCountry={handleCountryChange} // Use the defined handler
                containerStyle={styles.phoneContainer}
                textContainerStyle={styles.textInput}
                textInputProps={{
                  placeholder: 'Enter phone number',
                  placeholderTextColor: '#666',
                  keyboardType: 'phone-pad',
                  returnKeyType: 'done',
                  onSubmitEditing: handleNext,
                  onFocus: () => setIsFocused(true),
                  onBlur: () => setIsFocused(false),
                  style: styles.phoneTextInput,
                }}
                countryPickerButtonStyle={styles.countryPicker}
                flagButtonStyle={styles.flagButton}
                codeTextStyle={styles.codeText}
                withShadow={false}
                autoFocus
                countryPickerProps={{
                  withFilter: true,
                  withFlag: true,
                  withCountryNameButton: false, // Keep this false if you only want flag + code
                  withCallingCodeButton: true,
                  withEmoji: false,
                  withAlphaFilter: true,
                  withCallingCode: true,
                  // <--- KEY CHANGE: Removed redundant onSelect
                  modalProps: {
                    animationType: 'slide',
                    transparent: false,
                  },
                  theme: {
                    backgroundColor: '#1a1a1a',
                    onBackgroundTextColor: '#fff',
                    fontSize: 16,
                    filterPlaceholderTextColor: '#666',
                    activeOpacity: 0.7,
                    itemHeight: 50,
                  },
                  flatListProps: {
                    style: {
                      maxHeight: screenHeight * 0.6,
                    },
                    showsVerticalScrollIndicator: true,
                    keyboardShouldPersistTaps: 'handled',
                  },
                }}
                disableArrowIcon={false}
              />
            </View>

            {/* Validation indicator - Updated to use 'isValidNumber' state */}
            {phoneNumber && (
              <View style={styles.validationContainer}>
                <View
                  style={[
                    styles.validationDot,
                    isValidNumber
                      ? styles.validationDotValid
                      : styles.validationDotInvalid,
                  ]}
                />
                <Text
                  style={[
                    styles.validationText,
                    isValidNumber
                      ? styles.validationTextValid
                      : styles.validationTextInvalid,
                  ]}>
                  {isValidNumber
                    ? 'Valid phone number'
                    : 'Please enter a valid phone number'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.button,
              isLoading && styles.buttonDisabled,
              (!phoneNumber || !isValidNumber) && styles.buttonInactive,
            ]}
            disabled={isLoading || !phoneNumber || !isValidNumber}
            accessible={true}
            accessibilityLabel="Continue button"
            accessibilityHint="Tap to proceed to the next step"
            activeOpacity={0.8}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.loadingText}>Verifying...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            By continuing, you agree to receive SMS messages for verification
            purposes. Standard message rates may apply.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Keep your existing styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  progressDotActive: {
    backgroundColor: '#1DB954',
    width: 24,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginLeft: 4,
  },
  countryInfo: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start', // Make it fit content
  },
  countryInfoText: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: '500',
  },
  phoneInputWrapper: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
    overflow: 'hidden', // Ensure inner content respects border radius
  },
  phoneInputWrapperFocused: {
    borderColor: '#1DB954',
    backgroundColor: '#222',
    shadowColor: '#1DB954',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  phoneContainer: {
    width: '100%',
    height: 64,
    backgroundColor: 'transparent',
    borderWidth: 0,
    // borderRadius: 16, // Apply radius to wrapper instead
  },
  textInput: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 0,
  },
  phoneTextInput: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    height: 50, // Ensure consistent height
    paddingVertical: 0, // Remove default padding if any
  },
  countryPicker: {
    backgroundColor: 'transparent',
    borderRightWidth: 1,
    borderRightColor: '#333',
    marginRight: 12,
    // minWidth: 80, // Adjust as needed
    // maxWidth: 100,
    justifyContent: 'center', // Center content vertically
    height: '100%', // Ensure it takes full height
  },
  flagButton: {
    backgroundColor: 'transparent',
    // Ensure padding/margin doesn't push content
  },
  codeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5, // Add some space after flag
  },
  validationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },
  validationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  validationDotValid: {
    backgroundColor: '#1DB954',
  },
  validationDotInvalid: {
    backgroundColor: '#ff4444',
  },
  validationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  validationTextValid: {
    color: '#1DB954',
  },
  validationTextInvalid: {
    color: '#ff4444',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 18,
    borderRadius: 16,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonInactive: {
    backgroundColor: '#333',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});

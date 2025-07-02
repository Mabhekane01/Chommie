// src/services/phoneUtils.service.ts
import {
  parsePhoneNumberWithError,
  isValidPhoneNumber,
  CountryCode,
} from "libphonenumber-js";

// Common country codes for social media apps
export const SUPPORTED_COUNTRIES: Record<
  string,
  { code: CountryCode; dialCode: string; name: string }
> = {
  // North America
  US: { code: "US", dialCode: "+1", name: "United States" },
  CA: { code: "CA", dialCode: "+1", name: "Canada" },

  // Europe
  GB: { code: "GB", dialCode: "+44", name: "United Kingdom" },
  DE: { code: "DE", dialCode: "+49", name: "Germany" },
  FR: { code: "FR", dialCode: "+33", name: "France" },
  IT: { code: "IT", dialCode: "+39", name: "Italy" },
  ES: { code: "ES", dialCode: "+34", name: "Spain" },
  NL: { code: "NL", dialCode: "+31", name: "Netherlands" },
  SE: { code: "SE", dialCode: "+46", name: "Sweden" },
  NO: { code: "NO", dialCode: "+47", name: "Norway" },
  DK: { code: "DK", dialCode: "+45", name: "Denmark" },
  FI: { code: "FI", dialCode: "+358", name: "Finland" },
  PL: { code: "PL", dialCode: "+48", name: "Poland" },
  CZ: { code: "CZ", dialCode: "+420", name: "Czech Republic" },
  AT: { code: "AT", dialCode: "+43", name: "Austria" },
  CH: { code: "CH", dialCode: "+41", name: "Switzerland" },
  BE: { code: "BE", dialCode: "+32", name: "Belgium" },
  PT: { code: "PT", dialCode: "+351", name: "Portugal" },
  GR: { code: "GR", dialCode: "+30", name: "Greece" },
  IE: { code: "IE", dialCode: "+353", name: "Ireland" },

  // Asia Pacific
  CN: { code: "CN", dialCode: "+86", name: "China" },
  JP: { code: "JP", dialCode: "+81", name: "Japan" },
  KR: { code: "KR", dialCode: "+82", name: "South Korea" },
  IN: { code: "IN", dialCode: "+91", name: "India" },
  ID: { code: "ID", dialCode: "+62", name: "Indonesia" },
  TH: { code: "TH", dialCode: "+66", name: "Thailand" },
  MY: { code: "MY", dialCode: "+60", name: "Malaysia" },
  SG: { code: "SG", dialCode: "+65", name: "Singapore" },
  PH: { code: "PH", dialCode: "+63", name: "Philippines" },
  VN: { code: "VN", dialCode: "+84", name: "Vietnam" },
  TW: { code: "TW", dialCode: "+886", name: "Taiwan" },
  HK: { code: "HK", dialCode: "+852", name: "Hong Kong" },
  AU: { code: "AU", dialCode: "+61", name: "Australia" },
  NZ: { code: "NZ", dialCode: "+64", name: "New Zealand" },

  // Middle East & Africa
  AE: { code: "AE", dialCode: "+971", name: "United Arab Emirates" },
  SA: { code: "SA", dialCode: "+966", name: "Saudi Arabia" },
  IL: { code: "IL", dialCode: "+972", name: "Israel" },
  TR: { code: "TR", dialCode: "+90", name: "Turkey" },
  EG: { code: "EG", dialCode: "+20", name: "Egypt" },
  ZA: { code: "ZA", dialCode: "+27", name: "South Africa" },
  NG: { code: "NG", dialCode: "+234", name: "Nigeria" },
  KE: { code: "KE", dialCode: "+254", name: "Kenya" },

  // Latin America
  BR: { code: "BR", dialCode: "+55", name: "Brazil" },
  MX: { code: "MX", dialCode: "+52", name: "Mexico" },
  AR: { code: "AR", dialCode: "+54", name: "Argentina" },
  CO: { code: "CO", dialCode: "+57", name: "Colombia" },
  CL: { code: "CL", dialCode: "+56", name: "Chile" },
  PE: { code: "PE", dialCode: "+51", name: "Peru" },
  VE: { code: "VE", dialCode: "+58", name: "Venezuela" },
  UY: { code: "UY", dialCode: "+598", name: "Uruguay" },
  EC: { code: "EC", dialCode: "+593", name: "Ecuador" },
};

interface PhoneValidationResult {
  isValid: boolean;
  normalizedNumber?: string;
  country?: string;
  countryCode?: string;
  nationalNumber?: string;
  internationalFormat?: string;
  error?: string;
}

interface CountryDetectionResult {
  detectedCountry?: CountryCode;
  confidence: "high" | "medium" | "low";
  possibleCountries?: CountryCode[];
}

/**
 * Detects the most likely country for a phone number
 * @param phoneNumber - The phone number to analyze
 * @param userCountryHint - Optional hint about user's country (from IP, profile, etc.)
 * @returns Country detection result
 */
export function detectPhoneCountry(
  phoneNumber: string,
  userCountryHint?: CountryCode
): CountryDetectionResult {
  try {
    // Clean the phone number
    const cleaned = phoneNumber.replace(/[^\d+]/g, "");

    // If number starts with +, try to parse directly
    if (cleaned.startsWith("+")) {
      const parsed = parsePhoneNumberWithError(cleaned);
      if (parsed && parsed.country) {
        return {
          detectedCountry: parsed.country,
          confidence: "high",
        };
      }
    }

    // Try with user country hint first
    if (userCountryHint) {
      try {
        const parsedWithHint = parsePhoneNumberWithError(
          cleaned,
          userCountryHint
        );
        if (parsedWithHint && parsedWithHint.isValid()) {
          return {
            detectedCountry: userCountryHint,
            confidence: "medium",
          };
        }
      } catch (error) {
        // Continue to other methods
      }
    }

    // Try common countries based on number patterns
    const possibleCountries: CountryCode[] = [];

    for (const [, countryInfo] of Object.entries(SUPPORTED_COUNTRIES)) {
      try {
        const testNumber = cleaned.startsWith("+")
          ? cleaned
          : `${countryInfo.dialCode}${cleaned}`;
        const parsed = parsePhoneNumberWithError(testNumber);
        if (parsed && parsed.isValid() && parsed.country === countryInfo.code) {
          possibleCountries.push(countryInfo.code);
        }
      } catch (error) {
        // Continue checking other countries
      }
    }

    if (possibleCountries.length === 1) {
      return {
        detectedCountry: possibleCountries[0],
        confidence: "medium",
      };
    } else if (possibleCountries.length > 1) {
      return {
        detectedCountry: possibleCountries[0], // Return first match
        confidence: "low",
        possibleCountries,
      };
    }

    return { confidence: "low" };
  } catch (error) {
    return { confidence: "low" };
  }
}

/**
 * Normalizes a phone number to international format with comprehensive validation
 * @param phoneNumber - The phone number to normalize
 * @param userCountryHint - Optional hint about user's country
 * @returns Validation and normalization result
 */
export function normalizePhoneNumber(
  phoneNumber: string,
  userCountryHint?: CountryCode
): PhoneValidationResult {
  try {
    // Basic input validation
    if (!phoneNumber || typeof phoneNumber !== "string") {
      return {
        isValid: false,
        error: "Phone number is required and must be a string",
      };
    }

    // Remove whitespace and common separators
    const cleaned = phoneNumber.trim().replace(/[\s\-\(\)\[\]\.]/g, "");

    // Check for minimum length
    if (cleaned.length < 7) {
      return {
        isValid: false,
        error: "Phone number is too short",
      };
    }

    // Check for maximum length
    if (cleaned.length > 20) {
      return {
        isValid: false,
        error: "Phone number is too long",
      };
    }

    // Check for invalid characters
    if (!/^[\+\d]+$/.test(cleaned)) {
      return {
        isValid: false,
        error: "Phone number contains invalid characters",
      };
    }

    // Detect country if not provided
    let targetCountry = userCountryHint;
    if (!targetCountry) {
      const detection = detectPhoneCountry(cleaned, userCountryHint);
      targetCountry = detection.detectedCountry;
    }

    // Try to parse with detected/provided country
    let parsed;
    if (targetCountry) {
      try {
        parsed = parsePhoneNumberWithError(cleaned, targetCountry);
      } catch (error) {
        // Try without country code
        try {
          parsed = parsePhoneNumberWithError(cleaned);
        } catch (innerError) {
          return {
            isValid: false,
            error: "Unable to parse phone number",
          };
        }
      }
    } else {
      // Try to parse without country code
      try {
        parsed = parsePhoneNumberWithError(cleaned);
      } catch (error) {
        return {
          isValid: false,
          error:
            "Unable to parse phone number - country could not be determined",
        };
      }
    }

    // Validate the parsed number
    if (!parsed || !parsed.isValid()) {
      return {
        isValid: false,
        error: "Invalid phone number format",
      };
    }

    return {
      isValid: true,
      normalizedNumber: parsed.number,
      country: parsed.country || undefined,
      countryCode: parsed.countryCallingCode,
      nationalNumber: parsed.nationalNumber,
      internationalFormat: parsed.formatInternational(),
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to process phone number: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Validates if a phone number is in a supported country
 * @param phoneNumber - The phone number to check
 * @returns Whether the phone number is from a supported country
 */
export function isSupportedCountry(phoneNumber: string): boolean {
  const validation = normalizePhoneNumber(phoneNumber);
  if (!validation.isValid || !validation.country) {
    return false;
  }

  return validation.country in SUPPORTED_COUNTRIES;
}

/**
 * Masks a phone number for logging and display purposes
 * @param phoneNumber - The phone number to mask
 * @param maskChar - Character to use for masking (default: *)
 * @param visibleDigits - Number of digits to show at start and end (default: 3)
 * @returns Masked phone number
 */
export function maskPhoneNumber(
  phoneNumber: string,
  maskChar: string = "*",
  visibleDigits: number = 3
): string {
  if (!phoneNumber) return "";

  // Clean the number first
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");

  if (cleaned.length <= visibleDigits * 2) {
    return maskChar.repeat(cleaned.length);
  }

  const start = cleaned.substring(0, visibleDigits);
  const end = cleaned.substring(cleaned.length - visibleDigits);
  const middle = maskChar.repeat(
    Math.max(3, cleaned.length - visibleDigits * 2)
  );

  return `${start}${middle}${end}`;
}

/**
 * Formats a phone number for display based on country
 * @param phoneNumber - The phone number to format
 * @param format - Format type ('international' | 'national' | 'e164')
 * @returns Formatted phone number
 */
export function formatPhoneNumber(
  phoneNumber: string,
  format: "international" | "national" | "e164" = "international"
): string {
  try {
    const parsed = parsePhoneNumberWithError(phoneNumber);
    if (!parsed || !parsed.isValid()) {
      return phoneNumber; // Return original if cannot parse
    }

    switch (format) {
      case "international":
        return parsed.formatInternational();
      case "national":
        return parsed.formatNational();
      case "e164":
        return parsed.number;
      default:
        return parsed.formatInternational();
    }
  } catch (error) {
    return phoneNumber; // Return original if error
  }
}

/**
 * Gets country information for a phone number
 * @param phoneNumber - The phone number to analyze
 * @returns Country information or null if not found
 */
export function getPhoneCountryInfo(
  phoneNumber: string
): (typeof SUPPORTED_COUNTRIES)[string] | null {
  const validation = normalizePhoneNumber(phoneNumber);
  if (!validation.isValid || !validation.country) {
    return null;
  }

  return SUPPORTED_COUNTRIES[validation.country] || null;
}

/**
 * Checks if two phone numbers are the same
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns Whether the numbers are equivalent
 */
export function arePhoneNumbersEqual(phone1: string, phone2: string): boolean {
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);

  if (!normalized1.isValid || !normalized2.isValid) {
    return false;
  }

  return normalized1.normalizedNumber === normalized2.normalizedNumber;
}

/**
 * Extracts country code from phone number
 * @param phoneNumber - The phone number
 * @returns Country calling code (e.g., "1", "44", "86")
 */
export function getCountryCallingCode(phoneNumber: string): string | null {
  const validation = normalizePhoneNumber(phoneNumber);
  return validation.isValid ? validation.countryCode || null : null;
}

/**
 * Gets supported countries list for frontend
 * @returns Array of supported countries with their information
 */
export function getSupportedCountries(): Array<{
  code: string;
  name: string;
  dialCode: string;
  flag?: string;
}> {
  return Object.entries(SUPPORTED_COUNTRIES).map(([code, info]) => ({
    code,
    name: info.name,
    dialCode: info.dialCode,
    // You can add flag emojis or URLs here if needed
  }));
}

/**
 * Validates multiple phone numbers at once
 * @param phoneNumbers - Array of phone numbers to validate
 * @param userCountryHint - Optional country hint
 * @returns Array of validation results
 */
export function validatePhoneNumbers(
  phoneNumbers: string[],
  userCountryHint?: CountryCode
): PhoneValidationResult[] {
  return phoneNumbers.map((phone) =>
    normalizePhoneNumber(phone, userCountryHint)
  );
}

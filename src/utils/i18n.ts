/**
 * Get localized text from API response with Lithuanian priority and English fallback
 * @param languages - Can be a string, Record<string, string>, or undefined
 * @param defaultName - Default name to use if no language data is available
 * @returns Lithuanian text if available, otherwise English, otherwise default name
 */
export function getLocalizedText(
  languages: string | Record<string, string> | undefined,
  defaultName: string
): string {
  // If languages is a string, return it directly
  if (typeof languages === "string") {
    return languages;
  }

  // If languages is an object, try Lithuanian first, then English
  if (languages && typeof languages === "object") {
    return languages.lt || languages.en || defaultName;
  }

  // Fallback to default name
  return defaultName;
}


type SafeParseResult =
  | {
      data: unknown;
      success: true;
    }
  | {
      error: unknown;
      success: false;
    };

export function safeParse(text: string): SafeParseResult {
  try {
    return { success: true, data: JSON.parse(text) };
  } catch (error) {
    return { success: false, error };
  }
}

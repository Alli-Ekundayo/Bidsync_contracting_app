import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse JSON-like strings. Returns the original input on failure.
 */
export function safeParseJson(input: any) {
  if (!input) return input;
  if (typeof input === 'object') return input;
  if (typeof input !== 'string') return input;
  try {
    const parsed = JSON.parse(input);
    // If double encoded (string inside string), unwrap
    if (typeof parsed === 'string') {
      try {
        return JSON.parse(parsed);
      } catch {
        return parsed;
      }
    }
    return parsed;
  } catch {
    // Attempt light cleanup and retry
    const cleaned = input
      .replace(/[\u0000-\u0019]+/g, '')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/:\s*'([^']*?)'\s*(,|})/g, ':"$1"$2');
    try {
      return JSON.parse(cleaned);
    } catch {
      return input;
    }
  }
}

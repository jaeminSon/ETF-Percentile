import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";

export type AgeSignalsStatus =
  | "SHARED"
  | "NOT_SHARED"
  | "VERIFICATION_REQUIRED"
  | "UNSPECIFIED"
  | "ERROR";

export type AgeSignals = {
  status: AgeSignalsStatus;
  /** The law where the user lives requires sharing an age range with apps. */
  mandatory: boolean;
  /** Inclusive age range when status is SHARED; ageUpper is null for the top band (e.g. 18+). */
  ageLower: number | null;
  ageUpper: number | null;
  /** Play AgeSignalsErrorCode when status is ERROR. */
  errorCode: number | null;
};

type NativeAgeSignals = {
  requestAgeSignals(): Promise<AgeSignals>;
  setTestResult(
    status: number | null,
    ageLower: number | null,
    ageUpper: number | null,
    mandatory: boolean,
  ): boolean;
};

const native =
  Platform.OS === "android" ? requireOptionalNativeModule<NativeAgeSignals>("AgeSignals") : null;

const UNAVAILABLE: AgeSignals = {
  status: "ERROR",
  mandatory: false,
  ageLower: null,
  ageUpper: null,
  errorCode: null,
};

/** Ask Google Play for the user's age range (Android only; resolves, never rejects). */
export async function requestAgeSignals(): Promise<AgeSignals> {
  if (!native) {
    return UNAVAILABLE;
  }
  try {
    return await native.requestAgeSignals();
  } catch {
    return UNAVAILABLE;
  }
}

/**
 * Debug builds only: make requestAgeSignals() return a canned result.
 * status: 1 SHARED, 2 NOT_SHARED, 3 VERIFICATION_REQUIRED; null restores the real Play Store.
 */
export function setTestResult(
  status: number | null,
  ageLower: number | null = null,
  ageUpper: number | null = null,
  mandatory = true,
): boolean {
  return native ? native.setTestResult(status, ageLower, ageUpper, mandatory) : false;
}

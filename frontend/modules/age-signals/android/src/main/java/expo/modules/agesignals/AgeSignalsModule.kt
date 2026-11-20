package expo.modules.agesignals

import android.content.pm.ApplicationInfo
import com.google.android.play.agesignals.AgeSignalsAccessRequest
import com.google.android.play.agesignals.AgeSignalsAccessResult
import com.google.android.play.agesignals.AgeSignalsException
import com.google.android.play.agesignals.AgeSignalsManager
import com.google.android.play.agesignals.AgeSignalsManagerFactory
import com.google.android.play.agesignals.AgeSignalsRequest
import com.google.android.play.agesignals.AgeSignalsResult
import com.google.android.play.agesignals.ApplicableAgeFeaturesRequest
import com.google.android.play.agesignals.ApplicableAgeFeaturesResult
import com.google.android.play.agesignals.model.AgeSignalsErrorCode
import com.google.android.play.agesignals.model.AgeSignalsStatus
import com.google.android.play.agesignals.model.ApplicableAgeFeature
import com.google.android.play.agesignals.testing.FakeAgeSignalsManager
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Thin wrapper around the Google Play Age Signals API.
 *
 * requestAgeSignals() resolves (never rejects) with:
 *   status     SHARED | NOT_SHARED | VERIFICATION_REQUIRED | UNSPECIFIED | ERROR
 *   mandatory  true when the law where the user lives requires age sharing
 *   ageLower / ageUpper  inclusive age range when SHARED (ageUpper null = top band, e.g. 18+)
 *   errorCode  AgeSignalsErrorCode when status is ERROR
 *
 * Google's prompt to share an age range is only shown where sharing is mandatory;
 * elsewhere the app just reads a range the user has already shared.
 */
class AgeSignalsModule : Module() {
  private var testManager: FakeAgeSignalsManager? = null

  private fun manager(): AgeSignalsManager? {
    testManager?.let { return it }
    val context = appContext.reactContext?.applicationContext ?: return null
    return AgeSignalsManagerFactory.create(context)
  }

  private fun isDebuggable(): Boolean {
    val flags = appContext.reactContext?.applicationInfo?.flags ?: 0
    return flags and ApplicationInfo.FLAG_DEBUGGABLE != 0
  }

  override fun definition() = ModuleDefinition {
    Name("AgeSignals")

    AsyncFunction("requestAgeSignals") { promise: Promise ->
      val manager = manager()
      if (manager == null) {
        promise.resolve(errorResult(false, AgeSignalsErrorCode.INTERNAL_ERROR))
        return@AsyncFunction
      }

      manager.getApplicableAgeFeatures(ApplicableAgeFeaturesRequest.builder().build())
        .addOnSuccessListener { features: ApplicableAgeFeaturesResult ->
          val mandatory = features.features().contains(ApplicableAgeFeature.MANDATORY_SHARING)
          if (mandatory) {
            requestAccessThenCheck(manager, promise)
          } else {
            check(manager, mandatory = false, promise)
          }
        }
        .addOnFailureListener {
          // Feature lookup failed: still try to read an already-shared range.
          check(manager, mandatory = false, promise)
        }
    }

    // Debug builds only: replace the Play Store with canned results for testing.
    // status: AgeSignalsStatus value (1 SHARED, 2 NOT_SHARED, 3 VERIFICATION_REQUIRED), null = use Play again.
    Function("setTestResult") { status: Int?, ageLower: Int?, ageUpper: Int?, mandatory: Boolean ->
      if (!isDebuggable()) return@Function false
      if (status == null) {
        testManager = null
        return@Function true
      }
      testManager = FakeAgeSignalsManager().apply {
        setNextApplicableAgeFeaturesResult(
          ApplicableAgeFeaturesResult.builder()
            .setFeatures(if (mandatory) setOf(ApplicableAgeFeature.MANDATORY_SHARING) else emptySet())
            .build()
        )
        setNextAgeSignalsAccessResult(
          AgeSignalsAccessResult.builder().setAgeSignalsStatus(status).build()
        )
        setNextAgeSignalsResult(
          AgeSignalsResult.builder()
            .setAgeLower(if (status == AgeSignalsStatus.SHARED) ageLower else null)
            .setAgeUpper(if (status == AgeSignalsStatus.SHARED) ageUpper else null)
            .build()
        )
      }
      true
    }
  }

  private fun requestAccessThenCheck(manager: AgeSignalsManager, promise: Promise) {
    val activity = appContext.currentActivity
    if (activity == null) {
      promise.resolve(errorResult(true, AgeSignalsErrorCode.INTERNAL_ERROR))
      return
    }
    manager.requestAgeSignalsAccess(AgeSignalsAccessRequest.builder().setActivity(activity).build())
      .addOnSuccessListener { access ->
        when (access.ageSignalsStatus()) {
          AgeSignalsStatus.SHARED -> check(manager, mandatory = true, promise)
          else -> promise.resolve(statusResult(true, access.ageSignalsStatus()))
        }
      }
      .addOnFailureListener { e -> promise.resolve(errorResult(true, errorCode(e))) }
  }

  private fun check(manager: AgeSignalsManager, mandatory: Boolean, promise: Promise) {
    manager.checkAgeSignals(AgeSignalsRequest.builder().build())
      .addOnSuccessListener { result ->
        val lower = result.ageLower()
        if (lower == null) {
          promise.resolve(statusResult(mandatory, AgeSignalsStatus.NOT_SHARED))
        } else {
          promise.resolve(
            mapOf(
              "status" to "SHARED",
              "mandatory" to mandatory,
              "ageLower" to lower,
              "ageUpper" to result.ageUpper(),
              "errorCode" to null,
            )
          )
        }
      }
      .addOnFailureListener { e -> promise.resolve(errorResult(mandatory, errorCode(e))) }
  }

  private fun statusResult(mandatory: Boolean, status: Int?): Map<String, Any?> = mapOf(
    "status" to when (status) {
      AgeSignalsStatus.SHARED -> "SHARED"
      AgeSignalsStatus.NOT_SHARED -> "NOT_SHARED"
      AgeSignalsStatus.VERIFICATION_REQUIRED -> "VERIFICATION_REQUIRED"
      else -> "UNSPECIFIED"
    },
    "mandatory" to mandatory,
    "ageLower" to null,
    "ageUpper" to null,
    "errorCode" to null,
  )

  private fun errorResult(mandatory: Boolean, code: Int): Map<String, Any?> = mapOf(
    "status" to "ERROR",
    "mandatory" to mandatory,
    "ageLower" to null,
    "ageUpper" to null,
    "errorCode" to code,
  )

  private fun errorCode(e: Exception): Int =
    (e as? AgeSignalsException)?.errorCode ?: AgeSignalsErrorCode.INTERNAL_ERROR
}

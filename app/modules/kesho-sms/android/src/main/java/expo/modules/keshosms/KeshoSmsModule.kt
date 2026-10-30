package expo.modules.keshosms

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Kesho's tiny native helper: reads M-Pesa messages from the phone's SMS inbox.
// Read-only. Only messages whose sender contains "MPESA" / "M-PESA". Nothing leaves the phone.
class KeshoSmsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("KeshoSms")

    // sinceMs: only messages newer than this time (milliseconds). limit: max messages returned.
    AsyncFunction("readMpesaInbox") { sinceMs: Double, limit: Int ->
      val context = appContext.reactContext
        ?: throw Exception("Android context not available")

      if (context.checkSelfPermission(Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
        throw Exception("READ_SMS permission not granted")
      }

      val results = ArrayList<Map<String, Any?>>()
      val cursor = context.contentResolver.query(
        Uri.parse("content://sms/inbox"),
        arrayOf("_id", "address", "body", "date"),
        "date > ? AND (address LIKE ? OR address LIKE ?)",
        arrayOf(sinceMs.toLong().toString(), "%MPESA%", "%M-PESA%"),
        "date ASC"
      )

      cursor?.use { c ->
        val idCol = c.getColumnIndexOrThrow("_id")
        val addressCol = c.getColumnIndexOrThrow("address")
        val bodyCol = c.getColumnIndexOrThrow("body")
        val dateCol = c.getColumnIndexOrThrow("date")
        while (c.moveToNext() && results.size < limit) {
          results.add(
            mapOf(
              "id" to c.getLong(idCol).toString(),
              "address" to (c.getString(addressCol) ?: ""),
              "body" to (c.getString(bodyCol) ?: ""),
              "date" to c.getLong(dateCol).toDouble()
            )
          )
        }
      }

      results
    }
  }
}

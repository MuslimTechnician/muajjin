# Muajjin - ProGuard Rules for Capacitor React App
# Optimized for minimal APK size

# Keep line numbers for debugging (remove in production for smaller size)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ============================================
# Capacitor Plugin Rules
# ============================================
-keep @com.getcapacitor.annotation.CapacitorPlugin class * {
  @com.getcapacitor.annotation.ActivityCallback <methods>;
  @com.getcapacitor.annotation.Permission <methods>;
}

-keep @com.getcapacitor.annotation.CapacitorPlugin class * {
  public <methods>;
  public <fields>;
}

-keepclassmembers class * {
  @com.capacitorjs.JSExport <methods>;
  @com.capacitorjs.JSExport <fields>;
}

# ============================================
# Cordova Plugins
# ============================================
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# ============================================
# WebView and JavaScript Interface
# ============================================
-keepclassmembers class * {
  @android.webkit.JavascriptInterface <methods>;
}

-keepclasseswithmembernames class * {
  @android.webkit.JavascriptInterface <methods>;
}

# ============================================
# AndroidX and Support Library
# ============================================
-keep class android.support.** { *; }
-keep interface android.support.** { *; }
-dontwarn android.support.**

-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-dontwarn androidx.**

# ============================================
# Kotlin (if used)
# ============================================
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
  <fields>;
}
-keepclassmembers class kotlin.Metadata {
  public <methods>;
}

# ============================================
# React Native (if used)
# ============================================
-keep class com.facebook.** { *; }
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.**
-dontwarn com.facebook.react.**

# ============================================
# OkHttp (commonly used)
# ============================================
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# ============================================
# Gson (JSON parsing)
# ============================================
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# ============================================
# Java Native Interface (JNI)
# ============================================
-keepclasseswithmembernames class * {
  native <methods>;
}

# ============================================
# Enums
# ============================================
-keepclassmembers enum * {
  public static **[] values();
  public static ** valueOf(java.lang.String);
}

# ============================================
# Parcelable
# ============================================
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# ============================================
# Serializable
# ============================================
-keepclassmembers class * implements java.io.Serializable {
  static final long serialVersionUID;
  private static final java.io.ObjectStreamField[] serialPersistentFields;
  private void writeObject(java.io.ObjectOutputStream);
  private void readObject(java.io.ObjectInputStream);
  java.lang.Object writeReplace();
  java.lang.Object readResolve();
}

# ============================================
# Reflection
# ============================================
-keepclassmembers class * {
  @com.google.gson.annotations.SerializedName <fields>;
}

-keep class * {
  @com.google.gson.annotations.SerializedName <fields>;
}

# ============================================
# Preserve all native method names and names of
# classes that contain native methods
# ============================================
-keepclasseswithmembernames class * {
  native <methods>;
}

# ============================================
# Remove logging in release builds for smaller size
# ============================================
-assumenosideeffects class android.util.Log {
  public static *** d(...);
  public static *** v(...);
  public static *** i(...);
}

# ============================================
# Optimization Settings
# ============================================
# Don't optimize for specific classes that may cause issues
-keep class javax.** { *; }
-keep interface javax.** { *; }
-dontwarn javax.**

# ============================================
# Geolocation Plugin
# ============================================
-keep class com.getcapacitor.plugin.** { *; }
-dontwarn com.getcapacitor.plugin.**

# ============================================
# App Plugin
# ============================================
-keep class com.capacitorjs.** { *; }
-dontwarn com.capacitorjs.**

# ============================================
# Additional general rules
# ============================================
-keep class * implements java.lang.reflect.InvocationHandler

# Prevent obfuscation of classes with JavaScript bindings
-keepattributes *Annotation*
-keepattributes *EnclosingMethod*
-keepattributes InnerClasses

# Keep WebView JavaScript interface
-keepclassmembers class * {
  @android.webkit.JavascriptInterface <methods>;
}

# Don't warn about missing classes that aren't used
-dontwarn org.apache.commons.**
-dontwarn org.junit.**
-dontwarn org.slf4j.**
-dontwarn javax.naming.**
-dontwarn javax.lang.**
-dontwarn java.lang.invoke.**

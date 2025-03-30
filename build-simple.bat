@echo off
echo تصدير تطبيق مواقيت بصيغة APK...
echo.

REM ضبط متغيرات البيئة مباشرة
set JAVA_HOME=C:\Program Files\Java\jre1.8.0_441
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%PATH%

echo JAVA_HOME مضبوط على: %JAVA_HOME%
echo ANDROID_HOME مضبوط على: %ANDROID_HOME%
echo.

REM التحقق من وجود مجلد android
if not exist android (
    echo [خطأ] مجلد android غير موجود!
    echo يجب تنفيذ expo prebuild أولاً
    goto :end
)

REM التنقل إلى مجلد android
echo الانتقال إلى مجلد android...
cd android

REM التحقق من وجود ملف gradlew
if not exist gradlew.bat (
    echo [خطأ] ملف gradlew.bat غير موجود في مجلد android!
    goto :end
)

REM تنفيذ عملية البناء باستخدام معلمة --warning-mode=none لتجاهل التحذيرات
echo بدء عملية بناء APK...
echo قد تستغرق هذه العملية بضع دقائق، يرجى الانتظار...
call gradlew --no-daemon :app:assembleRelease -x lint --warning-mode=none

REM التحقق من وجود ملف APK
if exist app\build\outputs\apk\release\app-release-unsigned.apk (
    echo.
    echo تم بناء APK بنجاح!
    echo موقع الملف: %cd%\app\build\outputs\apk\release\app-release-unsigned.apk
    echo.
    
    REM نسخ الملف إلى المجلد الرئيسي
    copy app\build\outputs\apk\release\app-release-unsigned.apk ..\moaqit.apk
    echo تم نسخ ملف APK إلى المجلد الرئيسي باسم moaqit.apk
) else if exist app\build\outputs\apk\release\app-release.apk (
    echo.
    echo تم بناء APK بنجاح!
    echo موقع الملف: %cd%\app\build\outputs\apk\release\app-release.apk
    echo.
    
    REM نسخ الملف إلى المجلد الرئيسي
    copy app\build\outputs\apk\release\app-release.apk ..\moaqit.apk
    echo تم نسخ ملف APK إلى المجلد الرئيسي باسم moaqit.apk
) else (
    echo.
    echo [خطأ] لم يتم العثور على ملف APK في المسار المتوقع بعد البناء.
    echo تحقق من الأخطاء أعلاه.
)

REM العودة إلى المجلد الرئيسي
cd ..

:end
echo.
echo انتهت العملية. اضغط أي مفتاح للخروج...
pause > nul
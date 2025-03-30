@echo on
echo ضبط متغيرات البيئة لبناء تطبيق أندرويد...

REM ضبط متغير JAVA_HOME للإشارة إلى JDK بدلاً من JRE
set JAVA_HOME=C:\Program Files\Java\jdk-24
echo تم ضبط JAVA_HOME: %JAVA_HOME%

REM التحقق من وجود JDK
IF NOT EXIST "%JAVA_HOME%\bin\javac.exe" (
  echo [تحذير] لم يتم العثور على JDK في المسار المحدد.
  echo المسار الحالي لـ JAVA_HOME: %JAVA_HOME%
  echo قد تحتاج إلى تثبيت JDK أو تعديل المسار يدوياً في هذا الملف.
  echo يمكنك تنزيل JDK من: https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html
  goto :ask_continue
)

REM ضبط متغير ANDROID_HOME
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
echo تم ضبط ANDROID_HOME: %ANDROID_HOME%

REM التحقق من وجود Android SDK
IF NOT EXIST "%ANDROID_HOME%" (
  echo [تحذير] لم يتم العثور على Android SDK في المسار المحدد.
  echo المسار الحالي لـ ANDROID_HOME: %ANDROID_HOME%
  echo قد تحتاج إلى تثبيت Android SDK أو تعديل المسار يدوياً في هذا الملف.
  echo يمكنك تثبيت Android SDK من خلال Android Studio: https://developer.android.com/studio
  goto :ask_continue
)

echo تم ضبط متغيرات البيئة بنجاح.
echo يمكنك الآن تشغيل build-android.bat لبناء التطبيق.
goto :end

:ask_continue
echo.
set /p CONTINUE=هل ترغب في الاستمرار على الرغم من التحذيرات؟ (Y/N): 
if /i "%CONTINUE%"=="Y" goto :end
if /i "%CONTINUE%"=="y" goto :end
echo تم إلغاء العملية.
exit /b 1

:end
echo.
echo اضغط أي مفتاح للخروج...
pause > nul
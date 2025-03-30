@echo on
echo بدء عملية إنشاء تطبيق الأندرويد...
echo تاريخ التنفيذ: %date% %time% > build-log.txt
echo. >> build-log.txt

REM ضبط متغيرات البيئة مباشرة في هذا الملف
set JAVA_HOME=C:\Program Files\Java\jdk-24
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
echo تم ضبط JAVA_HOME: %JAVA_HOME% >> build-log.txt
echo تم ضبط ANDROID_HOME: %ANDROID_HOME% >> build-log.txt

REM إنشاء ملف لحفظ المعلومات وتتبع الأخطاء
echo ========================= >> build-log.txt
echo معلومات النظام: >> build-log.txt
systeminfo | findstr /B /C:"OS Name" /C:"OS Version" >> build-log.txt
echo. >> build-log.txt

REM التحقق من متطلبات البناء
echo التحقق من وجود Node.js...
where node >> build-log.txt 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo [خطأ] لم يتم العثور على Node.js! يجب تثبيته أولًا.
  echo [خطأ] لم يتم العثور على Node.js! يجب تثبيته أولًا. >> build-log.txt
  goto :show_error
)

echo التحقق من وجود NPM...
where npm >> build-log.txt 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo [خطأ] لم يتم العثور على NPM! تأكد من تثبيت Node.js بشكل صحيح.
  echo [خطأ] لم يتم العثور على NPM! تأكد من تثبيت Node.js بشكل صحيح. >> build-log.txt
  goto :show_error
)

echo التحقق من وجود Java...
where java >> build-log.txt 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo [خطأ] لم يتم العثور على Java JDK! يجب تثبيته أولًا.
  echo [خطأ] لم يتم العثور على Java JDK! يجب تثبيته أولًا. >> build-log.txt
  goto :show_error
)

echo التحقق من متغير JAVA_HOME...
IF "%JAVA_HOME%"=="" (
  echo [خطأ] متغير البيئة JAVA_HOME غير معين.
  echo [خطأ] متغير البيئة JAVA_HOME غير معين. >> build-log.txt
  echo يرجى تعيين متغير البيئة JAVA_HOME ليشير إلى مسار Java JDK.
  echo تأكد من أنه يشير إلى JDK وليس JRE
  goto :show_error
)
echo متغير JAVA_HOME = %JAVA_HOME% >> build-log.txt

REM التحقق مما إذا كان JAVA_HOME يشير إلى JRE أو JDK
echo التحقق من نوع Java المستخدم...
IF EXIST "%JAVA_HOME%\bin\javac.exe" (
  echo تم العثور على JDK في مسار JAVA_HOME. >> build-log.txt
) ELSE (
  echo [خطأ] متغير JAVA_HOME يشير إلى JRE وليس JDK.
  echo [خطأ] متغير JAVA_HOME يشير إلى JRE وليس JDK. >> build-log.txt
  echo للتطوير على Android، تحتاج إلى Java JDK وليس JRE.
  echo يرجى تثبيت JDK من موقع Oracle، ثم تعيين JAVA_HOME للإشارة إليه.
  goto :show_error
)

echo التحقق من متغير ANDROID_HOME...
IF "%ANDROID_HOME%"=="" (
  echo [خطأ] متغير البيئة ANDROID_HOME غير معين.
  echo متغير البيئة ANDROID_HOME سيُضبط تلقائيًا إلى المسار الافتراضي...
  set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
  echo ANDROID_HOME=%ANDROID_HOME%
)
echo متغير ANDROID_HOME = %ANDROID_HOME% >> build-log.txt

REM التحقق من وجود مجلد Android SDK
IF NOT EXIST "%ANDROID_HOME%" (
  echo [خطأ] لم يتم العثور على Android SDK في المسار %ANDROID_HOME%
  echo [خطأ] لم يتم العثور على Android SDK في المسار المحدد. >> build-log.txt
  echo يرجى تثبيت Android SDK أو تعيين ANDROID_HOME إلى المسار الصحيح.
  goto :show_error
)

REM تحضير مجلد Android إذا لم يكن موجودًا
IF NOT EXIST android (
  echo مجلد android غير موجود، جاري تشغيل expo prebuild...
  echo. >> build-log.txt
  echo تنفيذ expo prebuild... >> build-log.txt
  call npx expo prebuild --no-clean >> build-log.txt 2>&1
  
  IF %ERRORLEVEL% NEQ 0 (
    echo [خطأ] فشل تنفيذ expo prebuild. انظر build-log.txt للتفاصيل.
    echo [خطأ] فشل تنفيذ expo prebuild >> build-log.txt
    goto :show_error
  )
) ELSE (
  echo مجلد android موجود بالفعل، نحاول تحديثه...
  echo. >> build-log.txt
  echo تنفيذ expo prebuild --no-clean... >> build-log.txt
  call npx expo prebuild --no-clean >> build-log.txt 2>&1
)

IF NOT EXIST android (
  echo [خطأ] لم يتم إنشاء مجلد android بعد تنفيذ prebuild. يبدو أن هناك مشكلة في الإعدادات.
  echo [خطأ] لم يتم إنشاء مجلد android >> build-log.txt
  goto :show_error
)

echo الدخول إلى مجلد android...
cd android

REM التحقق من وجود ملف gradlew
IF NOT EXIST gradlew.bat (
  echo [خطأ] ملف gradlew.bat غير موجود في مجلد android.
  echo [خطأ] ملف gradlew.bat غير موجود >> ..\build-log.txt
  cd ..
  goto :show_error
)

echo جاري بناء ملف APK...
echo. >> ..\build-log.txt
echo بدء عملية بناء APK بواسطة Gradle... >> ..\build-log.txt
call gradlew.bat clean >> ..\build-log.txt 2>&1
call gradlew.bat assembleRelease --info >> ..\build-log.txt 2>&1

IF %ERRORLEVEL% NEQ 0 (
  echo [خطأ] فشل بناء ملف APK (رمز الخطأ: %ERRORLEVEL%).
  echo انظر build-log.txt للتفاصيل.
  echo [خطأ] فشل بناء ملف APK (رمز الخطأ: %ERRORLEVEL%) >> ..\build-log.txt
  cd ..
  goto :show_error
)

IF EXIST app\build\outputs\apk\release\app-release.apk (
  echo.
  echo تم بناء التطبيق بنجاح!
  echo موقع ملف APK: %cd%\app\build\outputs\apk\release\app-release.apk
  
  REM نسخ الملف إلى مجلد المشروع الرئيسي
  copy app\build\outputs\apk\release\app-release.apk ..\moaqit.apk
  echo تم نسخ ملف APK إلى المجلد الرئيسي للمشروع باسم moaqit.apk
  
  echo. >> ..\build-log.txt
  echo تم البناء بنجاح! >> ..\build-log.txt
  echo تم نسخ ملف APK إلى المجلد الرئيسي للمشروع باسم moaqit.apk >> ..\build-log.txt
) ELSE (
  echo.
  echo [خطأ] لم يتم العثور على ملف APK في المسار المتوقع بعد البناء.
  echo [خطأ] لم يتم العثور على ملف APK في المسار المتوقع >> ..\build-log.txt
  cd ..
  goto :show_error
)

cd ..
goto :end

:show_error
echo.
echo ======================================
echo حدث خطأ أثناء عملية البناء.
echo تم حفظ التفاصيل في ملف build-log.txt
echo ======================================
echo.

:end
echo.
echo اضغط أي مفتاح للخروج...
pause > nul

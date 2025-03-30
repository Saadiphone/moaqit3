@echo off
echo ==============================================
echo تحقق من حالة البيئة لتطوير تطبيق أندرويد
echo ==============================================
echo.

echo --- معلومات النظام ---
ver
echo.

echo --- متغيرات البيئة المهمة ---
echo JAVA_HOME = %JAVA_HOME%
echo ANDROID_HOME = %ANDROID_HOME%
echo.

echo --- التحقق من أدوات التطوير الأساسية ---
echo جاري التحقق من Java...
where java 2>nul
if %ERRORLEVEL% neq 0 echo [خطأ] Java غير موجود في PATH!
if %ERRORLEVEL% equ 0 java -version

echo.
echo جاري التحقق من JDK (javac)...
where javac 2>nul
if %ERRORLEVEL% neq 0 echo [خطأ] JDK (javac) غير موجود في PATH!
if %ERRORLEVEL% equ 0 javac -version

echo.
echo جاري التحقق من Node.js...
where node 2>nul
if %ERRORLEVEL% neq 0 echo [خطأ] Node.js غير موجود في PATH!
if %ERRORLEVEL% equ 0 node --version

echo.
echo جاري التحقق من NPM...
where npm 2>nul
if %ERRORLEVEL% neq 0 echo [خطأ] NPM غير موجود في PATH!
if %ERRORLEVEL% equ 0 npm --version

echo.
echo جاري التحقق من أدوات Android SDK الأساسية...
if not exist "%ANDROID_HOME%" (
    echo [خطأ] مجلد Android SDK غير موجود: %ANDROID_HOME%
) else (
    echo Android SDK موجود في: %ANDROID_HOME%
    
    if exist "%ANDROID_HOME%\tools\bin\sdkmanager.bat" (
        echo sdkmanager موجود
    ) else (
        echo [خطأ] sdkmanager غير موجود!
    )
    
    if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
        echo adb موجود
    ) else (
        echo [خطأ] adb غير موجود!
    )
    
    if exist "%ANDROID_HOME%\build-tools" (
        echo build-tools موجود
    ) else (
        echo [خطأ] build-tools غير موجود!
    )
)

echo.
echo ==============================================
echo انتهى التحقق من البيئة
echo ==============================================
echo.
echo اضغط أي مفتاح للخروج...
pause > nul

@echo off
echo بدء إصلاح مشكلة مجلد android...
echo.

REM تأكد من إغلاق أي برامج تستخدم مجلد android
echo يرجى إغلاق أي برامج تستخدم مجلد android (مثل VS Code، أو Android Studio، أو مستكشف الملفات)
echo.
pause

REM محاولة إعادة تسمية المجلد إذا كان موجودًا
IF EXIST android (
  echo محاولة إعادة تسمية مجلد android...
  
  REM إنشاء اسم فريد باستخدام التاريخ والوقت الحاليين
  set timestamp=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
  set timestamp=%timestamp: =0%
  
  REM محاولة إعادة التسمية
  ren android android_old_%timestamp% 2>nul
  
  IF EXIST android (
    echo [فشل] لا يزال مجلد android مستخدمًا بواسطة عملية أخرى.
    echo يرجى اتباع الخطوات التالية يدويًا:
    echo 1. أغلق جميع البرامج التي قد تستخدم ملفات داخل مجلد android
    echo 2. أعد تشغيل الكمبيوتر إذا لزم الأمر
    echo 3. احذف مجلد android يدويًا
  ) ELSE (
    echo [نجاح] تمت إعادة تسمية مجلد android لـ android_old_%timestamp%
    echo يمكنك الآن تشغيل الأمر: npx expo prebuild
  )
) ELSE (
  echo مجلد android غير موجود. يمكنك تشغيل الأمر: npx expo prebuild
)

echo.
echo يمكنك أيضًا تجربة الأمر التالي الذي لا يحاول حذف مجلد android الحالي:
echo npx expo prebuild --no-clean
echo.

pause

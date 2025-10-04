import * as Cesium from "cesium";

type CameraLockProps = {
  viewer: Cesium.Viewer;
  target: Cesium.Entity;
  distance?: number; // מרחק בפריים המקומי (ציר X)
  baseHeight?: number; // גובה בפריים המקומי (ציר Z)
};

export function initThirdPersonCameraLock({
  viewer,
  target: drone,
  distance = 80,
  baseHeight = 80,
}: CameraLockProps) {
  let active = true;

  // --- הגדרת האופסט הרצוי במערכת צירים מקומית (Local Frame) ---
  // מיקום המצלמה בפריים המקומי:
  // X = -distance (מאחורי הרחפן)
  // Y = 0 (במרכז)
  // Z = baseHeight (למעלה)
  const baseOffset = new Cesium.Cartesian3(-distance, 0, baseHeight);

  // --- סיבוב של 180 מעלות (פאי רדיאנים) סביב ציר Z המקומי ---
  // מטריצת סיבוב המייצרת היסט של 180 מעלות.
  // אנחנו משתמשים ב-Z (UP) כציר הסיבוב כדי לבצע פליפ (Flip) אופקי.
  const flipRotation = Cesium.Matrix3.fromRotationZ(Cesium.Math.PI);

  // --- משתנים זמניים ---
  const scratchCameraLocalOffset = new Cesium.Cartesian3();
  const scratchTransform = new Cesium.Matrix4();
  const scratchFinalTransform = new Cesium.Matrix4();
  
  const tickHandler = (_scene: Cesium.Scene, time: Cesium.JulianDate) => {
    if (!active || !drone.position || !drone.orientation) return;

    const dronePos = drone.position.getValue(time) as Cesium.Cartesian3;
    const quat = drone.orientation.getValue(time) as Cesium.Quaternion;

    if (!dronePos || !quat) return;

    // 1. יצירת מטריצת טרנספורמציה גלובלית של הרחפן
    // הטרנספורמציה הזו מעבירה מהפריים המקומי של הרחפן לפריים העולמי (EN-U).
    Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromQuaternion(quat),
        dronePos,
        scratchTransform
    );

    // 2. חישוב האופסט המקומי המסובב
    // הכפלת האופסט הבסיסי במטריצת הסיבוב של 180 מעלות. 
    // זה *ממקם* את המצלמה בנקודה שונה בפריים המקומי.
    Cesium.Matrix3.multiplyByVector(
        flipRotation,
        baseOffset,
        scratchCameraLocalOffset // העתקת התוצאה
    );
    
    // 3. שימוש ב-lookAtTransform עם האופסט המסובב
    // השיטה הטובה ביותר לעקוב אחר אובייקט עם אוריינטציה משתנה.
    // הפונקציה ממקמת את המצלמה במיקום שחושב על בסיס ה-scratchCameraLocalOffset
    // (שכבר מכיל את ה-180 מעלות) ומכוונת אותה אל הרחפן.
    viewer.camera.lookAtTransform(
        scratchTransform,
        baseOffset // שימוש באופסט הבסיסי שוב, כיוון ש-lookAtTransform מתייחסת אליו כאל מיקום
    );
    
    // --- שימוש ב-lookAtTransform עם מטריצה מורכבת (אלטרנטיבה) ---
    // זוהי דרך נקייה יותר להבטיח את הסיבוב המלא: יצירת טרנספורמציה חדשה
    // המשלבת את הטרנספורמציה של הרחפן עם סיבוב המצלמה המקומי.
    // Cesium.Matrix4.multiply(scratchTransform, Cesium.Matrix4.fromRotation(flipRotation), scratchFinalTransform);
    // viewer.camera.lookAtTransform(
    //     scratchFinalTransform,
    //     baseOffset 
    // );
    
    // --- הפתרון הנקי ביותר ---
    // למעשה, הפתרון הכי פשוט ויציב הוא פשוט להשתמש ב-*אותו* אופסט, 
    // אבל **להפוך** את כיוון ה-X, כלומר למקם את המצלמה **לפני** הרחפן
    // אם זו הכוונה של "180 מעלות היסט". 
    // אם המטרה היא פשוט להסתכל אחורה בזווית קבועה, אז צריך לשנות את ה-Pitch.
    
    // נחזור לפתרון הקודם והיציב, ונשנה את ה-Offset המקומי פעם אחת כדי שיכלול את ה-180 מעלות
    viewer.camera.lookAtTransform(
        scratchTransform,
        new Cesium.Cartesian3(distance, 0, baseHeight) // שינוי X לחיוב - המצלמה עברה מקדימה לאחורה ב-180 מעלות!
    );
  };

  // הוספת ה-tick handler
  viewer.clock.onTick.addEventListener(tickHandler);

  // פונקציית ניקוי
  return () => {
    active = false;
    viewer.clock.onTick.removeEventListener(tickHandler);
  };
}
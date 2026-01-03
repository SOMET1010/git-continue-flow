import { getDb } from "./db";
import { merchantDailyLogins } from "../drizzle/schema-daily-logins";
import { eq, and } from "drizzle-orm";

/**
 * Helper to format date as YYYY-MM-DD string for PostgreSQL date columns
 */
function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Enregistrer un login quotidien pour un marchand
 * Retourne true si c'est le premier login du jour
 */
export async function recordDailyLogin(merchantId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const today = new Date();
  const todayStr = formatDateString(today);
  
  try {
    // Vérifier si un login existe déjà aujourd'hui
    const existingLogin = await db.select()
      .from(merchantDailyLogins)
      .where(
        and(
          eq(merchantDailyLogins.merchantId, merchantId),
          eq(merchantDailyLogins.loginDate, todayStr)
        )
      )
      .limit(1);
    
    if (existingLogin.length > 0) {
      // Pas le premier login du jour
      return false;
    }
    
    // Premier login du jour, créer l'entrée
    await db.insert(merchantDailyLogins).values({
      merchantId,
      loginDate: todayStr,
      firstLoginTime: new Date(),
      briefingShown: false,
      briefingSkipped: false,
    });
    
    return true; // Premier login du jour
  } catch (error) {
    console.error("[recordDailyLogin] Error:", error);
    return false;
  }
}

/**
 * Marquer le briefing comme affiché pour aujourd'hui
 */
export async function markBriefingShown(merchantId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const todayStr = formatDateString(new Date());
  
  try {
    await db.update(merchantDailyLogins)
      .set({ briefingShown: true })
      .where(
        and(
          eq(merchantDailyLogins.merchantId, merchantId),
          eq(merchantDailyLogins.loginDate, todayStr)
        )
      );
  } catch (error) {
    console.error("[markBriefingShown] Error:", error);
  }
}

/**
 * Marquer le briefing comme ignoré pour aujourd'hui
 */
export async function markBriefingSkipped(merchantId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const todayStr = formatDateString(new Date());
  
  try {
    await db.update(merchantDailyLogins)
      .set({ briefingSkipped: true })
      .where(
        and(
          eq(merchantDailyLogins.merchantId, merchantId),
          eq(merchantDailyLogins.loginDate, todayStr)
        )
      );
  } catch (error) {
    console.error("[markBriefingSkipped] Error:", error);
  }
}

/**
 * Vérifier si le briefing a déjà été affiché aujourd'hui
 */
export async function hasBriefingBeenShown(merchantId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;
  
  const todayStr = formatDateString(new Date());
  
  try {
    const login = await db.select()
      .from(merchantDailyLogins)
      .where(
        and(
          eq(merchantDailyLogins.merchantId, merchantId),
          eq(merchantDailyLogins.loginDate, todayStr)
        )
      )
      .limit(1);
    
    if (login.length === 0) {
      return false;
    }
    
    return login[0].briefingShown || login[0].briefingSkipped;
  } catch (error) {
    console.error("[hasBriefingBeenShown] Error:", error);
    return true; // En cas d'erreur, ne pas afficher le briefing
  }
}

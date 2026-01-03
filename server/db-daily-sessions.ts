import { getDb } from "./db";
import * as schema from "../drizzle/schema";
import type { MerchantDailySession, InsertMerchantDailySession } from "../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";

/**
 * Helper to format date as YYYY-MM-DD string for PostgreSQL date columns
 */
function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Récupérer la session du jour pour un marchand
 */
export async function getTodaySession(merchantId: number): Promise<MerchantDailySession | null> {
  const db = await getDb();
  if (!db) return null;
  
  const todayStr = formatDateString(new Date());
  
  const [session] = await db
    .select()
    .from(schema.merchantDailySessions)
    .where(
      and(
        eq(schema.merchantDailySessions.merchantId, merchantId),
        eq(schema.merchantDailySessions.sessionDate, todayStr)
      )
    )
    .limit(1);
  
  return session || null;
}

/**
 * Ouvrir une session de journée
 */
export async function openDaySession(
  merchantId: number,
  openingNotes?: string
): Promise<MerchantDailySession | null> {
  const db = await getDb();
  if (!db) return null;
  
  const todayStr = formatDateString(new Date());
  
  // Vérifier si une session existe déjà
  const existing = await getTodaySession(merchantId);
  
  if (existing) {
    // Mettre à jour la session existante
    await db
      .update(schema.merchantDailySessions)
      .set({
        openedAt: new Date(),
        openingNotes: openingNotes || existing.openingNotes,
        updatedAt: new Date(),
      })
      .where(eq(schema.merchantDailySessions.id, existing.id));
    
    // Récupérer la session mise à jour
    return getTodaySession(merchantId);
  }
  
  // Créer une nouvelle session
  await db
    .insert(schema.merchantDailySessions)
    .values({
      merchantId,
      sessionDate: todayStr,
      openedAt: new Date(),
      openingNotes,
    });
  
  return getTodaySession(merchantId);
}

/**
 * Fermer une session de journée
 */
export async function closeDaySession(
  merchantId: number,
  closingNotes?: string
): Promise<MerchantDailySession | null> {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await getTodaySession(merchantId);
  
  if (!existing) {
    return null;
  }
  
  await db
    .update(schema.merchantDailySessions)
    .set({
      closedAt: new Date(),
      closingNotes: closingNotes || existing.closingNotes,
      updatedAt: new Date(),
    })
    .where(eq(schema.merchantDailySessions.id, existing.id));
  
  return getTodaySession(merchantId);
}

/**
 * Rouvrir une session fermée
 */
export async function reopenDaySession(merchantId: number): Promise<MerchantDailySession | null> {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await getTodaySession(merchantId);
  
  if (!existing) {
    return null;
  }
  
  await db
    .update(schema.merchantDailySessions)
    .set({
      closedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.merchantDailySessions.id, existing.id));
  
  return getTodaySession(merchantId);
}

/**
 * Récupérer l'historique des sessions d'un marchand
 */
export async function getSessionHistory(
  merchantId: number,
  limit: number = 30
): Promise<MerchantDailySession[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(schema.merchantDailySessions)
    .where(eq(schema.merchantDailySessions.merchantId, merchantId))
    .orderBy(desc(schema.merchantDailySessions.sessionDate))
    .limit(limit);
}

/**
 * Vérifier si le marchand a une session non fermée d'hier
 */
export async function checkUnclosedYesterday(merchantId: number): Promise<MerchantDailySession | null> {
  const db = await getDb();
  if (!db) return null;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateString(yesterday);
  
  const [session] = await db
    .select()
    .from(schema.merchantDailySessions)
    .where(
      and(
        eq(schema.merchantDailySessions.merchantId, merchantId),
        eq(schema.merchantDailySessions.sessionDate, yesterdayStr),
        sql`${schema.merchantDailySessions.openedAt} IS NOT NULL`,
        sql`${schema.merchantDailySessions.closedAt} IS NULL`
      )
    )
    .limit(1);
  
  return session || null;
}

/**
 * Calculer la durée d'une session en heures
 */
export function calculateSessionDuration(session: MerchantDailySession): number | null {
  if (!session.openedAt || !session.closedAt) {
    return null;
  }
  
  const opened = new Date(session.openedAt).getTime();
  const closed = new Date(session.closedAt).getTime();
  const durationMs = closed - opened;
  const durationHours = durationMs / (1000 * 60 * 60);
  
  return Math.round(durationHours * 10) / 10; // Arrondi à 1 décimale
}

/**
 * Obtenir le statut de la session du jour
 */
export function getSessionStatus(session: MerchantDailySession | null): "NOT_OPENED" | "OPENED" | "CLOSED" {
  if (!session) {
    return "NOT_OPENED";
  }
  
  if (session.openedAt && !session.closedAt) {
    return "OPENED";
  }
  
  if (session.openedAt && session.closedAt) {
    return "CLOSED";
  }
  
  return "NOT_OPENED";
}

import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { pgTable, serial, integer, boolean, decimal, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { merchants } from "../drizzle/schema";

// Define the table using PostgreSQL types to match the project's database
export const merchantSettings = pgTable("merchant_settings", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull().references(() => merchants.id, { onDelete: "cascade" }).unique(),
  
  // Paramètres de proposition d'épargne automatique
  savingsProposalEnabled: boolean("savings_proposal_enabled").default(true).notNull(),
  savingsProposalThreshold: decimal("savings_proposal_threshold", { precision: 10, scale: 2 }).default("20000").notNull(),
  savingsProposalPercentage: decimal("savings_proposal_percentage", { precision: 5, scale: 2 }).default("2").notNull(),
  
  // Paramètres de notifications
  groupedOrderNotificationsEnabled: boolean("grouped_order_notifications_enabled").default(true).notNull(),
  
  // Paramètres de briefing matinal
  morningBriefingEnabled: boolean("morning_briefing_enabled").default(true).notNull(),
  morningBriefingTime: varchar("morning_briefing_time", { length: 5 }).default("08:00"),
  
  // Paramètres de rappels d'ouverture/fermeture de journée
  reminderOpeningTime: varchar("reminder_opening_time", { length: 5 }).default("09:00"),
  reminderClosingTime: varchar("reminder_closing_time", { length: 5 }).default("20:00"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  merchantIdx: index("merchant_settings_merchant_idx").on(table.merchantId),
}));

type MerchantSettings = typeof merchantSettings.$inferSelect;

/**
 * Récupérer les paramètres d'un marchand (ou créer avec valeurs par défaut)
 */
export async function getMerchantSettings(merchantId: number): Promise<MerchantSettings> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const [settings] = await db
    .select()
    .from(merchantSettings)
    .where(eq(merchantSettings.merchantId, merchantId))
    .limit(1);

  // Si pas de settings, créer avec valeurs par défaut
  if (!settings) {
    return createDefaultSettings(merchantId);
  }

  return settings;
}

/**
 * Créer les paramètres par défaut pour un marchand
 */
export async function createDefaultSettings(merchantId: number): Promise<MerchantSettings> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db
    .insert(merchantSettings)
    .values({
      merchantId,
      savingsProposalEnabled: true,
      savingsProposalThreshold: "20000",
      savingsProposalPercentage: "2",
      groupedOrderNotificationsEnabled: true,
      morningBriefingEnabled: true,
      morningBriefingTime: "08:00",
      reminderOpeningTime: "09:00",
      reminderClosingTime: "20:00",
    });

  // Fetch and return the created settings
  const [newSettings] = await db
    .select()
    .from(merchantSettings)
    .where(eq(merchantSettings.merchantId, merchantId))
    .limit(1);
  
  return newSettings;
}

/**
 * Mettre à jour les paramètres d'un marchand
 */
export async function updateMerchantSettings(
  merchantId: number,
  updates: Partial<{
    savingsProposalEnabled: boolean;
    savingsProposalThreshold: string;
    savingsProposalPercentage: string;
    groupedOrderNotificationsEnabled: boolean;
    morningBriefingEnabled: boolean;
    morningBriefingTime: string;
    reminderOpeningTime: string;
    reminderClosingTime: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Ensure settings exist first
  await getMerchantSettings(merchantId);
  
  await db
    .update(merchantSettings)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(merchantSettings.merchantId, merchantId));

  return getMerchantSettings(merchantId);
}

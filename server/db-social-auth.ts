import { getDb } from "./db";
import {
  socialChallenges,
  merchantChallenges,
  authAttempts,
  merchantDevices,
  type InsertAuthAttempt,
  type InsertMerchantDevice,
  type InsertMerchantChallenge,
} from "../drizzle/schema-social-auth";
import { users, merchants } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function getActiveChallengesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  const challenges = await db
    .select()
    .from(socialChallenges)
    .where(
      and(
        eq(socialChallenges.category, category as any),
        eq(socialChallenges.isActive, true)
      )
    );

  return challenges;
}

export async function getMerchantChallenges(merchantId: number) {
  const db = await getDb();
  if (!db) return [];

  const challenges = await db
    .select({
      id: merchantChallenges.id,
      merchantId: merchantChallenges.merchantId,
      challengeId: merchantChallenges.challengeId,
      answerHash: merchantChallenges.answerHash,
      isPrimary: merchantChallenges.isPrimary,
      questionFr: socialChallenges.questionFr,
      questionDioula: socialChallenges.questionDioula,
      category: socialChallenges.category,
      difficulty: socialChallenges.difficulty,
    })
    .from(merchantChallenges)
    .innerJoin(socialChallenges, eq(merchantChallenges.challengeId, socialChallenges.id))
    .where(eq(merchantChallenges.merchantId, merchantId));

  return challenges;
}

export async function getPrimaryChallengeForMerchant(merchantId: number) {
  const db = await getDb();
  if (!db) return null;

  const [challenge] = await db
    .select({
      id: merchantChallenges.id,
      merchantId: merchantChallenges.merchantId,
      challengeId: merchantChallenges.challengeId,
      answerHash: merchantChallenges.answerHash,
      isPrimary: merchantChallenges.isPrimary,
      questionFr: socialChallenges.questionFr,
      questionDioula: socialChallenges.questionDioula,
      category: socialChallenges.category,
      difficulty: socialChallenges.difficulty,
    })
    .from(merchantChallenges)
    .innerJoin(socialChallenges, eq(merchantChallenges.challengeId, socialChallenges.id))
    .where(
      and(
        eq(merchantChallenges.merchantId, merchantId),
        eq(merchantChallenges.isPrimary, true)
      )
    );

  return challenge || null;
}

export async function createMerchantChallenge(data: {
  merchantId: number;
  challengeId: number;
  answer: string;
  isPrimary?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const answerHash = await bcrypt.hash(data.answer.toLowerCase().trim(), 10);

  const [challenge] = await db.insert(merchantChallenges).values({
    merchantId: data.merchantId,
    challengeId: data.challengeId,
    answerHash,
    isPrimary: data.isPrimary || false,
  }).returning();

  return challenge;
}

export async function verifyChallenge(merchantChallengeId: number, answer: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [challenge] = await db
    .select()
    .from(merchantChallenges)
    .where(eq(merchantChallenges.id, merchantChallengeId));

  if (!challenge) return false;

  return bcrypt.compare(answer.toLowerCase().trim(), challenge.answerHash);
}

export async function getMerchantDevice(merchantId: number, deviceFingerprint: string) {
  const db = await getDb();
  if (!db) return null;

  const [device] = await db
    .select()
    .from(merchantDevices)
    .where(
      and(
        eq(merchantDevices.merchantId, merchantId),
        eq(merchantDevices.deviceFingerprint, deviceFingerprint)
      )
    );

  return device || null;
}

export async function createOrUpdateMerchantDevice(
  merchantId: number,
  deviceFingerprint: string,
  deviceName?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const existing = await getMerchantDevice(merchantId, deviceFingerprint);

  if (existing) {
    const [updated] = await db
      .update(merchantDevices)
      .set({
        lastSeen: new Date(),
        timesUsed: sql`${merchantDevices.timesUsed} + 1`,
      })
      .where(eq(merchantDevices.id, existing.id))
      .returning();

    return updated;
  }

  const [device] = await db.insert(merchantDevices).values({
    merchantId,
    deviceFingerprint,
    deviceName: deviceName || 'Appareil Inconnu',
    timesUsed: 1,
    isTrusted: false,
  }).returning();

  return device;
}

export async function trustDevice(merchantId: number, deviceFingerprint: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const device = await getMerchantDevice(merchantId, deviceFingerprint);
  if (!device) {
    throw new Error('Device not found');
  }

  const [updated] = await db
    .update(merchantDevices)
    .set({ isTrusted: true })
    .where(eq(merchantDevices.id, device.id))
    .returning();

  return updated;
}

export async function logAuthAttempt(data: InsertAuthAttempt) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const [attempt] = await db.insert(authAttempts).values(data).returning();
  return attempt;
}

export async function getRecentAuthAttempts(
  phone: string,
  hoursBack: number = 24
) {
  const db = await getDb();
  if (!db) return [];

  const since = new Date();
  since.setHours(since.getHours() - hoursBack);

  const attempts = await db
    .select()
    .from(authAttempts)
    .where(
      and(
        eq(authAttempts.phone, phone),
        sql`${authAttempts.createdAt} >= ${since}`
      )
    )
    .orderBy(desc(authAttempts.createdAt));

  return attempts;
}

export async function findUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone));

  return user || null;
}

export async function getMerchantByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const [merchant] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.userId, userId));

  return merchant || null;
}

export async function getAuthStats(merchantId: number) {
  const db = await getDb();
  if (!db) return null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [stats] = await db
    .select({
      totalAttempts: sql<number>`count(*)`,
      successfulAttempts: sql<number>`sum(case when ${authAttempts.success} then 1 else 0 end)`,
      failedAttempts: sql<number>`sum(case when not ${authAttempts.success} then 1 else 0 end)`,
      averageTrustScore: sql<number>`avg(${authAttempts.trustScore})`,
    })
    .from(authAttempts)
    .innerJoin(users, eq(authAttempts.userId, users.id))
    .innerJoin(merchants, eq(users.id, merchants.userId))
    .where(
      and(
        eq(merchants.id, merchantId),
        sql`${authAttempts.createdAt} >= ${thirtyDaysAgo}`
      )
    );

  return stats;
}

export async function createUserWithPhone(data: {
  phone: string;
  name: string;
  pinCode: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const pinHash = await bcrypt.hash(data.pinCode, 10);

  // Generate unique openId for phone-based users
  const openId = `phone-${data.phone.replace(/\+/g, '')}-${Date.now()}`;

  const [user] = await db.insert(users).values({
    openId,
    phone: data.phone,
    name: data.name,
    pinCode: pinHash,
    loginMethod: 'phone_social',
    role: 'merchant',
  }).returning();

  // Set phoneVerified via raw SQL (column exists in DB but not in Drizzle schema)
  await db.execute(sql`UPDATE users SET phone_verified = false WHERE id = ${user.id}`);

  return user;
}

export async function verifyPinCode(userId: number, pinCode: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (!user || !user.pinCode) return false;

  return bcrypt.compare(pinCode, user.pinCode);
}

export async function incrementPinFailedAttempts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION_MINUTES = 15;

  // Use raw SQL since columns exist in DB but not in Drizzle schema
  await db.execute(sql`
    UPDATE users 
    SET pin_failed_attempts = COALESCE(pin_failed_attempts, 0) + 1 
    WHERE id = ${userId}
  `);

  const result = await db.execute(sql`
    SELECT pin_failed_attempts FROM users WHERE id = ${userId}
  `);
  
  const attempts = (result[0] as any)?.pin_failed_attempts ?? 0;

  if (attempts >= MAX_ATTEMPTS) {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + LOCK_DURATION_MINUTES);
    
    await db.execute(sql`
      UPDATE users SET pin_locked_until = ${lockUntil} WHERE id = ${userId}
    `);

    return { locked: true, attempts };
  }

  return { locked: false, attempts };
}

export async function resetPinFailedAttempts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.execute(sql`
    UPDATE users 
    SET pin_failed_attempts = 0, pin_locked_until = NULL 
    WHERE id = ${userId}
  `);
}

export async function isAccountLocked(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db.execute(sql`
    SELECT pin_locked_until FROM users WHERE id = ${userId}
  `);

  const lockedUntil = (result[0] as any)?.pin_locked_until;
  if (!lockedUntil) return false;
  
  return new Date() < new Date(lockedUntil);
}

export async function updatePinCode(userId: number, newPinCode: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const pinHash = await bcrypt.hash(newPinCode, 10);

  const [user] = await db
    .update(users)
    .set({
      pinCode: pinHash,
    })
    .where(eq(users.id, userId))
    .returning();

  return user;
}

export async function markPhoneAsVerified(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.execute(sql`
    UPDATE users SET phone_verified = true WHERE id = ${userId}
  `);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  return user;
}

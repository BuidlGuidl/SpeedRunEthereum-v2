import { desc, sql } from "drizzle-orm";
import { ActivityType } from "~~/services/api/activities";
import { db } from "~~/services/database/config/postgresClient";
import { challenges, userChallenges, users } from "~~/services/database/config/schema";

export async function getActivities(start: number, size: number, activityType: ActivityType = "ALL") {
  let query;
  let countQuery;

  // Query for CHALLENGE_SUBMISSIONS (all user challenges)
  if (activityType === "CHALLENGE_SUBMISSIONS") {
    query = db.query.userChallenges.findMany({
      limit: size,
      offset: start,
      orderBy: [desc(userChallenges.submittedAt)],
      with: {
        user: true,
        challenge: true,
      },
    });

    countQuery = db.select({ count: sql<number>`count(*)` }).from(userChallenges);
  }
  // Query for USER_CREATE (user registrations)
  else if (activityType === "USER_CREATE") {
    query = db.query.users.findMany({
      limit: size,
      offset: start,
      orderBy: [desc(users.createdAt)],
    });

    countQuery = db.select({ count: sql<number>`count(*)` }).from(users);
  } else {
    // Direct SQL approach for combining user challenges and user registrations
    const sqlQuery = sql`
      WITH all_activities AS (
        SELECT 
          CONCAT('uc_', uc.id) as id,
          'CHALLENGE_SUBMISSIONS' as type,
          uc.user_address as user_address,
          uc.submitted_at AT TIME ZONE 'UTC' as timestamp,
          uc.challenge_id as challenge_id,
          uc.review_action as review_action,
          uc.frontend_url as frontend_url,
          uc.contract_url as contract_url,
          c.challenge_name as challenge_name,
          u.ens as user_ens
        FROM ${userChallenges} uc
        LEFT JOIN ${challenges} c ON uc.challenge_id = c.id
        LEFT JOIN ${users} u ON uc.user_address = u.user_address
        
        UNION ALL
        
        SELECT 
          CONCAT('u_', u.user_address) as id,
          'USER_CREATE' as type,
          u.user_address as user_address,
          u.created_at AT TIME ZONE 'UTC' as timestamp,
          NULL as challenge_id,
          NULL as review_action,
          NULL as frontend_url,
          NULL as contract_url,
          NULL as challenge_name,
          u.ens as user_ens
        FROM ${users} u
      )
      SELECT * FROM all_activities
      ORDER BY timestamp DESC
      LIMIT ${size}
      OFFSET ${start}
    `;

    const countSqlQuery = sql`
      WITH all_activities AS (
        SELECT 
          CONCAT('uc_', uc.id) as id
        FROM ${userChallenges} uc
        
        UNION ALL
        
        SELECT 
          CONCAT('u_', u.user_address) as id
        FROM ${users} u
      )
      SELECT COUNT(*) as count FROM all_activities
    `;

    const result = await db.execute(sqlQuery);
    const countResult = await db.execute(countSqlQuery);

    return {
      data: result.rows.map((item: any) => ({
        id: item.id,
        type: item.type as ActivityType,
        userAddress: item.user_address,
        userEns: item.user_ens,
        timestamp: item.timestamp,
        details: {
          challengeId: item.challenge_id,
          challengeName: item.challenge_name,
          reviewAction: item.review_action,
          frontendUrl: item.frontend_url,
          contractUrl: item.contract_url,
        },
      })),
      meta: {
        totalRowCount: Number(countResult.rows[0]?.count || 0),
      },
    };
  }

  // For non-ALL types
  const [activities, countResult] = await Promise.all([query, countQuery]);

  const totalCount = countResult[0]?.count ?? 0;

  if (activityType === "CHALLENGE_SUBMISSIONS") {
    return {
      data: activities.map((item: any) => ({
        id: `uc_${item.id}`,
        type: activityType,
        userAddress: item.userAddress,
        userEns: item.user?.ens,
        timestamp: item.submittedAt,
        details: {
          challengeId: item.challengeId,
          challengeName: item.challenge?.challengeName,
          reviewAction: item.reviewAction,
          frontendUrl: item.frontendUrl,
          contractUrl: item.contractUrl,
        },
      })),
      meta: {
        totalRowCount: totalCount,
      },
    };
  } else if (activityType === "USER_CREATE") {
    return {
      data: activities.map((item: any) => ({
        id: `u_${item.userAddress}`,
        type: activityType,
        userAddress: item.userAddress,
        userEns: item.ens,
        timestamp: item.createdAt,
        details: {},
      })),
      meta: {
        totalRowCount: totalCount,
      },
    };
  }

  // This should never happen but TypeScript needs it
  return {
    data: [],
    meta: {
      totalRowCount: 0,
    },
  };
}

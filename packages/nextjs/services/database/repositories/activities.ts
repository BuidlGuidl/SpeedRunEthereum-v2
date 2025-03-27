import { desc, sql } from "drizzle-orm";
import { ActivityType } from "~~/services/api/activities";
import { db } from "~~/services/database/config/postgresClient";
import { challenges, userChallenges, users } from "~~/services/database/config/schema";

export async function findActivities(start: number, size: number, activityType: ActivityType = "ALL") {
  let query;

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
  }
  // Query for USER_CREATE (user registrations)
  else if (activityType === "USER_CREATE") {
    query = db.query.users.findMany({
      limit: size,
      offset: start,
      orderBy: [desc(users.createdAt)],
    });
  }
  // Query for ALL (combine user challenges and user creations)
  else {
    // Direct SQL approach for combining user challenges and user registrations
    const sqlQuery = sql`
      WITH all_activities AS (
        SELECT 
          CONCAT('uc_', uc.id) as id,
          'CHALLENGE_SUBMISSIONS' as type,
          uc.user_address as user_address,
          uc.submitted_at as timestamp,
          uc.challenge_id as challenge_id,
          uc.review_action as review_action,
          uc.frontend_url as frontend_url,
          uc.contract_url as contract_url,
          c.challenge_name as challenge_name
        FROM ${userChallenges} uc
        LEFT JOIN ${challenges} c ON uc.challenge_id = c.id
        
        UNION ALL
        
        SELECT 
          CONCAT('u_', u.user_address) as id,
          'USER_CREATE' as type,
          u.user_address as user_address,
          u.created_at as timestamp,
          NULL as challenge_id,
          NULL as review_action,
          NULL as frontend_url,
          NULL as contract_url,
          NULL as challenge_name
        FROM ${users} u
      )
      SELECT * FROM all_activities
      ORDER BY timestamp DESC
      LIMIT ${size}
      OFFSET ${start}
    `;

    const result = await db.execute(sqlQuery);

    return {
      data: result.rows.map((item: any) => ({
        id: item.id,
        type: item.type as ActivityType,
        userAddress: item.user_address,
        timestamp: item.timestamp,
        details: {
          challengeId: item.challenge_id,
          challengeName: item.challenge_name,
          reviewAction: item.review_action,
          frontendUrl: item.frontend_url,
          contractUrl: item.contract_url,
        },
      })),
    };
  }

  // For non-ALL types
  const activities = await query;

  if (activityType === "CHALLENGE_SUBMISSIONS") {
    return {
      data: activities.map((item: any) => ({
        id: `uc_${item.id}`,
        type: activityType,
        userAddress: item.userAddress,
        timestamp: item.submittedAt,
        details: {
          challengeId: item.challengeId,
          challengeName: item.challenge?.challengeName,
          reviewAction: item.reviewAction,
          frontendUrl: item.frontendUrl,
          contractUrl: item.contractUrl,
        },
      })),
    };
  } else if (activityType === "USER_CREATE") {
    return {
      data: activities.map((item: any) => ({
        id: `u_${item.userAddress}`,
        type: activityType,
        userAddress: item.userAddress,
        timestamp: item.createdAt,
        details: {},
      })),
    };
  }

  // This should never happen but TypeScript needs it
  return {
    data: [],
  };
}

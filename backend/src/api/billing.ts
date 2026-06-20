import { Router } from "express";
import { query, queryOne } from "../database";
import { authMiddleware, AuthRequest } from "../auth/middleware";
import { config } from "../config";

const router = Router();
router.use(authMiddleware);

const PLAN_LIMITS: Record<string, { downloads: number; storage: number; members: number }> = {
  free: { downloads: 50, storage: 5, members: 1 },
  pro: { downloads: 500, storage: 50, members: 5 },
  team: { downloads: 5000, storage: 500, members: 20 },
  enterprise: { downloads: -1, storage: -1, members: -1 },
};

router.get("/plan", async (req: AuthRequest, res) => {
  const user = await queryOne<{ organization_id: string | null }>(
    "SELECT organization_id FROM users WHERE id = $1",
    [req.userId]
  );

  if (!user?.organization_id) {
    return res.json({ plan: "free", limits: PLAN_LIMITS.free });
  }

  const org = await queryOne<{ plan: string }>(
    "SELECT plan FROM organizations WHERE id = $1",
    [user.organization_id]
  );

  const plan = org?.plan || "free";
  res.json({ plan, limits: PLAN_LIMITS[plan] || PLAN_LIMITS.free });
});

router.post("/subscribe", async (req: AuthRequest, res) => {
  const { planId } = req.body as { planId: string };

  if (!PLAN_LIMITS[planId]) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const user = await queryOne<{ organization_id: string | null; email: string }>(
    "SELECT organization_id, email FROM users WHERE id = $1",
    [req.userId]
  );

  if (!user) return res.status(404).json({ error: "User not found" });
  let orgId: string;
  if (!user.organization_id) {
    const org = await queryOne<{ id: string }>(
      "INSERT INTO organizations (name, plan) VALUES ($1, $2) RETURNING id",
      [user.email + "'s Team", planId]
    );
    if (!org) return res.status(500).json({ error: "Failed to create organization" });
    await query("UPDATE users SET organization_id = $1 WHERE id = $2", [org.id, req.userId]);
    orgId = org.id;
  } else {
    orgId = user.organization_id;
  }

  if (planId === "free") {
    await query("UPDATE organizations SET plan = 'free', stripe_subscription_id = NULL WHERE id = $1", [orgId]);
    return res.json({ plan: "free", limits: PLAN_LIMITS.free });
  }

  if (config.stripeSecretKey) {
    return res.json({
      checkoutUrl: `https://checkout.stripe.com/c/pay/cs_test_${planId}_${orgId}`,
      message: "Redirect to Stripe Checkout (configure STRIPE_SECRET_KEY for production)",
    });
  }

  await query("UPDATE organizations SET plan = $1 WHERE id = $2", [planId, orgId]);
  res.json({ plan: planId, limits: PLAN_LIMITS[planId] });
});

router.get("/usage", async (req: AuthRequest, res) => {
  const user = await queryOne<{ organization_id: string | null }>(
    "SELECT organization_id FROM users WHERE id = $1",
    [req.userId]
  );

  if (!user?.organization_id) {
    const count = await queryOne<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM downloads WHERE user_id = $1 AND created_at >= date_trunc('month', now())",
      [req.userId]
    );
    return res.json({ usage: { downloadsThisMonth: parseInt(count!.count, 10) } });
  }

  const org = await queryOne<{ plan: string }>("SELECT plan FROM organizations WHERE id = $1", [user.organization_id]);
  const stats = await queryOne<{ downloads: string; storage: string; members: string }>(
    `SELECT
      (SELECT COUNT(*)::text FROM downloads d JOIN users u ON u.id = d.user_id WHERE u.organization_id = $1 AND d.created_at >= date_trunc('month', now())) AS downloads,
      (SELECT COALESCE(SUM(d.size), 0)::text FROM downloads d JOIN users u ON u.id = d.user_id WHERE u.organization_id = $1 AND d.status = 'completed') AS storage,
      (SELECT COUNT(*)::text FROM team_members WHERE organization_id = $1) AS members`,
    [user.organization_id]
  );

  res.json({
    plan: org?.plan || "free",
    limits: PLAN_LIMITS[org?.plan || "free"],
    usage: {
      downloadsThisMonth: parseInt(stats!.downloads, 10),
      storageGB: Math.round(parseInt(stats!.storage, 10) / 1024 / 1024 / 1024 * 100) / 100,
      members: parseInt(stats!.members, 10),
    },
  });
});

export default router;

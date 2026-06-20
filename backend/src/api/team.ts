import { Router } from "express";
import bcrypt from "bcryptjs";
import { query, queryOne } from "../database";
import { authMiddleware, AuthRequest } from "../auth/middleware";

const router = Router();
router.use(authMiddleware);

router.get("/members", async (req: AuthRequest, res) => {
  const user = await queryOne<{ organization_id: string | null }>(
    "SELECT organization_id FROM users WHERE id = $1",
    [req.userId]
  );

  if (!user?.organization_id) {
    return res.json({ members: [] });
  }

  const members = await query(
    `SELECT u.id, u.email, u.role, tm.created_at
     FROM team_members tm
     JOIN users u ON u.id = tm.user_id
     WHERE tm.organization_id = $1
     ORDER BY tm.created_at ASC`,
    [user.organization_id]
  );

  res.json({ members: members.rows });
});

router.post("/invite", async (req: AuthRequest, res) => {
  const { email } = req.body as { email: string };
  if (!email) return res.status(400).json({ error: "Email required" });

  const user = await queryOne<{ organization_id: string | null; role: string }>(
    "SELECT organization_id, role FROM users WHERE id = $1",
    [req.userId]
  );

  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.organization_id) {
    const org = await queryOne<{ id: string }>(
      "INSERT INTO organizations (name) VALUES ($1) RETURNING id",
      [email.split("@")[0] + "'s Team"]
    );
    if (!org) return res.status(500).json({ error: "Failed to create organization" });
    await query("UPDATE users SET organization_id = $1, role = 'admin' WHERE id = $2", [org.id, req.userId]);
    await query(
      "INSERT INTO team_members (organization_id, user_id, role) VALUES ($1, $2, 'admin') ON CONFLICT DO NOTHING",
      [org.id, req.userId]
    );
    user.organization_id = org.id;
  }

  const orgId = user.organization_id;

  const existing = await queryOne<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
  if (!existing) {
    return res.status(404).json({ error: "User not found. Ask them to register first." });
  }

  const alreadyMember = await queryOne(
    "SELECT id FROM team_members WHERE organization_id = $1 AND user_id = $2",
    [orgId, existing.id]
  );
  if (alreadyMember) {
    return res.status(409).json({ error: "User already in team" });
  }

  await query(
    "INSERT INTO team_members (organization_id, user_id, role, invited_email) VALUES ($1, $2, 'member', $3)",
    [orgId, existing.id, email]
  );
  await query("UPDATE users SET organization_id = $1 WHERE id = $2", [orgId, existing.id]);

  res.json({ ok: true });
});

router.delete("/members/:id", async (req: AuthRequest, res) => {
  const user = await queryOne<{ organization_id: string | null; role: string }>(
    "SELECT organization_id, role FROM users WHERE id = $1",
    [req.userId]
  );

  if (!user?.organization_id) return res.status(404).json({ error: "No organization" });

  const target = await queryOne<{ role: string }>(
    "SELECT role FROM team_members WHERE organization_id = $1 AND user_id = $2",
    [user.organization_id, req.params.id]
  );

  if (!target) return res.status(404).json({ error: "Member not found" });
  if (target.role === "admin") return res.status(403).json({ error: "Cannot remove admin" });

  await query("DELETE FROM team_members WHERE organization_id = $1 AND user_id = $2", [user.organization_id, req.params.id]);
  await query("UPDATE users SET organization_id = NULL WHERE id = $1", [req.params.id]);

  res.json({ ok: true });
});

export default router;

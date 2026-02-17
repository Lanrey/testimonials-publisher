import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { createAdminGuard } from "./auth.js";
import { db } from "./db.js";
import { creators, forms, submissions } from "./schema.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => origin ?? "*",
    allowHeaders: ["content-type", "x-admin-token"],
    allowMethods: ["GET", "POST", "OPTIONS"]
  })
);

const adminToken = process.env.ADMIN_TOKEN || "";
const adminOnly = createAdminGuard(adminToken);

app.get("/health", (c) => c.json({ ok: true }));

app.post("/forms", adminOnly, async (c) => {

  const body = await c.req.json().catch(() => null);
  if (!body?.creatorName || !body?.title || !body?.slug) {
    return c.json({ error: "creatorName, title, and slug are required" }, 400);
  }

  const [creator] = await db
    .insert(creators)
    .values({ name: body.creatorName })
    .returning();

  const [form] = await db
    .insert(forms)
    .values({ creatorId: creator.id, title: body.title, slug: body.slug })
    .returning();

  return c.json({ form, creator });
});

app.get("/forms/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [form] = await db
    .select({
      id: forms.id,
      title: forms.title,
      slug: forms.slug,
      creatorName: creators.name
    })
    .from(forms)
    .innerJoin(creators, eq(forms.creatorId, creators.id))
    .where(eq(forms.slug, slug));

  if (!form) {
    return c.json({ error: "Form not found" }, 404);
  }

  return c.json({ form });
});

app.post("/forms/:slug/submissions", async (c) => {
  const slug = c.req.param("slug");
  const body = await c.req.json().catch(() => null);

  if (!body?.name || !body?.quote) {
    return c.json({ error: "name and quote are required" }, 400);
  }

  const [form] = await db.select().from(forms).where(eq(forms.slug, slug));
  if (!form) {
    return c.json({ error: "Form not found" }, 404);
  }

  const [submission] = await db
    .insert(submissions)
    .values({
      formId: form.id,
      name: body.name,
      role: body.role ?? null,
      company: body.company ?? null,
      quote: body.quote,
      email: body.email ?? null
    })
    .returning();

  return c.json({ submission });
});

app.use("/admin/*", adminOnly);

app.get("/admin/submissions", async (c) => {

  const slug = c.req.query("slug");
  if (!slug) {
    return c.json({ error: "slug is required" }, 400);
  }

  const [form] = await db.select().from(forms).where(eq(forms.slug, slug));
  if (!form) {
    return c.json({ error: "Form not found" }, 404);
  }

  const rows = await db
    .select()
    .from(submissions)
    .where(eq(submissions.formId, form.id))
    .orderBy(desc(submissions.createdAt));

  return c.json({ submissions: rows, form });
});

app.post("/admin/submissions/:id/approve", async (c) => {
  const id = Number(c.req.param("id"));
  if (!id) {
    return c.json({ error: "Invalid id" }, 400);
  }

  const [updated] = await db
    .update(submissions)
    .set({ approvedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Submission not found" }, 404);
  }

  return c.json({ submission: updated });
});

app.get("/wall/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [form] = await db.select().from(forms).where(eq(forms.slug, slug));
  if (!form) {
    return c.json({ error: "Form not found" }, 404);
  }

  const rows = await db
    .select()
    .from(submissions)
    .where(
      and(eq(submissions.formId, form.id), isNotNull(submissions.approvedAt))
    )
    .orderBy(desc(submissions.approvedAt));

  return c.json({ submissions: rows, form });
});

const port = Number(process.env.PORT || 8787);

app.get("/", (c) => c.json({ message: "Senja proof-of-work API" }));

serve({
  fetch: app.fetch,
  port
});

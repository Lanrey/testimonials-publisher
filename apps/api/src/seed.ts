import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "./db.js";
import { creators, forms, submissions } from "./schema.js";

const slug = "demo";

const run = async () => {
  const [existingForm] = await db
    .select()
    .from(forms)
    .where(eq(forms.slug, slug));

  if (existingForm) {
    await db
      .delete(submissions)
      .where(eq(submissions.formId, existingForm.id));
    await db.delete(forms).where(eq(forms.id, existingForm.id));
    await db.delete(creators).where(eq(creators.id, existingForm.creatorId));
  }

  const [creator] = await db
    .insert(creators)
    .values({ name: "Ava Hart" })
    .returning();

  const [form] = await db
    .insert(forms)
    .values({
      creatorId: creator.id,
      title: "Ava's Creator Studio",
      slug
    })
    .returning();

  const baseSubmission = {
    formId: form.id
  };

  await db.insert(submissions).values([
    {
      ...baseSubmission,
      name: "Taylor Gray",
      role: "Founder",
      company: "Acme",
      quote: "Senja helped us turn happy customers into an always-on sales page.",
      email: "taylor@acme.co",
      approvedAt: new Date()
    },
    {
      ...baseSubmission,
      name: "Jordan Lee",
      role: "Course Creator",
      company: "Growth Lab",
      quote: "The intake form is clean and we shipped a testimonial wall in days.",
      email: "jordan@growthlab.co"
    }
  ]);

  console.log("Seed complete.");
};

run()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

<script lang="ts">
  import { onMount } from "svelte";

  type Form = {
    id: number;
    title: string;
    slug: string;
    creatorName: string;
  };

  type Submission = {
    id: number;
    name: string;
    role: string | null;
    company: string | null;
    quote: string;
    createdAt: string;
    approvedAt: string | null;
  };

  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8787";
  const isDev = import.meta.env.DEV;

  let route = "form";
  let slug = "demo";
  let form: Form | null = null;
  let submissions: Submission[] = [];
  let approved: Submission[] = [];
  let statusMessage = "";
  let errorMessage = "";
  let isLoading = false;

  let adminToken = localStorage.getItem("admin_token") || "dev-admin-token";

  let creatorName = "";
  let formTitle = "";
  let formSlug = "";

  let name = "";
  let role = "";
  let company = "";
  let quote = "";
  let email = "";

  const setRouteFromHash = () => {
    const hash = window.location.hash.replace("#", "");
    const parts = hash.split("/").filter(Boolean);

    route = parts[0] || "form";
    slug = parts[1] || "demo";

    formSlug = slug;
    statusMessage = "";
    errorMessage = "";

    if (route === "form") {
      void loadForm();
    }

    if (route === "admin") {
      void loadSubmissions();
    }

    if (route === "wall") {
      void loadWall();
    }
  };

  onMount(() => {
    setRouteFromHash();
    window.addEventListener("hashchange", setRouteFromHash);

    return () => {
      window.removeEventListener("hashchange", setRouteFromHash);
    };
  });

  const saveToken = () => {
    localStorage.setItem("admin_token", adminToken);
    statusMessage = "Admin token saved.";
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(adminToken);
      statusMessage = "Admin token copied.";
    } catch (error) {
      errorMessage = "Copy failed. Check clipboard permissions.";
    }
  };

  const loadForm = async () => {
    isLoading = true;
    form = null;

    try {
      const response = await fetch(`${apiBase}/forms/${slug}`);
      if (!response.ok) {
        throw new Error("Form not found yet. Create it in Admin.");
      }
      const data = await response.json();
      form = data.form;
      formTitle = form.title;
      creatorName = form.creatorName;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Failed to load";
    } finally {
      isLoading = false;
    }
  };

  const submitTestimonial = async () => {
    statusMessage = "";
    errorMessage = "";

    if (!name || !quote) {
      errorMessage = "Name and quote are required.";
      return;
    }

    isLoading = true;
    try {
      const response = await fetch(`${apiBase}/forms/${slug}/submissions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, role, company, quote, email })
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      name = "";
      role = "";
      company = "";
      quote = "";
      email = "";

      statusMessage = "Thanks! Your testimonial is submitted.";
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Submission failed";
    } finally {
      isLoading = false;
    }
  };

  const loadSubmissions = async () => {
    submissions = [];
    form = null;

    if (!slug) {
      return;
    }

    isLoading = true;
    try {
      const response = await fetch(`${apiBase}/admin/submissions?slug=${slug}`, {
        headers: { "x-admin-token": adminToken }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load submissions");
      }

      const data = await response.json();
      submissions = data.submissions;
      form = data.form;
      creatorName = form.creatorName;
      formTitle = form.title;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Failed to load";
    } finally {
      isLoading = false;
    }
  };

  const approveSubmission = async (id: number) => {
    statusMessage = "";
    errorMessage = "";

    try {
      const response = await fetch(`${apiBase}/admin/submissions/${id}/approve`, {
        method: "POST",
        headers: { "x-admin-token": adminToken }
      });

      if (!response.ok) {
        throw new Error("Approval failed");
      }

      statusMessage = "Approved!";
      await loadSubmissions();
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Approval failed";
    }
  };

  const loadWall = async () => {
    approved = [];
    form = null;
    isLoading = true;

    try {
      const response = await fetch(`${apiBase}/wall/${slug}`);
      if (!response.ok) {
        throw new Error("No wall found for this slug");
      }
      const data = await response.json();
      approved = data.submissions;
      form = data.form;
      formTitle = form.title;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Failed to load";
    } finally {
      isLoading = false;
    }
  };

  const createForm = async () => {
    statusMessage = "";
    errorMessage = "";

    if (!creatorName || !formTitle || !formSlug) {
      errorMessage = "Creator name, title, and slug are required.";
      return;
    }

    isLoading = true;
    try {
      const response = await fetch(`${apiBase}/forms`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify({
          creatorName,
          title: formTitle,
          slug: formSlug
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create form");
      }

      statusMessage = "Form created.";
      window.location.hash = `#/admin/${formSlug}`;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Failed to create";
    } finally {
      isLoading = false;
    }
  };
</script>

<div class="page">
  <header class="hero">
    <div>
      <p class="eyebrow">Senja proof of work</p>
      <h1>Collect, review, and publish testimonials.</h1>
      <p class="lede">
        A minimal loop that mirrors Senja's product flow, built in Svelte + Hono +
        Drizzle.
      </p>
    </div>
    <nav class="nav">
      <a href="#/form/{slug}" class:active={route === "form"}>Collect</a>
      <a href="#/admin/{slug}" class:active={route === "admin"}>Review</a>
      <a href="#/wall/{slug}" class:active={route === "wall"}>Publish</a>
    </nav>
  </header>

  <section class="panel">
    <div class="row">
      <label>
        Testimonial slug
        <input
          type="text"
          bind:value={formSlug}
          placeholder="demo"
        />
      </label>
      <button on:click={() => (window.location.hash = `#/${route}/${formSlug}`)}>
        Go
      </button>
    </div>

    {#if statusMessage}
      <p class="status">{statusMessage}</p>
    {/if}

    {#if errorMessage}
      <p class="error">{errorMessage}</p>
    {/if}
  </section>

  {#if route === "form"}
    <section class="panel">
      <h2>{form ? form.title : "Start collecting"}</h2>
      <p class="muted">
        {form ? `Share your story for ${form.creatorName}.` : "Create a form in Admin to begin."}
      </p>

      {#if isLoading}
        <p class="muted">Loading...</p>
      {:else}
        <div class="grid">
          <label>
            Name
            <input type="text" bind:value={name} placeholder="Taylor" />
          </label>
          <label>
            Role
            <input type="text" bind:value={role} placeholder="Founder" />
          </label>
          <label>
            Company
            <input type="text" bind:value={company} placeholder="Acme" />
          </label>
          <label>
            Email
            <input type="email" bind:value={email} placeholder="taylor@acme.co" />
          </label>
        </div>
        <label>
          Testimonial
          <textarea
            rows="4"
            bind:value={quote}
            placeholder="Senja helped us..."
          ></textarea>
        </label>
        <button class="primary" on:click={submitTestimonial}>
          Submit testimonial
        </button>
      {/if}
    </section>
  {:else if route === "admin"}
    <section class="panel">
      <h2>Admin review</h2>
      <div class="grid">
        <label>
          Admin token
          <input type="password" bind:value={adminToken} />
        </label>
        <button on:click={saveToken}>Save token</button>
        {#if isDev}
          <button on:click={copyToken}>Copy token</button>
        {/if}
      </div>
      {#if isDev}
        <p class="muted">Dev token: {adminToken}</p>
      {/if}

      <div class="panel nested">
        <h3>Create a form</h3>
        <div class="grid">
          <label>
            Creator name
            <input type="text" bind:value={creatorName} placeholder="Ava" />
          </label>
          <label>
            Form title
            <input type="text" bind:value={formTitle} placeholder="Ava's Studio" />
          </label>
          <label>
            Slug
            <input type="text" bind:value={formSlug} placeholder="ava" />
          </label>
        </div>
        <button class="primary" on:click={createForm}>Create form</button>
      </div>

      {#if form}
        <p class="muted">Review submissions for {form.title}.</p>
      {/if}

      {#if isLoading}
        <p class="muted">Loading...</p>
      {:else if submissions.length === 0}
        <p class="muted">No submissions yet.</p>
      {:else}
        <div class="cards">
          {#each submissions as submission}
            <article class="card">
              <div class="card-header">
                <div>
                  <strong>{submission.name}</strong>
                  <p class="muted">
                    {submission.role || ""}
                    {submission.company ? ` @ ${submission.company}` : ""}
                  </p>
                </div>
                {#if submission.approvedAt}
                  <span class="pill">Approved</span>
                {:else}
                  <button on:click={() => approveSubmission(submission.id)}>
                    Approve
                  </button>
                {/if}
              </div>
              <p>{submission.quote}</p>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  {:else if route === "wall"}
    <section class="panel">
      <h2>{form ? form.title : "Public wall"}</h2>
      <p class="muted">Approved testimonials for {slug}.</p>

      {#if isLoading}
        <p class="muted">Loading...</p>
      {:else if approved.length === 0}
        <p class="muted">No approved testimonials yet.</p>
      {:else}
        <div class="cards">
          {#each approved as submission}
            <article class="card">
              <p class="quote">“{submission.quote}”</p>
              <p class="muted">
                {submission.name}
                {submission.role ? `, ${submission.role}` : ""}
                {submission.company ? ` @ ${submission.company}` : ""}
              </p>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</div>

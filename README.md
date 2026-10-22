# AdVibe Studio — website + admin dashboard

A website for your AI video ad agency, with a private **admin dashboard** where you edit the
website, see customer orders (leads) and track client projects.

> **You are a beginner? Perfect — this guide is written for you.** Read it top to bottom once.
> Every step says exactly where to click. Words in `code style` are things you type or paste.

---

## Table of contents

1. [The big picture (read this first)](#part-1--the-big-picture)
2. [How to open the admin page](#part-2--how-to-open-the-admin-page)
3. [Run the site on your computer](#part-3--run-the-site-on-your-computer)
4. [Connect Supabase (database + admin login)](#part-4--connect-supabase-database--admin-login)
5. [The `.env` file (your private keys)](#part-5--the-env-file-your-private-keys)
6. [Connect Make → Google Sheets + SendFox](#part-6--connect-make--google-sheets--sendfox)
7. [Put the site online with GitHub Pages](#part-7--put-the-site-online-with-github-pages)
8. [Everyday jobs](#part-8--everyday-jobs)
9. [Troubleshooting](#part-9--troubleshooting)
10. [Before-you-launch checklist](#part-10--before-you-launch-checklist)
11. [Map of the project files](#part-11--map-of-the-project-files)

---

## Part 1 — The big picture

Four services work together. Here is what each one is *for*:

```
 Visitor fills in the order form on your website
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   SUPABASE                   MAKE.COM
   (your database)            (your automation robot)
   keeps every lead           receives the same lead and
   safely + powers the        passes it on to:
   admin login & editor         ├─► GOOGLE SHEETS  (a row per lead — easy to read/share)
                                └─► SENDFOX        (adds their email to your mailing list)
```

| Service | Job | Do you *need* it? |
|---|---|---|
| **Supabase** | The real database. Stores leads, projects, and **the website text you edit**. Handles the admin login. | **Yes**, for a real launch. Without it the site is in *demo mode* (see below). |
| **Make** | Forwards each new lead to other tools. | Optional but recommended. |
| **Google Sheets** | A simple spreadsheet copy of every lead (a handy backup). | Optional. Filled by Make. |
| **SendFox** | Email marketing: collects emails of people who gave one. | Optional. Filled by Make. |

### Demo mode vs Live mode

The site decides which mode to use **automatically**:

* **Demo mode** — no Supabase keys. Everything you do in the admin is saved **only inside your own
  browser**. A customer's order on *their* phone **never** reaches you. A yellow banner in the admin
  tells you when you are in demo mode. Great for trying things out. **Not usable for a real business.**
* **Live mode** — Supabase keys are present. Real database, real logins, edits go live for every visitor.

### Why this matters (what I found in your original project)

Your original code **did not actually connect to any of the four services** — it had no Supabase,
Google Sheets, SendFox or Make code in it at all. The orders were saved only in the visitor's own browser,
so you would have received nothing. I added the connections properly (this README explains them), and
fixed these other problems:

| Problem found | What I did |
|---|---|
| `npm install` would **fail** for anyone but the original author (the lock file pointed to a private server). | Rebuilt `package-lock.json` using the normal public npm registry. |
| Admin passwords (`owner2026`) were written in the website code — **anyone could read them** in the browser. | Real logins now come from Supabase. The demo passwords only work in demo mode. |
| Website edits were stored only in the editor's browser — **visitors would never see them**. | In live mode edits are saved to Supabase and shown to everyone. |
| Lead reference numbers were random and could repeat across devices. | The database now numbers them in order (`AV-1044`, `AV-1045`…). |
| The "Make webhook" box in Settings only saved on your device, so visitors' browsers never knew the address. | It is now a private build setting (`VITE_MAKE_WEBHOOK_URL`). |
| The Meta Pixel setting existed but did nothing. | Pixel now loads, and fires `Lead` and `Contact` events. |
| A leftover tool plugin and the starter `info.md` file. | Removed. |

---

## Part 2 — How to open the admin page

The admin page lives at the **same address as your website, with `#/admin` added on the end**.

| Where you are | Address to type in the browser |
|---|---|
| On your computer (Part 3) | `http://localhost:3000/#/admin` |
| After going online (Part 7) | `https://YOUR-GITHUB-NAME.github.io/YOUR-REPO-NAME/#/admin` |

Tips:

* The `#` is part of the address. Don't drop it.
* **Bookmark it.** There is deliberately **no public link** to the admin on the website, so customers
  don't see it. (Hiding the link isn't security — the *login* is. But it keeps things tidy.)
* **Logging in**
  * *Demo mode:* owner `owner@advibe.studio` / `owner2026`, or operations `ops@advibe.studio` / `ops2026`.
  * *Live mode:* the email and password you create in Part 4, step 5.
* **Two roles**: **owner** sees everything; **ops** doesn't see the Settings tab.
  ⚠️ This is a *convenience* in the screen, not a hard wall: any signed-in team member could, if technical,
  change settings through the database. Only add people you trust.

---

## Part 3 — Run the site on your computer

You only need this to preview changes before putting them online.

1. Install **Node.js** (the "LTS" version): <https://nodejs.org>. Accept all defaults.
2. Open the project folder. In it, open a terminal:
   * **Windows:** open the folder in File Explorer, click the address bar, type `cmd`, press Enter.
   * **Mac:** right-click the folder → *New Terminal at Folder*.
3. Type this and press Enter (takes ~1 minute the first time):
   ```
   npm install
   ```
4. Start the site:
   ```
   npm run dev
   ```
5. Open <http://localhost:3000>. The admin is at <http://localhost:3000/#/admin>.
6. Press `Ctrl + C` in the terminal to stop it.

Other useful commands: `npm run build` (makes the final files in a `dist` folder; also checks for mistakes).

---

## Part 4 — Connect Supabase (database + admin login)

Do this once. It takes about 15 minutes. Supabase's free plan is enough to start.

### Step 1 — Create a project
1. Go to <https://supabase.com> → **Start your project** → sign up.
2. **New project**. Name: `advibe`. Choose a **database password** (save it in a password manager — you
   won't need it day to day). Pick the **region closest to your customers**.
3. Wait ~2 minutes until the project finishes setting up.

### Step 2 — Create the tables (paste one file)
1. In Supabase's left menu click **SQL Editor** → **New query**.
2. Open the file `supabase/schema.sql` from this project, **copy everything**, paste it in, click **Run**.
3. You should see "Success. No rows returned". (It's safe to run it again later.)

What that did: created the tables (`leads`, `projects`, `site_content`, `profiles`, `audit_log`) and the
security rules. In plain English the rules say: *the public can read the website text; the public can
only **submit** an order (never read other people's); only signed-in team members can see leads,
projects, and edit the site.*

### Step 3 — Copy your two keys
1. Left menu → **Project Settings** (gear icon) → **API** (or **Data API** / **API Keys**, depending on the
   current layout).
2. Copy **Project URL** (looks like `https://abcdefgh.supabase.co`).
3. Copy the **anon / public** key (a long text starting `eyJ…`; newer projects may call it the
   *publishable* key). You'll use both in Part 5.

> 🔒 **Never** use or share the `service_role` / *secret* key. It bypasses all security. This project never
> needs it. The `anon`/publishable key is *meant* to be public.

### Step 4 — Switch off public sign-ups
Left menu → **Authentication** → **Sign In / Providers** (or **Settings**) → turn **off**
"Allow new users to sign up". This stops strangers creating accounts. (Even if they did, the security
rules would give them nothing — but switch it off anyway.)

### Step 5 — Create your admin login
1. Left menu → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter your email and a strong password. Tick **Auto Confirm User**. Click **Create user**.

### Step 6 — Make that user "staff"
Being logged in isn't enough; you must also be on the team list.

1. **SQL Editor** → **New query**, paste the following, **change the two values**, and Run:
   ```sql
   insert into public.profiles (id, name, role)
   select id, 'Your Name', 'owner'
   from auth.users
   where email = 'your-email@example.com';
   ```
   (`'owner'` can also be `'ops'` for a teammate. Repeat Steps 5–6 for each teammate.)
2. You should see "Success. 1 row affected". If it says **0 rows**, the email didn't match — check spelling.

### Step 7 — Add the keys to the project
Follow Part 5.

### Step 8 — Test it
1. `npm run dev`, open `http://localhost:3000/#/admin`.
2. The yellow **Demo mode** banner should be **gone**. Sign in with the account from Step 5.
3. Go to **Website** → change something → **Save**. Refresh the public site: your change is there.
4. Open the public site in a **private/incognito window**, fill in the order form.
5. Back in the admin → **Leads**: the order appears. 🎉
   (In Supabase: **Table Editor** → `leads` — you can see the same rows there like a spreadsheet.)

> **Note:** until you press **Save** in the admin once, visitors see the built-in default text. After the
> first save, the database copy is used.

---

## Part 5 — The `.env` file (your private keys)

The site needs three values. They live in a file called **`.env`**, which stays on your computer and is
**never uploaded to GitHub** (it's already in `.gitignore`).

1. In the project folder, find **`.env.example`**. Make a **copy** and name the copy exactly **`.env`**
   (nothing before the dot; on Windows you may need to enable "File name extensions" in Explorer's *View* menu).
2. Open `.env` in Notepad and fill in:
   ```
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...your long key...
   VITE_MAKE_WEBHOOK_URL=https://hook.eu2.make.com/xxxxxxxxxxxx
   ```
   No quotes, no spaces around `=`.
3. **Stop** (`Ctrl+C`) and **restart** `npm run dev`. The site only reads `.env` when it starts.

Leave a line empty to switch that service off (e.g. no Make yet → leave `VITE_MAKE_WEBHOOK_URL=` empty).

---

## Part 6 — Connect Make → Google Sheets + SendFox

**What happens:** when someone submits the order form, the website sends their details to a Make
"webhook" (a private web address Make gives you). Make then does the rest.

### Step 1 — Prepare the Google Sheet
1. Create a new Google Sheet named `AdVibe Leads`.
2. In **row 1**, type these headings, one per column (A to P), exactly:

   `ref` · `submitted_at` · `name` · `business` · `whatsapp` · `email` · `package_name` · `price_ngn` ·
   `industry` · `product` · `event` · `notes` · `utm_source` · `utm_medium` · `utm_campaign` · `page_url`
3. Tip: select column **F** (whatsapp) → *Format → Number → Plain text*, so numbers starting with `+` aren't mangled.

### Step 2 — Create the Make scenario
1. <https://make.com> → **Create a new scenario**.
2. Click the big **+** → search **Webhooks** → choose **Custom webhook**.
3. **Add** → name it `AdVibe order` → **Save**. Make shows you an address like
   `https://hook.eu2.make.com/abc123…`. **Copy it.**
4. Paste it in your `.env` as `VITE_MAKE_WEBHOOK_URL` (Part 5) and restart `npm run dev`.
5. In Make, click **Run once** (the scenario now waits, listening).
6. On your local site, submit a **test order** (use a fake name like "Test Person").
7. Make says *"Successfully determined"* — it has learned the fields (`ref`, `name`, `email`, …). ✅

> The site sends a "fire-and-forget" form post. Because of how browsers protect websites, the site can't
> read Make's reply — so a green tick on the website means "we sent it", not "Make processed it".
> Check Make's **History** tab to see what really arrived.

### Step 3 — Add the Google Sheets step
1. Click the **+** after the webhook → **Google Sheets** → **Add a Row**.
2. Connect your Google account, pick the spreadsheet `AdVibe Leads` and the sheet tab.
3. Make shows one box per column. Click each box and pick the matching field from the webhook
   (e.g. column `name` ← `name`). Map all 16.

### Step 4 — Add the SendFox step (only for people who gave an email)
The email box on the form is *optional*, and SendFox needs an email. So we add a gate:

1. Click the **+** after Google Sheets → **SendFox** → **Create a Contact**.
2. Connect SendFox: in SendFox go to **Account Settings → API → Create New Token**, copy the token
   (shown only once!) and paste it into Make.
3. **Email Address** ← `email` from the webhook. **Lists** ← choose your list.
4. **The gate:** click the small **wrench/filter icon on the line** between Google Sheets and SendFox →
   Label `Has email` → Condition: `email` → **Exists** (or *Is not empty*). Save.
5. *(Optional)* To also store the first and last name, use SendFox's **Make an API Call** module instead:
   `POST /contacts` with body `{"email":"{{email}}","first_name":"{{first_name}}","last_name":"{{last_name}}","lists":[YOUR_LIST_ID]}`.
   (Your list ID is in the web address when you open the list in SendFox.)

> ⚖️ **Consent:** SendFox (like all email tools) requires that people agreed to receive email. The order
> form currently doesn't say so. Add a line near the email box such as *"We'll email you updates and offers.
> Unsubscribe anytime."* — or only use SendFox for transactional follow-up. Check SendFox's terms and your
> local rules (e.g. NDPR in Nigeria).

### Step 5 — Turn it on
1. Bottom-left of the scenario: set **Scheduling** to **Immediately** and switch the scenario **ON**.
2. Run another test order; confirm a new row appears in the Sheet and the contact appears in SendFox.
3. Remember to add the webhook address to GitHub too (Part 7) so the *live* site sends leads.

### Good to know
* **The webhook address can be seen** by anyone who views your site's code. That's normal for websites,
  but it means a bot could send fake leads. In Make, add a filter right after the webhook, e.g. `name`
  length ≥ 2 and `whatsapp` length ≥ 7. If spam ever becomes a problem, ask for the upgrade: send leads
  to Make from a Supabase "Database Webhook" instead (keeps the address private).
* **Supabase is your source of truth.** If Make ever fails, the lead is still in Supabase → *Leads*.
  If Supabase ever fails, the lead is still in Make/Sheets. The customer is never shown an error.
* Make's free plan has a monthly operations limit — each step counts. Check your plan.

---

## Part 7 — Put the site online with GitHub Pages

### Step 1 — Upload the project to GitHub (no Git needed)

You'll use GitHub's website to upload the files by hand. There is no `.git` folder in this project on
purpose — you don't need it.

1. Create a free account at <https://github.com>, then click **+** (top right) → **New repository**.
   Name it e.g. `advibe-studio`, choose **Public** (GitHub Pages is free for public repositories), and
   click **Create repository**.
2. **Unzip** `advibe-studio.zip` on your computer. Open the unzipped `advibe-studio` folder.
3. On your new repository page click **uploading an existing file** (or **Add file → Upload files**).
4. Open the unzipped folder, select **everything inside it** (`Ctrl+A` / `Cmd+A`) and **drag it all**
   into the GitHub page. Drag the *contents*, not the outer `advibe-studio` folder itself — otherwise
   everything ends up one folder too deep and nothing will work.
5. Wait for the progress bars to finish. At the bottom click **Commit changes**.

**Never upload:** a `node_modules` folder, a `dist` folder, or a file named `.env` (it holds your private
keys). If you ran Part 3 on your computer these folders exist — leave them out. (Everything on the
screen in the upload list should be small; if you see thousands of files, `node_modules` got in.)

**Check the upload worked.** On your repository's main page you should see these at the top level:
`src`, `supabase`, `.github`, `index.html`, `package.json`, `package-lock.json`, `README.md` and others.

#### ⚠️ If the `.github` folder is missing
Folders starting with a dot are sometimes skipped by drag-and-drop (especially on Mac, where they are hidden).
Without it nothing gets published, so check. If you can't see `.github` in your repository, create the file
by hand:

1. Repository page → **Add file** → **Create new file**.
2. In the name box type exactly: `.github/workflows/deploy.yml`
   (typing each `/` automatically creates the folders).
3. Paste this whole block into the big text area:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_MAKE_WEBHOOK_URL: ${{ secrets.VITE_MAKE_WEBHOOK_URL }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. Click **Commit changes**.

### Step 2 — Give GitHub your three keys ("Secrets")
Repo page → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Create three, with
these **exact names**, and the same values as your `.env`:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon/publishable key |
| `VITE_MAKE_WEBHOOK_URL` | your Make webhook address |

### Step 3 — Turn on Pages
Repo → **Settings** → **Pages** → under **Build and deployment**, set **Source = GitHub Actions**.

### Step 4 — Deploy
Every time you commit a change to the repository, GitHub rebuilds and publishes the site automatically
(~2 minutes). Watch it under the repository's **Actions** tab — a green tick means it's live, a red ✗ means
something failed (click it to read why). Your address appears in **Settings → Pages**:
`https://YOUR-NAME.github.io/advibe-studio/`. For the admin, add `#/admin`.

**To change the site later:** on GitHub open the file → click the pencil ✏️ icon → edit → **Commit changes**.
Or upload a replacement: **Add file → Upload files**, drag a file with the **same name and folder** —
GitHub replaces the old one. (Most day-to-day edits don't need this at all — use the admin, Part 8.)

If you only changed a Secret (Step 2), nothing rebuilds by itself: go to **Actions** → *Deploy to GitHub
Pages* → **Run workflow**.

### Step 5 — Tell Supabase your site address
Supabase → **Authentication** → **URL Configuration** → set **Site URL** to your GitHub Pages address.

> Using your own domain (e.g. `advibe.studio`)? GitHub **Settings → Pages → Custom domain**, then update the Site URL above.

---

## Part 8 — Everyday jobs

**Change website text, prices, FAQs, testimonials, videos** → Admin → **Website** → edit → **Save changes**.
No code, no redeploy; it's live immediately.

**Add a video** → Admin → **Website** → **Portfolio** tab → add → paste the **YouTube link** (a normal video, or a
YouTube *Short* link). Set *Orientation* to **Vertical 9:16** for phone-shaped videos (Reels / TikTok / Shorts). The first ones appear on the spinning wall at the top.

**See and chase orders** → Admin → **Leads** (one tap opens WhatsApp). When a lead becomes a client,
use **Convert to project** and track it under **Projects**.

**Change colours** → open `src/styles/studio.css`, edit the block at the top (`:root`). Colours are
three numbers `R G B`. The gold is `--brand: 245 165 36`. To use the green from aistrikeforce.com instead:
`--brand: 1 216 126;` and `--blob-b: 185 240 210;` and `--hero-via: #f4fbf2;`.

**Change fonts** → fonts are installed as packages (`@fontsource…`). The three font names are in the `--font-…`
lines at the top of `studio.css`, and imported in `src/main.tsx`.

**Change the words that aren't in the admin** (section headings like "Every kind of ad your feed is missing.",
nav links) → `src/sections/sections.tsx` and `src/sections/chrome.tsx`. The *italic serif* word in each
heading is the one inside `<em>…</em>`; the hero headline always italicises its last word.

**Default text for a brand-new install** → `src/content/defaultContent.ts`.

**Add a teammate** → Part 4, Steps 5 and 6.

---

## Part 9 — Troubleshooting

| What you see | What it means / what to do |
|---|---|
| Yellow **Demo mode** banner in the admin | Keys missing. Check `.env` (Part 5) — file named exactly `.env`, no quotes, then **restart** `npm run dev`. On GitHub, check the 3 Secrets (Part 7). |
| "Incorrect email or password" in live mode | Re-check the user in Supabase → Authentication → Users. Reset the password there. |
| "This account is not set up as team staff yet" | You skipped Part 4, Step 6. Run that SQL (and check the email spelling). |
| Red bar "Could not load leads / Could not save…" | Usually the SQL (Part 4, Step 2) wasn't run, or ran with an error. Re-run `schema.sql`. Open the browser console (F12 → Console) for details. |
| Website edits don't appear on the public site | Did you press **Save changes**? Do a hard refresh (`Ctrl+Shift+R`). In demo mode edits never leave your browser. |
| Leads appear in Supabase but not in Google Sheets | Make scenario is off, or webhook address wrong. Check Make → **History**. Confirm `VITE_MAKE_WEBHOOK_URL` is set **in GitHub Secrets** for the live site, then push again. |
| Make says "waiting for data" | Click **Run once**, then submit a test order. |
| Videos show a plain gold block | Thumbnails come from YouTube. Check the video ID/link is correct and the video isn't private. |
| Site online but blank / old version | Check the **Actions** tab for a red ✗. Click it to read why. If there is no Actions tab activity at all, the `.github` folder didn't upload (Part 7, Step 1). |
| Nothing is published and Pages says "404" | Settings → Pages → **Source** must be **GitHub Actions** (Part 7, Step 3). Then Actions → **Run workflow**. |
| The upload page is taking forever / shows thousands of files | `node_modules` was included. Cancel, and upload only the files listed in Part 7, Step 1. |
| `npm install` errors | Make sure Node.js is installed (`node -v` shows a number). Delete the `node_modules` folder and run `npm install` again. |
| Changed a Secret but nothing changed online | Secrets are baked in when the site is *built*. Push any small change (or Actions → **Run workflow**) to rebuild. |

---

### Why the site loads fast on slow internet
* A small branded screen appears **instantly** (before any code downloads); on very slow connections it offers a "Tap to try again" button after 10 seconds.
* The admin dashboard, the order form and the Supabase library are **separate downloads** — normal visitors only fetch what they actually need, and the order form is pre-loaded quietly in the background.
* No animation library: reveals and drop-downs use the browser's built-in features.
* If the database is slow or down, visitors still see the site (it keeps the last copy of your text) and orders still go through to Make.

---

## Part 10 — Before-you-launch checklist

Some text in the default content is **sample placeholder** — replace it before real customers see it:

- [ ] **Payment instructions** — currently a fake bank account (`GTBank 0123456789`). Admin → Website → Settings.
- [ ] **WhatsApp number** — currently `2348012345678`. Same place. (Digits only, with country code.)
- [ ] **Contact email** — Settings.
- [ ] **Portfolio videos** — the sample YouTube videos are placeholders. Replace with **your own** work.
- [ ] **Testimonials and numbers** ("120+ videos delivered", "48 businesses served", client quotes, result
      badges) — these are sample figures. Only publish numbers and quotes that are **true**; invented
      testimonials can break advertising rules and customers' trust.
- [ ] **Meta Pixel ID** (optional) — Settings.
- [ ] Supabase: public sign-ups **off** (Part 4, Step 4).
- [ ] You can sign in on the **live** site and a test order appears in Leads, Google Sheets and (with an email) SendFox.
- [ ] Add a short **privacy note / email consent** wording near the email box (Part 6, Step 4).
- [ ] Delete test leads in Admin → Leads.

---

## Part 11 — Map of the project files

```
supabase/schema.sql          ← paste into Supabase once (tables + security + the safe "submit order" function)
.env.example                 ← copy to .env and fill in your keys
.github/workflows/deploy.yml ← the robot that publishes the site to GitHub Pages
src/
  styles/studio.css          ← THE LOOK of the public site (colours, fonts, spacing, cards, buttons)
  components/Wall.tsx        ← the spinning 3D video wall at the top
  components/OrderModal.tsx  ← the order form pop-up
  components/shared.tsx      ← small shared pieces (video card, video player pop-up, headings)
  sections/chrome.tsx        ← navigation bar, hero, trust numbers, "Ads we've made" scroller
  sections/sections.tsx      ← all the other sections (services, pricing, FAQ, footer …)
  pages/PublicSite.tsx       ← puts the sections in order
  pages/admin/…              ← the admin dashboard screens
  content/defaultContent.ts  ← your original copy (the starting text)
  lib/store.tsx              ← the "brain": loads/saves data (Supabase in live mode, browser in demo mode)
  lib/supabase.ts            ← the Supabase connection (the big library loads only on the admin page)
  lib/publicApi.ts           ← tiny, fast code visitors use to read the website text and send orders
  lib/integrations.ts        ← sends each lead to Make
  lib/tracking.ts            ← Meta Pixel
```

**Security summary, honestly:** the Supabase `anon` key and the Make address are visible in the website
code — normal for websites. Your data is protected by the **security rules** in `schema.sql`, not by hiding keys.
Never commit `.env`, never use the `service_role` key, and only add team members you trust.

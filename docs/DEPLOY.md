# Putting First Hour online

This guide gets First Hour onto the web as a private page at
**firsthour.fieldguide.help**, for free, using the same Cloudflare account
that already runs fieldguide.help.

You do **not** need to touch any code. You'll click through the Cloudflare
website once, and after that every change you save to the project publishes
itself automatically.

Total cost: **$0.** No new domain, no monthly fee.

---

## What you're doing, in plain terms

Cloudflare will take this project, build it into a website, and serve it at a
web address of your choosing. You point it at the project once. From then on,
it re-publishes on its own whenever the project is updated.

The page will be **hidden**: it won't appear on fieldguide.help, and it's told
search engines like Google to ignore it. Only someone you send the link to can
find it.

---

## One-time setup (about 5 minutes)

### Step 1 — Open Cloudflare

1. Go to **https://dash.cloudflare.com** and sign in (the same login you use
   for fieldguide.help).

### Step 2 — Create the site

2. In the left-hand menu, click **Workers & Pages**.
3. Click the blue **Create** button, then choose the **Pages** tab.
4. Click **Connect to Git**.
5. If asked, allow Cloudflare to access GitHub, then pick the repository named
   **`FirstHour`** from the list. Click **Begin setup**.

### Step 3 — Tell it how to build (copy these exactly)

6. On the setup screen, if there's a **Framework preset** dropdown, choose
   **Vite**. That fills in the two boxes below automatically. If it doesn't,
   type them in yourself:

   | Box                    | What to type    |
   | ---------------------- | --------------- |
   | Production branch      | `main`          |
   | Build command          | `npm run build` |
   | Build output directory | `dist`          |

   (If there's a **Production branch** dropdown, choose **`main`**. That's the
   copy of the project that has everything in it.)

7. Leave everything else as-is and click **Save and Deploy**.
8. Wait a minute or two. Cloudflare builds the site and shows a green success
   message with a temporary web address ending in `.pages.dev`. You can click
   it to check the app works. (This address is ugly — you'll replace it in the
   next step.)

### Step 4 — Give it the nice, hidden address

9. On the project page, click the **Custom domains** tab.
10. Click **Set up a domain**.
11. Type **`firsthour.fieldguide.help`** and click **Continue**, then
    **Activate domain**.
12. Because Cloudflare already manages fieldguide.help, it sets everything up
    for you. Wait a couple of minutes.

**Done.** Open **https://firsthour.fieldguide.help** — First Hour is live.

---

## After setup: how to make changes

You never repeat the steps above. Whenever the project is updated and saved,
Cloudflare notices and re-publishes the site within a minute or two, all on its
own. There's nothing to click.

---

## How "hidden" this is

- It is **not linked** from fieldguide.help, so nobody stumbles onto it.
- It **asks Google and other search engines to ignore it**, so it won't show up
  in search results.
- **But** anyone you give the link to can open it — there's no password.

That's usually the right level for a personal app. If you ever want a real
password on it, Cloudflare's free **Access** feature can add an email or
password gate — just ask and it can be turned on.

---

## If something looks wrong

- **The build failed (red message in Step 3):** double-check the two boxes say
  exactly `npm run build` and `dist`, then click **Retry deployment**.
- **The custom domain says "pending" for a while:** give it up to 15 minutes;
  Cloudflare is setting up the secure connection.
- **The page loads but looks broken:** it may be a saved older version in your
  browser. Refresh the page, or open it in a private/incognito window.

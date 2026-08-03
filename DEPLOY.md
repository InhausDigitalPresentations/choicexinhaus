# Deploying to Cloudflare Pages

This folder is the finished site. There is no build step, no dependencies and no
framework. Upload it as-is.

## Option A — Drag and drop (fastest)

1. Go to **Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets**.
2. Name the project, for example `choice-inhaus`.
3. Drag **the contents of this folder** into the upload area, so that `index.html`
   sits at the top level of the upload, not inside a sub-folder.
4. Click **Deploy site**.

The deck goes live at `https://<project-name>.pages.dev`.

To publish an update later, open the project, choose **Create new deployment**, and
upload the folder again.

## Option B — Connect a Git repository

1. Push the contents of this folder to a repository, with `index.html` at the root.
2. In Cloudflare Pages choose **Connect to Git** and select the repository.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** leave empty
   - **Build output directory:** `/`
4. Deploy. Every push to the default branch republishes automatically.

## Custom domain

In the project, open **Custom domains → Set up a custom domain** and add for example
`proposal.inhaus.ae`. If the domain is already on Cloudflare the DNS record is created
for you, otherwise add the CNAME that Cloudflare shows. HTTPS is issued automatically.

## Keeping it private

The proposal is a client document, so it ships with `noindex, nofollow` both as a meta
tag and as an `X-Robots-Tag` header, which keeps it out of search engines. Anyone with
the URL can still open it. To require a login, open **Settings → Access policy** on the
Pages project and enable Cloudflare Access, then add Emeric's email address. That is
the only way to genuinely restrict who can view it.

## What is in this folder

```
index.html      The presentation
404.html        Branded not-found page
_headers        Security and caching headers applied by Cloudflare
css/styles.css  Design system and responsive rules
js/main.js      Scroll reveals, counters, navigation, lazy video
assets/         Images, background video loops, posters, logos
```

`_headers` sets a one-day cache on images and video and a one-hour cache on CSS and JS,
so swapping an image for one with the same filename shows up the next day at the latest.
For an instant refresh, rename the file and update the reference in `index.html`.

## Notes

- Total size is about 12 MB across 55 files, comfortably inside the Cloudflare Pages
  limits of 25 MB per file and 20,000 files.
- All links are relative, so the site works on `pages.dev`, on a custom domain, or in a
  sub-folder without changes.
- The source project, including the raw clips and the ffmpeg pipeline used to build the
  video loops, stays in `choice-inhaus-proposal/`. This folder is the deploy output
  only. Make edits in the source project, then re-copy `index.html`, `css`, `js` and
  `assets` across.

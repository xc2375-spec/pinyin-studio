# Pinyin Studio

A mobile-first Mandarin pronunciation lab for Columbia University students. It includes Pinyin structure, initials, finals, tones, tone sandhi, native-speaker recordings, and interactive practice.

## Run locally

```bash
pnpm install
pnpm dev
```

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload everything in this folder, including the `.github` folder.
3. Open **Settings → Pages** in the repository.
4. Under **Build and deployment**, choose **GitHub Actions** as the source.
5. Open the **Actions** tab and wait for “Deploy Pinyin Studio to Pages” to finish.

Your public URL will be `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

## Build locally

```bash
pnpm build
```

All pronunciation samples are stored locally under `public/audio/` and come from the University of Oxford Centre for Teaching Chinese as a Foreign Language.

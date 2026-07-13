# Deployment guide

SkillHot is a static Vite application. The site can be deployed to GitHub Pages or any static host. Optional sign-in and favorites use Supabase; the public catalog remains available without a Supabase configuration.

## Local development

From the repository root:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Run the quality gates before opening a pull request or publishing a deployment:

```sh
pnpm check
pnpm build
pnpm test:e2e
```

## Optional Supabase configuration

Copy the example file and supply values for your own Supabase project:

```sh
cp .env.example .env.local
```

The browser may use a Supabase project URL and publishable/anon key. Never commit `.env.local`, a service-role key, OAuth client secret, SMTP password, personal access token, or any other credential.

Apply the migrations in `supabase/migrations/` to the Supabase project you control. Keep row-level security enabled for user-specific data such as favorites.

## GitHub Pages

The repository includes workflows for data updates and static-site deployment. Configure the repository's Pages source and any custom domain in GitHub repository settings. If a custom domain is used, put only that domain in `public/CNAME`; do not add DNS provider credentials to this repository.

For deployments that require browser environment variables, store them as GitHub Actions secrets or variables in the repository settings. Use only publishable client-side values in `VITE_*` variables and keep privileged keys server-side.

## Catalog updates

The data update workflow retrieves public repository metadata, validates generated files, and commits a refreshed catalog. It uses the GitHub Actions token supplied to the workflow and should not require a personal token.

To run the same process locally, follow the scripts exposed in `package.json`. Use an authenticated GitHub CLI session only when a script explicitly needs public GitHub API access; never save `gh auth token` output into a tracked file.

## Release checklist

- Run `pnpm check`, `pnpm build`, and the relevant end-to-end tests.
- Confirm the working tree contains no `.env*` file other than `.env.example`.
- Review generated catalog changes before committing them.
- Confirm no documentation contains local paths, private infrastructure identifiers, credentials, or real user data.
- Verify the deployed site and custom-domain configuration from the host's dashboard after publishing.

## Troubleshooting

- If the site shows old data, inspect the update and deployment workflow runs before retrying them.
- If sign-in is unavailable, verify the local environment variables, Supabase URL configuration, redirect URLs, and row-level security policies in the Supabase dashboard.
- If a custom domain does not resolve, verify its DNS records and the host's domain-verification status. Keep provider credentials outside the repository.

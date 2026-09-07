# Study Design Diagram Studio

A browser workspace by Black Swan Causal Labs for creating, reviewing, and exporting epidemiologic study design diagrams.

**Live app:** https://sdds.blackswancausallabs.com

## Features

- Model washout, inclusion, exclusion, covariate assessment, and follow-up windows relative to an index event.
- Edit window dates by dragging timeline edges or entering values, with keyboard controls and Undo.
- Record study details, assessment rules, source notes, footnotes, and abbreviations.
- Save and import structured JSON; export SVG, PDF, and editable PowerPoint diagrams.
- Review a completeness checklist and work with a compatible browser agent through 10 WebMCP tools.

The workspace is session-only. Use **Save JSON** to preserve edits before leaving. The preloaded example was transcribed from a reference figure and has not been verified against its manuscript. Completeness checks establish information presence, not methodological validity or source accuracy. The app does not extract information from PDFs.

## Local development

Requires Node.js 22.13 or later and npm. Node.js 24 was used for the initial deployment.

```sh
npm ci
npm run dev
```

Create and preview a production build:

```sh
npm run build
npm run preview
```

The app uses React, TypeScript, Vite, Tailwind CSS, Zod, jsPDF, and PptxGenJS. The studio is a static application. Its optional remote MCP bridge runs separately on Cloudflare Workers and Durable Objects; ordinary manual editing and native WebMCP do not require a paired relay session.

## Cloudflare deployment

The existing Cloudflare Pages project is `sdds`, with production branch `main` and build output `dist`.

| Setting | Value |
| --- | --- |
| Custom domain | `sdds.blackswancausallabs.com` |
| Pages hostname | `sdds-1wj.pages.dev` |
| Wrangler configuration | `wrangler.json` |
| DNS record | CNAME `sdds` → `sdds-1wj.pages.dev` |

From a checkout with access to the Cloudflare account:

```sh
npm ci
npx wrangler login
npm run build
npx wrangler pages deploy dist --project-name sdds --branch main
```

Wrangler opens authentication in your default browser. The Pages project and custom domain are already configured; normal redeployments do not require recreating them. For a new environment, create a separate Pages project and add its custom domain through Cloudflare's Pages dashboard.

Deployment is currently manual through Wrangler. Pushing to this GitHub repository does not automatically deploy to Cloudflare. Never commit Cloudflare tokens, `.env` files, `.dev.vars` files, or local Wrangler state.

## WebMCP

The app detects `document.modelContext`, with a fallback to `navigator.modelContext`. Manual editing remains available in browsers without WebMCP support. Tools operate on the current page's in-memory study, and mutations require `expected_revision` to protect against stale edits.

| Tool | Purpose |
| --- | --- |
| `get_study_spec` | Read the current specification and revision |
| `update_design_element` | Update a window |
| `add_design_element` | Add a window |
| `remove_design_element` | Remove a window |
| `reorder_design_elements` | Reorder timeline rows |
| `update_study_details` | Update study-level metadata |
| `import_study_spec` | Replace the current specification |
| `clear_study_spec` | Start a blank design |
| `validate_study_spec` | Read completeness checks and review items |
| `export_schematic` | Return SVG without triggering a download |

Unknown dates are represented by `null`; unresolved text stays blank. Source notes should distinguish documented evidence from researcher-defined choices.

## Source layout

- `components/study/`: editor, timeline, and information panels
- `components/ui/`: reusable interface components
- `lib/study/`: schema, validation, timeline layout, export, and WebMCP tools
- `app/globals.css`: application styling
- `public/`: PDF font and its license
- `vendor/`: vendored stylesheet and its license

## Licensing and contact

No license for the application source has been granted in this repository. Third-party assets retain their included licenses; see `public/DejaVu-font-license.txt` and `vendor/shadcn-tailwind-4.13.0.LICENSE.md`.

Black Swan Causal Labs: https://blackswancausallabs.com · info@blackswancausallabs.com

## Remote MCP clients

An optional [remote MCP bridge](mcp-bridge/README.md) connects other MCP clients to the same live browser canvas. Open the app, select **Connect MCP**, and enable a temporary connection. Native WebMCP continues to work without pairing. Registry metadata is in [`server.json`](server.json).

# GitHub Actions plan — workflow files baad me

Har web app ka alag Cloudflare Pages project, alag env
(`NEXT_PUBLIC_API_URL` us app ke backend ka), alag deploy
workflow hoga — ek app ka deploy dusre ko tode nahi.

Deploy rasta (docs ke liye): GitHub Actions + wrangler pages
deploy direct upload, static export (`out` folder) se.

Is folder me abhi koi workflow `.yml` file nahi hai. Workflow
files tabhi add honge jab user deploy setup ke liye alag se
approval dega.

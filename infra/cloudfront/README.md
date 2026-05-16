# CloudFront + S3 — first-time setup

Both frontends (`airbotix-app` → `app.airbotix.ai`, `teacher-console` → `teacher.airbotix.ai`) use the same pattern. Run this twice, once per frontend.

## Prerequisites

- AWS account ID
- `*.airbotix.ai` ACM certificate **in us-east-1** (CloudFront requirement)
- Cloudflare DNS zone for `airbotix.ai`

## 1. Issue the wildcard ACM cert (one-time, both distributions share it)

```bash
aws acm request-certificate \
  --region us-east-1 \
  --domain-name "*.airbotix.ai" \
  --subject-alternative-names "airbotix.ai" \
  --validation-method DNS
```

AWS returns CNAME records to add to Cloudflare for validation. Add them, wait ~2 min, status flips to `ISSUED`.

Capture the cert ARN — you'll need it below as `ACM_CERT_ARN`.

## 2. Create the S3 bucket (private)

```bash
BUCKET=airbotix-app-prod              # or teacher-console-prod
REGION=ap-southeast-2

aws s3api create-bucket \
  --bucket "$BUCKET" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION"

aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

## 3. Create the Origin Access Control (OAC)

```bash
aws cloudfront create-origin-access-control \
  --origin-access-control-config \
    Name="$BUCKET-oac",SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3
```

Capture the `Id` — that's your `OAC_ID`.

## 4. Create the CloudFront distribution

```bash
# Render the template
sed \
  -e "s/\${BUCKET_NAME}/$BUCKET/g" \
  -e "s/\${DOMAIN}/app.airbotix.ai/g" \
  -e "s/\${OAC_ID}/$OAC_ID/g" \
  -e "s|\${ACM_CERT_ARN}|$ACM_CERT_ARN|g" \
  -e "s/\${TIMESTAMP}/$(date +%s)/g" \
  spa-distribution.json > /tmp/spa-distribution.rendered.json

aws cloudfront create-distribution \
  --distribution-config "file:///tmp/spa-distribution.rendered.json"
```

Capture the distribution `Id` — that's your `DIST_ID`. Note also `DomainName` (e.g. `dxxx.cloudfront.net`) — you'll point Cloudflare DNS at this.

## 5. Attach the bucket policy

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

sed \
  -e "s/\${BUCKET_NAME}/$BUCKET/g" \
  -e "s/\${ACCOUNT_ID}/$ACCOUNT_ID/g" \
  -e "s/\${DIST_ID}/$DIST_ID/g" \
  s3-bucket-policy.json > /tmp/bucket-policy.json

aws s3api put-bucket-policy \
  --bucket "$BUCKET" \
  --policy "file:///tmp/bucket-policy.json"
```

## 6. Point Cloudflare DNS at the distribution

In Cloudflare dashboard for `airbotix.ai`:

- Type: `CNAME`
- Name: `app` (or `teacher`)
- Target: `dxxx.cloudfront.net` (the distribution's `DomainName`)
- Proxy status: **DNS only** (grey cloud)

⚠ Do NOT enable Cloudflare proxy ("orange cloud") in front of CloudFront — double-proxy breaks WebSocket and adds latency. CloudFront does the CDN job already.

## 7. Verify

```bash
# Upload a placeholder index.html before testing routes
echo '<html><body>Airbotix app — placeholder</body></html>' > /tmp/index.html
aws s3 cp /tmp/index.html s3://$BUCKET/index.html

# Wait ~5 min for distribution to deploy, then:
curl -I https://app.airbotix.ai
# Expect: HTTP/2 200, content-type: text/html
```

## 8. Wire up the deploy workflow

Copy `infra/github-actions/deploy-airbotix-app.yml.example` into `Airbotix-AI/airbotix-app/.github/workflows/deploy.yml`, fill in:

- `aws-region: ap-southeast-2`
- `role-to-assume`: an IAM role with OIDC trust for that GitHub repo + S3-sync + CloudFront-invalidation perms
- `bucket-name: airbotix-app-prod`
- `distribution-id: <DIST_ID>`

Same drill for `teacher-console`.

## SPA fallback — the one config that matters

The template already has it (`CustomErrorResponses`): 403 + 404 → `/index.html` with `200`. **Do not remove these.** React Router v6 needs them or `/portal/family/:id` 404s on refresh.

## Cache strategy

- `/index.html` → managed `CachingDisabled` policy (immediate updates on deploy)
- everything else (`/assets/*`, fonts, images) → managed `CachingOptimized` policy (24h default, Vite hashes filenames so it's safe)
- API responses do **not** transit CloudFront — frontends call `api.airbotix.ai` directly

## On invalidation

After each deploy:

```bash
aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/index.html"
```

You don't need to invalidate hashed assets — they're new filenames, fresh cache.

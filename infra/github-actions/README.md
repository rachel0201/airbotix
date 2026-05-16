# GitHub Actions deploy workflows

Three templates. Copy each into its target repo's `.github/workflows/deploy.yml`, fill in the placeholders, commit.

| File | Target repo | Mechanism |
|---|---|---|
| `deploy-airbotix-app.yml.example` | `Airbotix-AI/airbotix-app` | S3 sync + CloudFront invalidation |
| `deploy-teacher-console.yml.example` | `Airbotix-AI/teacher-console` | S3 sync + CloudFront invalidation |
| `deploy-platform-backend.yml.example` | `Airbotix-AI/platform-backend` | ECR push + SSH `docker compose pull && up -d` |

## One-time AWS setup (before workflows can run)

### 1. GitHub OIDC trust

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
  --client-id-list sts.amazonaws.com
```

### 2. IAM role per deploy lane

Three roles, one per repo. Trust policy template:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": { "token.actions.githubusercontent.com:sub": "repo:Airbotix-AI/<REPO_NAME>:ref:refs/heads/main" }
    }
  }]
}
```

Permissions per role:

| Role | Allows |
|---|---|
| `gh-actions-deploy-airbotix-app` | `s3:PutObject*`, `s3:DeleteObject` on `airbotix-app-prod/*`; `s3:ListBucket` on `airbotix-app-prod`; `cloudfront:CreateInvalidation` on the matching distribution |
| `gh-actions-deploy-teacher-console` | Same as above, scoped to `teacher-console-prod` + its distribution |
| `gh-actions-build-platform-backend` | `ecr:GetAuthorizationToken` (resource: `*`); push/pull on `airbotix/platform-backend` repo |

The platform-backend role only pushes to ECR. **The actual EC2 deploy step uses SSH** — there's no AWS IAM call from inside the EC2 deploy step. EC2 itself uses an *instance profile* (different IAM role attached to the instance) to do its ECR pull + AWS Secrets Manager reads.

### 3. EC2 instance profile

Attach an IAM role to the EC2 instance with:
- `ecr:GetAuthorizationToken`, `ecr:BatchGetImage`, `ecr:GetDownloadUrlForLayer` on `airbotix/platform-backend`
- `secretsmanager:GetSecretValue` on `/airbotix/prod/*`
- `s3:GetObject`, `s3:PutObject` on `airbotix-artifacts-prod/*`
- `s3:PutObject` for signed-URL pre-signing (the SDK uses this scope)

### 4. SSH key for platform-backend deploys

Generate a dedicated key (not your personal one):

```bash
ssh-keygen -t ed25519 -f ./gh-deploy-key -N "" -C "gh-actions@airbotix"
```

- Upload `gh-deploy-key.pub` to `/home/ubuntu/.ssh/authorized_keys` on the EC2
- Add `gh-deploy-key` (private key) to GitHub repo secrets as `EC2_SSH_PRIVATE_KEY`
- Run `ssh-keyscan <EIP>` from a trusted machine; paste the output into `EC2_HOST_KEY` secret

## Smoke test the workflow

```bash
gh workflow run deploy.yml --ref main
gh run watch
```

# Deployment Guide

This project supports deployment to both GitHub Pages repository URLs and custom domains.

## Current Configuration

- **GitHub Pages**: https://nagarjunags.github.io/peptalkcounselling/
- **Future Custom Domain**: kcetcounselling.physicspeptalk.com

## How It Works

### Vite Base Path Configuration

The `vite.config.ts` uses an environment variable approach:
- `VITE_BASE_PATH` environment variable controls the base path
- Default: `"/"` (for localhost and custom domains) 
- GitHub Actions sets: `"/peptalkcounselling/"` for repository deployment

### Local Development

```bash
npm run dev
# Serves from http://localhost:5173/ (base path "/")
```

### GitHub Pages Deployment

The GitHub Actions workflow automatically:
1. Sets `VITE_BASE_PATH=/peptalkcounselling/`
2. Builds the project with correct asset paths
3. Deploys to GitHub Pages

### Switching to Custom Domain

When ready to use the custom domain:

1. **Enable CNAME file:**
   ```bash
   mv public/CNAME.disabled public/CNAME
   ```

2. **Configure DNS** (add to DNS provider):
   ```
   Type: CNAME
   Host: kcetcounselling
   Value: nagarjunags.github.io
   ```

3. **Update GitHub Pages settings:**
   - Go to repository Settings → Pages
   - Set custom domain: `kcetcounselling.physicspeptalk.com`
   - Enable "Enforce HTTPS"

4. **Remove base path from workflow** (optional optimization):
   Remove the `VITE_BASE_PATH` environment variable from `.github/workflows/deploy.yml`

The configuration will automatically work with both repository URLs and custom domains without code changes.

## Asset Path Examples

### Local Development & Custom Domain
```html
<script src="/assets/main-[hash].js"></script>
<link href="/assets/main-[hash].css">
```

### GitHub Pages Repository
```html
<script src="/peptalkcounselling/assets/main-[hash].js"></script>  
<link href="/peptalkcounselling/assets/main-[hash].css">
```

## Troubleshooting

**Issue: Assets not loading on GitHub Pages**
- Check that `VITE_BASE_PATH` is set in GitHub Actions
- Verify the environment variable matches your repository name

**Issue: Local dev not working**  
- Ensure no `VITE_BASE_PATH` is set locally
- Check `vite.config.ts` defaults to `"/"`

**Issue: Custom domain not working**
- Verify `public/CNAME` file exists (not `.disabled`)
- Check DNS configuration
- Ensure HTTPS is enforced in GitHub Pages settings
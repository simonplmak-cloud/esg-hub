# Deployment Guide: ESG Resources Hub on GitHub Pages

This guide walks you through deploying the ESG Resources Hub to GitHub Pages.

---

## Prerequisites

- GitHub account
- Git installed on your local machine
- Basic familiarity with command line

---

## Step 1: Create GitHub Repository

### Option A: Create New Repository on GitHub.com

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Repository settings:
   - **Name**: `esg-resources-hub` (or your preferred name)
   - **Description**: "Comprehensive ESG resources organized by academic frameworks"
   - **Visibility**: Public (required for free GitHub Pages)
   - **Initialize**: Do NOT initialize with README (we already have one)
4. Click "Create repository"

### Option B: Use GitHub CLI

```bash
gh repo create esg-resources-hub --public --description "Comprehensive ESG resources organized by academic frameworks"
```

---

## Step 2: Upload Repository Content

### Initialize Git and Push

```bash
# Navigate to the repository directory
cd /path/to/esg-resources-hub

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: ESG Resources Hub with academic frameworks"

# Add remote origin (replace with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/esg-resources-hub.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Enable GitHub Pages

### Via GitHub Website

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source":
   - **Branch**: Select `main`
   - **Folder**: Select `/ (root)`
5. Click "Save"
6. Wait 1-2 minutes for deployment
7. Your site will be available at: `https://YOUR-USERNAME.github.io/esg-resources-hub/`

### Via GitHub CLI

```bash
gh repo edit --enable-pages --pages-branch main
```

---

## Step 4: Configure Custom Domain (Optional)

### If You Have a Custom Domain

1. In your repository settings → Pages
2. Under "Custom domain", enter your domain (e.g., `esg-resources.com`)
3. Click "Save"
4. In your domain registrar (GoDaddy, Namecheap, etc.):
   - Add a CNAME record pointing to `YOUR-USERNAME.github.io`
   - Or add A records pointing to GitHub Pages IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
5. Wait for DNS propagation (up to 24 hours)
6. Enable "Enforce HTTPS" in GitHub Pages settings

### Update _config.yml

```yaml
# Update these lines in _config.yml
url: "https://esg-resources.com"  # Your custom domain
baseurl: ""  # Leave empty for custom domain
```

Commit and push the changes:
```bash
git add _config.yml
git commit -m "Update site URL for custom domain"
git push
```

---

## Step 5: Verify Deployment

1. Visit your GitHub Pages URL
2. Check that all pages load correctly:
   - Home page
   - Books page
   - Environmental, Social, Governance framework pages
   - Navigation links
3. Test on mobile and desktop
4. Verify all external links work

---

## Step 6: Set Up Continuous Deployment

GitHub Pages automatically rebuilds your site when you push changes to the `main` branch.

### Workflow

```bash
# Make changes to your local files
# ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add new video resources for climate change"

# Push to GitHub
git push

# Wait 1-2 minutes for automatic rebuild
```

---

## Troubleshooting

### Site Not Loading

**Problem**: Site shows 404 error  
**Solution**: 
- Ensure GitHub Pages is enabled in repository settings
- Check that `main` branch is selected as source
- Wait 2-5 minutes after enabling Pages

### Styling Issues

**Problem**: Site looks unstyled or broken  
**Solution**:
- Check `baseurl` in `_config.yml`:
  - For `username.github.io/repo-name`: `baseurl: "/repo-name"`
  - For custom domain: `baseurl: ""`
- Clear browser cache and refresh

### Jekyll Build Errors

**Problem**: GitHub Pages build fails  
**Solution**:
- Check the "Actions" tab in your repository for error messages
- Common issues:
  - Invalid YAML syntax in `_config.yml` or front matter
  - Missing or incorrect Jekyll plugins
  - Liquid template syntax errors

### Local Testing

To test locally before pushing:

```bash
# Install Jekyll
gem install bundler jekyll

# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Open http://localhost:4000 in browser
```

---

## Maintenance

### Adding New Resources

1. **Videos**: Edit `_data/videos.yml`
2. **Standards**: Create new files in `standards/` directory
3. **Research**: Create new files in `research/` directory
4. **Books**: Update `books.md` when new books are published

### Updating Content

```bash
# Edit files locally
# ...

# Commit and push
git add .
git commit -m "Update: [describe changes]"
git push
```

### Monitoring Traffic

Enable Google Analytics:

1. Get Google Analytics tracking ID
2. Add to `_config.yml`:
   ```yaml
   google_analytics: UA-XXXXXXXXX-X
   ```
3. Commit and push

---

## Security

### Best Practices

1. **Never commit sensitive data**: API keys, passwords, personal information
2. **Review pull requests**: If accepting contributions, review carefully
3. **Keep dependencies updated**: Run `bundle update` periodically
4. **Enable branch protection**: Require reviews for main branch changes

### HTTPS

GitHub Pages provides free HTTPS:
- Automatically enabled for `*.github.io` domains
- Available for custom domains (enable in settings)

---

## Advanced Configuration

### Custom 404 Page

Create `404.md`:
```markdown
---
layout: page
title: "Page Not Found"
permalink: /404.html
---

# 404: Page Not Found

The page you're looking for doesn't exist.

[Return to Home](/)
```

### Search Functionality

Add Jekyll search plugin:

1. Add to `Gemfile`:
   ```ruby
   gem 'jekyll-algolia'
   ```

2. Configure in `_config.yml`:
   ```yaml
   plugins:
     - jekyll-algolia
   
   algolia:
     application_id: YOUR_APP_ID
     index_name: esg_resources
   ```

3. Run indexing:
   ```bash
   bundle exec jekyll algolia
   ```

---

## Performance Optimization

### Image Optimization

- Compress images before uploading
- Use appropriate formats (JPEG for photos, PNG for graphics, SVG for logos)
- Consider using a CDN for large media files

### Caching

GitHub Pages automatically caches static assets.

To force cache refresh:
- Add version query strings: `style.css?v=2`
- Or use cache-busting filenames: `style.v2.css`

---

## Backup

### Regular Backups

Your repository IS your backup, but consider:

1. **Local clone**: Keep a local copy
2. **Mirror repository**: Create a private mirror on another service
3. **Export data**: Periodically export `_data/` files

```bash
# Clone to another location
git clone https://github.com/YOUR-USERNAME/esg-resources-hub.git esg-backup
```

---

## Support

### Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Jekyll Themes](https://jekyllthemes.io/)

### Getting Help

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions and share ideas
- **Jekyll Talk**: Community forum for Jekyll users

---

## Next Steps

1. ✅ Deploy to GitHub Pages
2. ✅ Verify all pages load correctly
3. 📝 Add more curated resources
4. 🎨 Customize theme and styling
5. 📊 Set up analytics
6. 🔍 Add search functionality
7. 📱 Test mobile responsiveness
8. 🚀 Promote your resource hub

---

## Contact

For deployment issues or questions:

**Email**: mary.chan@ascent-partners.com  
**Website**: [simonmak.com](https://simonmak.com)

---

<small>
**Last Updated**: January 2025  
**Version**: 1.0
</small>

# ESG Resources Hub - Complete Deployment Guide

## 📦 What's Included

This repository contains a complete GitHub Pages website featuring:

- **10 ESG Books** by Simon Mak (PDF format, 29 MB total)
- **Academic Framework Organization**:
  - Environmental: 9 Planetary Boundaries
  - Social: 5 Stakeholder Theory Dimensions
  - Governance: 5 Governance Mechanisms
- **Jekyll-based Static Site** ready for GitHub Pages
- **Responsive Design** with professional styling
- **Book Cover Images** for visual appeal

---

## 🚀 Quick Start (10 Minutes)

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click **"New repository"** (green button)
3. Repository settings:
   - **Name**: `esg-resources` (or any name you prefer)
   - **Description**: "ESG educational resources by Simon Mak - Ascent Partners Foundation"
   - **Visibility**: Public (required for free GitHub Pages)
   - **Initialize**: Do NOT check any boxes
4. Click **"Create repository"**

### Step 2: Upload Repository Files

**Option A: Using GitHub Web Interface (Easiest)**

1. Extract `esg-resources-github-final.tar.gz`
2. In your new GitHub repository, click **"uploading an existing file"**
3. Drag all extracted files into the upload area
4. Scroll down and click **"Commit changes"**

**Option B: Using Git Command Line**

```bash
# Extract the archive
tar -xzf esg-resources-github-final.tar.gz
cd esg-resources-github-repo

# Initialize and push to GitHub
git init
git add .
git commit -m "Initial commit: ESG Resources Hub"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/esg-resources.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. In your repository, go to **Settings** → **Pages**
2. Under "Source", select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
3. Click **"Save"**
4. Wait 2-3 minutes for deployment
5. Your site will be live at: `https://YOUR-USERNAME.github.io/esg-resources/`

---

## 🎨 Customization

### Update Site Information

Edit `_config.yml` to customize:

```yaml
title: "ESG Resources Hub"
description: "Comprehensive ESG educational resources by Simon Mak"
author: "Simon Mak / Ascent Partners Foundation"
email: "mary.chan@ascent-partners.com"
url: "https://YOUR-USERNAME.github.io"
baseurl: "/esg-resources"
```

### Add Your Custom Domain (Optional)

1. Purchase a domain (e.g., `esgresources.org`)
2. In your repository, go to **Settings** → **Pages**
3. Under "Custom domain", enter your domain
4. In your domain registrar, add these DNS records:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   
   Type: CNAME
   Name: www
   Value: YOUR-USERNAME.github.io
   ```

---

## 📚 Content Structure

```
esg-resources-github-repo/
├── _config.yml              # Jekyll configuration
├── index.md                 # Home page
├── books.md                 # Books catalog with download links
├── environmental.md         # Planetary Boundaries framework
├── social.md                # Stakeholder Theory framework
├── governance.md            # Governance framework
├── books/                   # PDF files (11 books)
│   ├── ESG_Reporting_Made_Simple_IFRS.pdf
│   ├── ESG_Reporting_Made_Simple_GRI.pdf
│   ├── Carbon_Credits_Made_Simple_Book.pdf
│   ├── ESG_Reporting_Made_Simple_TNFD.pdf
│   ├── Carbon_Accounting_in_Practice ver2.pdf
│   ├── Climate_Financial_Impact_in_Practice_CORRECTED.pdf
│   ├── Social Impact Accounting.pdf
│   ├── Biodiversity_Ecosystem_Services_Accounting_ENHANCED.pdf
│   ├── Plastic_Accounting_In_Practice_CORRECTED.pdf
│   └── Water_Accounting_in_Practice_CORRECTED.pdf
├── assets/
│   └── images/
│       └── covers/          # Book cover images
└── _data/
    └── videos.yml           # Curated video resources
```

---

## 🔄 Adding New Content

### Add a New Book

1. Upload PDF to `books/` folder
2. Add cover image to `assets/images/covers/`
3. Edit `books.md` to add book description and download link

### Add Videos

Edit `_data/videos.yml`:

```yaml
- title: "Introduction to IFRS S1 and S2"
  url: "https://youtube.com/watch?v=..."
  category: "environmental"
  subcategory: "climate_change"
  duration: "15:30"
  description: "Overview of IFRS Sustainability Standards"
```

### Add Research Papers

Create new markdown files in appropriate category folders and link from framework pages.

---

## 🛠️ Local Development

To test the site locally before deploying:

```bash
# Install Jekyll
gem install bundler jekyll

# Navigate to repository
cd esg-resources-github-repo

# Install dependencies
bundle install

# Run local server
bundle exec jekyll serve

# Open browser to http://localhost:4000
```

---

## 📊 Analytics (Optional)

### Add Google Analytics

1. Create Google Analytics account
2. Get your tracking ID (e.g., `G-XXXXXXXXXX`)
3. Add to `_config.yml`:
   ```yaml
   google_analytics: G-XXXXXXXXXX
   ```

---

## 🔒 Copyright & Licensing

**Books**: © Simon Mak. All rights reserved.  
**Website Content**: © Ascent Partners Foundation  
**Framework Content**: Academic frameworks cited with proper attribution

**Usage Policy**:
- PDFs provided for educational purposes
- Do not redistribute without permission
- Contact mary.chan@ascent-partners.com for licensing

---

## 🐛 Troubleshooting

### Site Not Loading

- Wait 5-10 minutes after enabling GitHub Pages
- Check **Settings** → **Pages** for deployment status
- Verify `_config.yml` has correct `baseurl`

### PDFs Not Downloading

- Ensure PDF files are in `books/` folder
- Check file paths in `books.md` match actual filenames
- PDFs with spaces in names need URL encoding (`%20`)

### Images Not Displaying

- Verify images are in `assets/images/covers/`
- Check file extensions match (`.png`, `.jpg`)
- Use relative paths: `../assets/images/covers/filename.png`

---

## 📞 Support

For questions or issues:

**Technical Support**: GitHub Issues in your repository  
**Content Questions**: mary.chan@ascent-partners.com  
**Author Website**: [simonmak.com](https://simonmak.com)

---

## 🎯 Next Steps

1. **Deploy the site** following Quick Start guide
2. **Customize branding** in `_config.yml`
3. **Add more resources** (videos, papers, case studies)
4. **Promote the site** through ESG networks
5. **Monitor usage** with Google Analytics
6. **Update regularly** with new books and resources

---

**Ready to launch!** Extract the archive, follow Step 1-3, and your ESG Resources Hub will be live in 10 minutes.

Good luck! 🚀

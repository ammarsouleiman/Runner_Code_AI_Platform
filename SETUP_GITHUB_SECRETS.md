# 🔐 GitHub Secrets Setup Guide

This guide explains how to add API Keys as GitHub Secrets to enable automatic deployment to GitHub Pages.

## 📋 Prerequisites:

- GitHub account with repository management permissions
- Valid API Keys:
  - OpenRouter API Key (required)
  - Pexels API Key (optional)

---

## 🚀 Steps to Add API Keys as GitHub Secrets:

### 1. Open GitHub Secrets Page:

**Method 1: Direct Link**
Open the following link in your browser:
```
https://github.com/ammarsouleiman/Runner_Code_AI_Platform/settings/secrets/actions
```

**Method 2: From GitHub Interface**
1. Go to the repository: https://github.com/ammarsouleiman/Runner_Code_AI_Platform
2. Click on **Settings** (at the top of the page)
3. From the sidebar, click on **Secrets and variables**
4. Then click on **Actions**

### 2. Add First Secret (OpenRouter API Key):

1. Click on the **"New repository secret"** button (top right of the page)
2. In the **Name** field, type exactly (without extra spaces):
   ```
   VITE_OPENROUTER_API_KEY
   ```
3. In the **Secret** field, enter your OpenRouter API key:
   ```
   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
   ```
   > 💡 **Note**: Replace this key with your own key from [OpenRouter](https://openrouter.ai/keys)
4. Click **"Add secret"** at the bottom

### 3. Add Second Secret (Pexels API Key - Optional):

1. Click on the **"New repository secret"** button again
2. In the **Name** field, type exactly:
   ```
   VITE_PEXELS_API_KEY
   ```
3. In the **Secret** field, enter your Pexels API key:
   ```
   OMfpYQBueRaHVMMu7QKoqF4uPbO5iuJvTUHpfitMhFNDmHZ2pbSffE7Y
   ```
   > 💡 **Note**: This key is optional - only if you want to use the image search feature
4. Click **"Add secret"**

### 4. Verify Added Secrets:

You should now see two secrets:
- ✅ `VITE_OPENROUTER_API_KEY`
- ✅ `VITE_PEXELS_API_KEY`

### 5. Deployment:

After adding secrets, you can deploy in two ways:

#### Method 1: Automatic Deployment
- Push any changes to the `main` branch and the workflow will run automatically

#### Method 2: Manual Deployment
```bash
npm run deploy
```

Or from GitHub:
- Go to the **Actions** tab
- Select the **"Deploy to GitHub Pages"** workflow
- Click **"Run workflow"**

---

## ✅ After Deployment:

After deployment completes (usually 2-3 minutes), the application will be available at:
```
https://ammarsouleiman.github.io/Runner_Code_AI_Platform/
```

---

## 🔒 Security Notes:

- ✅ `.env.local` is protected in `.gitignore` and will not be pushed to GitHub
- ✅ API Keys exist only in GitHub Secrets (secure and encrypted)
- ✅ Source code does not contain any keys
- ✅ GitHub Secrets are encrypted and cannot be viewed after adding
- ⚠️ **Warning**: `VITE_*` variables are embedded in the JavaScript bundle (visible in the browser)

## 🔄 Updating Secrets:

If you want to update an API Key:
1. Go to the Secrets page
2. Click on the Secret you want to update
3. Click **"Update"** and enter the new value

## ❌ Deleting Secrets:

If you want to delete a Secret:
1. Go to the Secrets page
2. Click on the Secret you want to delete
3. Click **"Delete"** and confirm deletion

---

## 🆘 Troubleshooting:

### Issue: Workflow fails with "401 Unauthorized" error
**Solution**: Make sure:
- Secret name is exactly correct: `VITE_OPENROUTER_API_KEY`
- API Key is correct and not expired
- Secret was added in the correct location (Actions secrets)

### Issue: Application doesn't work after deployment
**Solution**: 
- Check that Secrets exist
- Check logs in the Actions tab
- Make sure the workflow completed successfully

---

## 📚 Useful Links:

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OpenRouter API Keys](https://openrouter.ai/keys)
- [Pexels API](https://www.pexels.com/api/)

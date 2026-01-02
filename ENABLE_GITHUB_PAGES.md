# 🚀 Enable GitHub Pages

If the deployment workflow is failing, you need to enable GitHub Pages first.

## Steps to Enable GitHub Pages:

1. **Go to Repository Settings:**
   - Navigate to: https://github.com/ammarsouleiman/Runner_Code_AI_Platform/settings/pages

2. **Configure Source:**
   - Under "Source", select **"GitHub Actions"** (not "Deploy from a branch")
   - This allows the workflow to deploy automatically

3. **Save Settings:**
   - The settings will be saved automatically

4. **Verify:**
   - Go to the **Actions** tab
   - You should see the workflow running
   - After completion, your site will be available at:
     ```
     https://ammarsouleiman.github.io/Runner_Code_AI_Platform/
     ```

## Common Issues:

### Issue: "Deploy" job fails immediately
**Solution**: Make sure GitHub Pages is enabled and set to "GitHub Actions" source

### Issue: "Environment not found"
**Solution**: 
1. Go to Settings → Pages
2. Make sure "Source" is set to "GitHub Actions"
3. The environment will be created automatically on first deployment

### Issue: Workflow succeeds but site doesn't load
**Solution**:
- Wait 2-3 minutes for DNS propagation
- Clear browser cache
- Check the Actions tab for deployment URL

---

## After Enabling:

Once GitHub Pages is enabled, every push to `main` will automatically:
1. Build the project
2. Deploy to GitHub Pages
3. Make it available at the URL above


# GitHub Actions Status

## 🚨 Temporarily Disabled

All GitHub Actions workflows are currently **temporarily disabled** due to GitHub billing issues.

### What's Happening:
- **GitHub billing problem**: Recent account payments have failed or spending limit needs to be increased
- **All workflows stopped**: Jobs are not starting due to billing/spending limit locks
- **Error message**: "The job was not started because recent account payments have failed or your spending limit needs to be increased"

### How to Fix:

1. **Go to GitHub Billing:**
   - GitHub.com → Settings → Billing & plans
   - Or directly: `https://github.com/settings/billing`

2. **Check Payment History:**
   - Look for failed payments (even small amounts)
   - Fix any payment method issues

3. **Increase Actions Spending Limit:**
   - Under Actions → Spending limit
   - Set budget above 0 (e.g., $10 or $20)
   - Save/Confirm changes

4. **Re-run Jobs:**
   - Go to Actions → latest run
   - Click "Re-run all jobs"

### Current Status:
- ✅ **Quality Assurance**: Temporarily disabled
- ✅ **CI/CD Pipeline**: Temporarily disabled  
- ✅ **GitHub Pages Deploy**: Temporarily disabled

### To Re-enable After Fixing Billing:
1. Remove `if: false` from all job definitions
2. Commit and push changes
3. Re-run all workflows

### Alternative Deployment (Manual):
```bash
cd frontend
npm ci
npm run build
# Push dist/ to gh-pages branch manually
```

### Local Testing:
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

---
*Last updated: $(date)*
*Status: All workflows temporarily disabled due to billing issues*

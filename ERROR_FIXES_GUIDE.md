# 🔧 Error Fixes Guide
## Resolving Current Platform Issues

---

## 🚨 **Current Errors Identified**

### **1. OpenAI Vision Model Deprecation**
**Error**: `The model 'gpt-4-vision-preview' has been deprecated`

**Status**: ✅ **FIXED**
- Updated `src/app/api/generate-post-text/route.ts` to use `gpt-4o-mini` instead of `gpt-4-vision-preview`

### **2. Database Constraint Violation**
**Error**: `content_generation_content_type_check` constraint violation

**Status**: ✅ **FIXED**
- Updated database schema to allow `'image'` and `'text'` content types
- Created migration script: `database/fix-content-generation-constraint.sql`

### **3. Network Connectivity Issue**
**Error**: `getaddrinfo ENOTFOUND qvqlknsnhqpdxeswonnf.supabase.co`

**Status**: ⚠️ **NEEDS ATTENTION**
- This indicates an incorrect or missing Supabase URL configuration

---

## 🛠 **Required Actions**

### **Step 1: Update Database Schema**

Run the database migration to fix the constraint:

```bash
# Option 1: Using Supabase CLI
npx supabase db push

# Option 2: Run the migration script directly
node scripts/run-migration.js database/fix-content-generation-constraint.sql
```

### **Step 2: Fix Environment Variables**

Check your `.env.local` file and ensure these variables are correctly set:

```bash
# Required Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# Required OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-key
```

### **Step 3: Verify Supabase Connection**

Test your Supabase connection:

```bash
# Check if Supabase is accessible
curl -I https://your-actual-project.supabase.co

# Or test through the application
npm run dev
# Then visit http://localhost:3000 and check browser console
```

---

## 🔍 **Error Details & Solutions**

### **Error 1: OpenAI Vision Model**
```typescript
// BEFORE (Deprecated)
model: 'gpt-4-vision-preview'

// AFTER (Fixed)
model: 'gpt-4o-mini'
```

**Impact**: Vision analysis for image-based content generation
**Status**: ✅ Fixed in `src/app/api/generate-post-text/route.ts`

### **Error 2: Database Constraint**
```sql
-- BEFORE (Restrictive)
CHECK (content_type IN ('social_post', 'whatsapp', 'email', 'ad_copy', 'blog', 'sms'))

-- AFTER (Inclusive)
CHECK (content_type IN ('social_post', 'whatsapp', 'email', 'ad_copy', 'blog', 'sms', 'image', 'text'))
```

**Impact**: Content generation API calls failing to save to database
**Status**: ✅ Fixed in database schema

### **Error 3: Network Connectivity**
```
Error: getaddrinfo ENOTFOUND qvqlknsnhqpdxeswonnf.supabase.co
```

**Root Cause**: Invalid or missing Supabase URL in environment variables
**Solution**: Update `.env.local` with correct Supabase project URL

---

## 📋 **Verification Checklist**

### **After Applying Fixes**

- [ ] **Database Migration**: Run `npx supabase db push`
- [ ] **Environment Variables**: Verify all required keys are set
- [ ] **OpenAI API**: Test with a simple content generation request
- [ ] **Supabase Connection**: Confirm database operations work
- [ ] **Content Generation**: Test both text and image generation
- [ ] **Error Logs**: Check terminal for any remaining errors

### **Test Commands**

```bash
# Test database connection
npm run dev
# Visit: http://localhost:3000/brand-content

# Test OpenAI integration
# Visit: http://localhost:3000/brand-content
# Try generating content with images

# Test image generation
# Visit: http://localhost:3000/brand-content
# Try generating an image
```

---

## 🚀 **Expected Results After Fixes**

### **Content Generation Should Work**
- ✅ Text generation with brand context
- ✅ Image generation with enhanced prompts
- ✅ Database saving without constraint errors
- ✅ Vision analysis for reference images

### **No More Console Errors**
- ✅ No OpenAI model deprecation warnings
- ✅ No database constraint violations
- ✅ No network connectivity issues
- ✅ Clean terminal output

---

## 🔧 **Troubleshooting**

### **If Database Migration Fails**
```bash
# Check Supabase connection
npx supabase status

# Reset local database
npx supabase db reset

# Apply migrations
npx supabase db push
```

### **If Environment Variables Are Missing**
```bash
# Copy example file
cp env.example .env.local

# Edit with your actual values
nano .env.local
```

### **If OpenAI API Still Fails**
```bash
# Check API key format
echo $OPENAI_API_KEY | head -c 10

# Test API key directly
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

---

## 📞 **Support**

If you continue to experience issues after applying these fixes:

1. **Check the logs**: Look for specific error messages
2. **Verify credentials**: Ensure all API keys are valid
3. **Test connectivity**: Confirm network access to external services
4. **Review documentation**: Check the deployment guide for setup details

---

*Last Updated: January 2025*


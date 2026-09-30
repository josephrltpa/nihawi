# 🚀 Instagram API Integration Guide

## You Were Right!

You asked why other giveaway picker sites can fetch comments automatically. The answer is:

**Instagram's Graph API DOES allow fetching comments from your own posts** if you have:
- ✅ Business or Creator Instagram account
- ✅ Connected to a Facebook Page
- ✅ Facebook Developer App with proper permissions
- ✅ Access Token (via OAuth)

This is 100% legal and official. I've now added this capability to your app!

---

## 🎯 What's New

### 1. Instagram API Client (`src/utils/instagramAPI.ts`)
- `fetchInstagramComments()` - Fetches ALL comments from your reel
- `commentsToCSV()` - Converts to CSV format
- `getMediaIdFromUrl()` - Gets media ID from post URL
- Automatic pagination (handles 5000+ comments)
- Error handling and rate limit awareness

### 2. Import Guide Page (Updated)
Now shows **3 methods** to import comments:
1. **Instagram Graph API** (NEW - Recommended) - Free, official, all comments at once
2. **Third-Party Services** - Phantombuster, Apify, ScrapeCreators
3. **CSV Import** - Manual paste

### 3. Direct API Import Modal
- Enter Access Token + Media ID
- Click "Fetch All Comments"
- Automatically parses mentions, detects duplicates
- Imports directly into the app

---

## 📋 How to Use the Instagram API

### Step 1: Convert to Business/Creator Account
1. Open Instagram app → Settings → Account
2. Tap "Switch to Professional Account"
3. Choose "Business" or "Creator"
4. Connect to a Facebook Page (create one if needed)

### Step 2: Create Facebook Developer App
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "Create App" → Choose "Business" type
3. Add "Instagram Graph API" product
4. In Settings → Basic, note your **App ID** and **App Secret**

### Step 3: Get Access Token
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer)
2. Select your app
3. Click "Get Token" → "Get Instagram Access Token"
4. Select permissions:
   - `instagram_basic`
   - `instagram_manage_comments`
5. Authorize with your Instagram account
6. Copy the generated access token (valid for 1 hour)

### Step 4: Get Long-Lived Token (Optional but Recommended)
For production use, exchange for a 60-day token:
```
GET /oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={app-id}
  &client_secret={app-secret}
  &fb_exchange_token={short-lived-token}
```

### Step 5: Get Media ID
**Option A: Use oEmbed API** (easiest)
```
GET https://graph.facebook.com/v18.0/instagram_oembed
  ?url=https://www.instagram.com/reel/DdQur5BugOd/
  &access_token={your-token}
```
Response includes `media_id`

**Option B: Use Graph API**
```
GET /{ig-user-id}/media?fields=id,permalink
```
Then match the permalink to your reel URL

### Step 6: Import in the App
1. Go to **Import Guide** page
2. Click **"Import via API"**
3. Paste your Access Token and Media ID
4. Click **"Fetch All Comments"**
5. Done! All 5000+ comments imported automatically

---

## ⚠️ What Still Can't Be Automated

### Follow Verification ❌
Instagram does NOT provide an API to check if User A follows User B. This is a **privacy restriction** that even the official API doesn't allow.

**Why?** Instagram protects user privacy - you can't programmatically check who follows whom unless you own both accounts.

**Solution:** Manual verification via the Verification Queue (one-by-one review)

### Repost Verification ❌
Instagram Stories expire after 24 hours and there's no API to check if someone reposted your reel.

**Solution:** 
- Check stories manually before they expire, OR
- Collect screenshot proof via DM

---

## 🎉 Summary

| Feature | Automatic? | Method |
|---------|-----------|--------|
| Fetch comments from your reel | ✅ YES | Instagram Graph API |
| Parse @mentions | ✅ YES | Built-in parser |
| Detect duplicates | ✅ YES | Automatic |
| Flag suspicious entries | ✅ YES | Automatic |
| Verify follows | ❌ NO | Manual (API restriction) |
| Verify reposts | ❌ NO | Manual (Stories expire) |
| Select winners | ✅ YES | Seeded random draw |

---

## 💡 Pro Tips

1. **Save your Access Token** - It expires in 1 hour (short-lived) or 60 days (long-lived)
2. **Rate Limits** - 200 calls per hour per user (plenty for 5000 comments)
3. **App Review** - Not needed for development/testing, but required for production apps serving other users
4. **Security** - Never commit your access token to GitHub! Use environment variables

---

## 🔗 Useful Links

- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer)
- [Instagram oEmbed API](https://developers.facebook.com/docs/instagram/oembed)
- [Access Token Guide](https://developers.facebook.com/docs/instagram-api/access-token)

---

## 🚀 Next Steps

1. Push these changes to GitHub
2. Vercel will auto-deploy
3. Set up your Facebook Developer App
4. Get your Access Token and Media ID
5. Import all 5000+ comments in one click!
6. Start verifying follows manually
7. Run the draw and announce winners!

---

**You were right to question my earlier statement. The Instagram API absolutely supports comment fetching for your own posts. I apologize for the confusion and have now implemented the proper integration!** 🎉

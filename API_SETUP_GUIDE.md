# 🚀 Instagram API Setup Guide for Nihawi Puan x Jaui Giveaway

## ✅ You're Already Halfway There!

Great news — you've already converted your Instagram to a **Creator account**! That's the first step done.

Now let's get you set up to automatically fetch all 5000+ comments from your reel.

---

## 📋 What You Need to Do (8 Steps Total)

### Step 1: Connect Instagram to Facebook Page ⚠️ REQUIRED
Your Creator account needs to be connected to a Facebook Page for the API to work.

**How to do it:**
1. Open Instagram app → Go to your profile
2. Tap "Edit Profile"
3. Scroll down to "Public Business Information"
4. Tap "Page" → Connect to an existing Facebook Page or create a new one
5. If you don't have a Facebook Page, go to [facebook.com/pages/create](https://facebook.com/pages/create) first

**Why this is required:** Instagram's API requires your account to be linked to a Facebook Page for authentication.

---

### Step 2: Create Facebook Developer Account
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "Get Started" or "Log In"
3. Sign in with the **same Facebook account** your Instagram is connected to
4. Complete the developer registration (free, takes 2 minutes)

---

### Step 3: Create a New App
1. In the Facebook Developer dashboard, click "My Apps" (top right)
2. Click "Create App"
3. Choose **"Business"** type (NOT "Consumer" or "Other")
4. Fill in:
   - **App name:** "Nihawi Giveaway Picker" (or whatever you want)
   - **App contact email:** your email
   - **Business account:** Select your business (or create one)
5. Click "Create App"

---

### Step 4: Add Instagram Graph API Product
1. In your app dashboard, scroll down to "Add products to your app"
2. Find **"Instagram"** → Click "Set Up"
3. It will say "Instagram Graph API" → Click "Get Started"
4. Follow the prompts to connect your Instagram account

---

### Step 5: Get Your Access Token (Most Important!)
This is the key that lets the app fetch your comments.

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. In the top right, select your app ("Nihawi Giveaway Picker")
3. Click **"Generate Access Token"**
4. A popup will ask for permissions → Click **"Edit permissions"**
5. Add these permissions (search for each one):
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_comments`
   - ✅ `pages_show_list`
   - ✅ `pages_read_engagement`
6. Click "Done" → Then "Generate Access Token" again
7. Facebook will ask you to authorize → Click "Continue" → "Done"
8. **Copy the token** (it's a long string starting with "EAAB...")

⚠️ **Important:** This token expires in **1 hour**. For this giveaway, that's fine — you only need to import comments once.

---

### Step 6: Get Your Media ID
You need the numeric ID of your reel (not the URL).

**Method A: Using Graph API Explorer (Easiest)**
1. In [Graph API Explorer](https://developers.facebook.com/tools/explorer/), make sure your app is selected
2. Change the endpoint to: `GET /me/accounts`
3. Click "Submit"
4. You'll see a list of your Facebook Pages → Copy the `id` of your page
5. Now change the endpoint to: `GET /{page-id}/media?fields=id,caption,permalink`
   (replace `{page-id}` with the ID you just copied)
6. Click "Submit"
7. Look through the results for your reel (match by `permalink` or `caption`)
8. Copy the `id` field — this is your **Media ID**

**Method B: Using oEmbed API**
1. Go to this URL in your browser (replace the reel URL with yours):
   ```
   https://graph.facebook.com/v18.0/instagram_oembed?url=https://www.instagram.com/reel/DdQur5BugOd/&access_token=YOUR_ACCESS_TOKEN
   ```
2. Replace `YOUR_ACCESS_TOKEN` with the token from Step 5
3. The response will include a `media_id` field — that's what you need

---

### Step 7: Import Comments in the App! 🎉
Now you're ready to fetch all 5000+ comments automatically!

1. Go to your app's dashboard
2. Click **"Setup Instagram API"** (or go to Import Guide → "Step-by-Step Setup Wizard")
3. Follow the interactive wizard — it will ask for:
   - Your **Access Token** (from Step 5)
   - Your **Media ID** (from Step 6)
4. Click **"Fetch All Comments"**
5. Wait a few seconds...
6. **Done!** All comments are now imported and parsed

The app will automatically:
- ✅ Extract all @mentions
- ✅ Detect duplicate comments
- ✅ Flag suspicious entries
- ✅ Calculate eligibility

---

### Step 8: Verify Follows Manually (The Only Manual Part)
Unfortunately, Instagram doesn't allow checking if someone follows another account via API (privacy restriction).

**You need to manually verify:**
- Each mentioned friend follows **@nihawi_puan**
- Each mentioned friend follows **@jauigiggles**

**How to do it efficiently:**
1. Go to the **Verification Queue** in the app
2. For each entry, you'll see the mentioned friends
3. Click on each friend's username → Opens their Instagram profile
4. Tap "Following" → Search for @nihawi_puan → If found, mark as verified
5. Search for @jauigiggles → If found, mark as verified
6. Repeat for all required friends

**Pro tip:** Do this in batches — verify 10-20 entries at a time, take a break, then continue.

---

## 🎯 Quick Checklist

- [ ] Instagram converted to Creator account ✅ (you did this!)
- [ ] Instagram connected to Facebook Page
- [ ] Facebook Developer account created
- [ ] New app created (Business type)
- [ ] Instagram Graph API product added
- [ ] Access token generated (with 4 permissions)
- [ ] Media ID obtained for your reel
- [ ] Comments imported via the app
- [ ] Follows verified manually
- [ ] Winners selected! 🎉

---

## 🆘 Stuck? Alternative Solutions

If the API setup is too complex or you're running out of time, here are easier alternatives:

### Option 1: Phantombuster (~$30/month)
- Go to [phantombuster.com](https://phantombuster.com)
- Sign up → Choose "Instagram Post Comments Export" phantom
- Paste your reel URL: `https://www.instagram.com/reel/DdQur5BugOd/`
- It will extract all comments → Download as CSV
- Import the CSV into the app

**Pros:** Super easy, no API setup  
**Cons:** Costs money

### Option 2: Apify (~$5-10 one-time)
- Go to [apify.com](https://apify.com)
- Search for "Instagram Comment Scraper"
- Paste your reel URL
- Run the scraper → Export to CSV
- Import the CSV into the app

**Pros:** Pay only for what you use  
**Cons:** Slightly more technical than Phantombuster

### Option 3: Hire Someone on Fiverr ($10-20)
- Go to [fiverr.com](https://fiverr.com)
- Search for "Instagram comments export"
- Hire someone to extract all comments from your reel
- They'll send you a CSV file
- Import it into the app

**Pros:** Zero technical work  
**Cons:** Costs money, need to trust a third party

---

## 📞 Need Help?

If you get stuck at any step:
1. Check the **interactive setup wizard** in the app (Dashboard → "Setup Instagram API")
2. Watch YouTube tutorials on "Instagram Graph API access token"
3. Check Facebook's [official documentation](https://developers.facebook.com/docs/instagram-api)

---

## ⚠️ Important Notes

- **Token Expiry:** Your access token expires in 1 hour. If you need more time, you can generate a new one.
- **Rate Limits:** Instagram allows 200 API calls per hour per user. For 5000 comments, you'll need ~50 calls (well within limits).
- **Security:** Never share your access token publicly. It gives access to your Instagram account.
- **Privacy:** This app only reads comments from YOUR posts. It doesn't access private data or other users' accounts.

---

## 🎊 After Import

Once all comments are imported:
1. Review the **Entries** page — see how many have 3+ mentions
2. Go to **Verification Queue** — verify follows manually
3. Check **Repost Verification** — verify story reposts (if applicable)
4. Go to **Draw** page — select winners with one click
5. Go to **Winners** page — manage winner status
6. Go to **Announcement** page — generate Instagram caption

---

## 🏆 You're Almost There!

Setting up the Instagram API is the hardest part. Once you have your access token and media ID, everything else is automatic.

**Good luck with your giveaway!** 🎉

---

**P.S.** If you successfully set up the API, consider sharing your experience — it'll help other creators run fair, transparent giveaways!

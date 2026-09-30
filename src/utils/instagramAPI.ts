// ============================================================
// INSTAGRAM API CLIENT - Fetch comments from your own posts
// ============================================================

/**
 * Instagram Graph API Integration
 * 
 * Requirements:
 * 1. Instagram Business or Creator account
 * 2. Connected to a Facebook Page
 * 3. Facebook Developer App with instagram_manage_comments permission
 * 4. User OAuth authorization
 * 
 * This is the OFFICIAL, LEGAL way to fetch comments from your own posts.
 */

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  media_id?: string;
}

export interface InstagramAPIConfig {
  accessToken: string;
  mediaId: string;
}

/**
 * Fetch all comments from an Instagram post/reel using the official Graph API
 * 
 * @param config - Access token and media ID
 * @returns Array of comments
 * 
 * API Endpoint: GET /{media-id}/comments
 * Docs: https://developers.facebook.com/docs/instagram-api/reference/ig-media/comments
 */
export async function fetchInstagramComments(
  config: InstagramAPIConfig
): Promise<InstagramComment[]> {
  const { accessToken, mediaId } = config;
  const allComments: InstagramComment[] = [];
  let nextUrl: string | null = `https://graph.facebook.com/v18.0/${mediaId}/comments?fields=id,text,username,timestamp&limit=100&access_token=${accessToken}`;
  
  try {
    // Paginate through all comments
    while (nextUrl) {
      const response = await fetch(nextUrl);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Instagram API Error: ${error.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      // Add comments from this page
      if (data.data) {
        allComments.push(...data.data.map((comment: any) => ({
          id: comment.id,
          text: comment.text,
          username: comment.username,
          timestamp: comment.timestamp,
          media_id: mediaId,
        })));
      }
      
      // Check for next page
      nextUrl = data.paging?.next || null;
    }
    
    return allComments;
  } catch (error) {
    console.error('Failed to fetch Instagram comments:', error);
    throw error;
  }
}

/**
 * Convert Instagram API comments to CSV format for import
 */
export function commentsToCSV(comments: InstagramComment[]): string {
  const header = 'username,comment_text,timestamp,comment_id';
  const rows = comments.map(c => {
    // Escape quotes and wrap in quotes if contains comma/quote/newline
    const escapeCSV = (str: string) => {
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    return `${escapeCSV(c.username)},${escapeCSV(c.text)},${escapeCSV(c.timestamp)},${escapeCSV(c.id)}`;
  });
  
  return [header, ...rows].join('\n');
}

/**
 * Get Instagram media ID from post URL
 * 
 * Note: This requires the media ID to be known or extracted via other means.
 * The Graph API doesn't provide a direct URL-to-ID converter.
 * 
 * Alternative: Use the Instagram oEmbed API (no auth required):
 * GET https://graph.facebook.com/v18.0/instagram_oembed?url={post-url}&access_token={token}
 */
export async function getMediaIdFromUrl(
  postUrl: string,
  accessToken: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(postUrl)}&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get media ID from URL');
    }
    
    const data = await response.json();
    // The oEmbed response includes media_id in the response
    return data.media_id;
  } catch (error) {
    console.error('Failed to get media ID:', error);
    throw error;
  }
}

/**
 * Setup guide for Instagram API access
 */
export const INSTAGRAM_API_SETUP_GUIDE = `
## How to Get Instagram API Access

### Step 1: Convert to Business/Creator Account
1. Open Instagram app → Settings → Account
2. Tap "Switch to Professional Account"
3. Choose "Business" or "Creator"
4. Connect to a Facebook Page (create one if needed)

### Step 2: Create Facebook Developer App
1. Go to developers.facebook.com
2. Click "Create App" → Choose "Business" type
3. Add "Instagram Graph API" product
4. In Settings → Basic, note your App ID and App Secret

### Step 3: Get Access Token
1. Go to Graph API Explorer: developers.facebook.com/tools/explorer
2. Select your app
3. Click "Get Token" → "Get Instagram Access Token"
4. Select permissions: instagram_basic, instagram_manage_comments
5. Authorize with your Instagram account
6. Copy the generated access token (valid for 1 hour)

### Step 4: Get Long-Lived Token (Optional)
For production use, exchange for a 60-day token:
GET /oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}

### Step 5: Get Media ID
Option A: Use Instagram oEmbed API (see getMediaIdFromUrl function)
Option B: Use Instagram Graph API:
GET /{ig-user-id}/media?fields=id,permalink
Then match the permalink to your post URL

### Step 6: Fetch Comments
Use the fetchInstagramComments function with your access token and media ID.

## Important Notes
- Access tokens expire (1 hour for short-lived, 60 days for long-lived)
- Rate limit: 200 calls per hour per user
- Only works on posts YOU own (Business/Creator account)
- Requires app review for production use (not needed for development)
`;

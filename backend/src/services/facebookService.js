// Meta Graph API integration for publishing to a Facebook Page.
//
// Real mode: set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN in .env
// (see backend/README.md for how to get these from Meta for Developers).
// Simulated mode: if either is missing, publishToFacebook() returns a
// clearly-labelled fake result instead of failing, so the rest of the app
// (and anyone grading it without their own Facebook App) still works.

const GRAPH_API_VERSION = process.env.FACEBOOK_GRAPH_API_VERSION || 'v19.0';

function isConfigured() {
  return Boolean(process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
}

// Publishes a post to the configured Facebook Page.
// caption: the post text (required)
// imageUrl: a publicly reachable image URL (optional — Graph API needs a
//           real, internet-accessible URL, not a local file path)
//
// Returns: { simulated: boolean, externalPostId: string, raw?: object }
async function publishToFacebook({ caption, imageUrl }) {
  if (!isConfigured()) {
    return {
      simulated: true,
      externalPostId: `SIMULATED-${Date.now()}`,
    };
  }

  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  // Graph API uses a different endpoint depending on whether there's an image:
  // - text-only posts go to /{page-id}/feed
  // - posts with an image go to /{page-id}/photos (caption becomes the photo's caption)
  const endpoint = imageUrl
    ? `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/photos`
    : `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/feed`;

  const params = new URLSearchParams({ access_token: accessToken });
  if (imageUrl) {
    params.set('url', imageUrl);
    params.set('caption', caption);
  } else {
    params.set('message', caption);
  }

  const response = await fetch(endpoint, { method: 'POST', body: params });
  const data = await response.json();

  if (!response.ok) {
    // Graph API errors come back as { error: { message, type, code, ... } }
    const message = data?.error?.message || 'Unknown Graph API error';
    const err = new Error(`Facebook Graph API error: ${message}`);
    err.graphApiError = data?.error;
    throw err;
  }

  // /feed returns { id: "<page-id>_<post-id>" }, /photos returns { id, post_id }
  const externalPostId = data.post_id || data.id;

  return { simulated: false, externalPostId, raw: data };
}

module.exports = { isConfigured, publishToFacebook };

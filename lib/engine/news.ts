import axios from 'axios';

export async function getTrendingNews() {
  try {
    const response = await axios.get('https://newsdata.io/api/1/latest', {
      params: {
        apikey: process.env.NEWSDATA_API_KEY,
        language: 'en',
        // '1' filters for news from the last 60 minutes
        // You can even use 'timeframe=30m' for 30 minutes!
        // timeframe: '1',
        removeduplicate: 1,
        image: 1, // Ensure we only get news that has a visual
        prioritydomain: 'top', // Focus on high-authority sources
        country: "in",
      }
    });

    const results = response.data.results;

    if (!results || results.length === 0) return [];

    // Slice the array to get exactly the first 10, then map to your format
    return results.slice(0, 25).map((article: any) => ({
      title: article.title,
      source: article.source_name || article.source_id,
      publishedAt: article.pubDate,
      url: article.link,
      imageUrl: article.image_url,
    }));
  } catch (error) {
    console.error("NewsData.io Fetch Error:", error);
    return null;
  }
}
export default function PrivacyPolicy() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy for The Daily Draft</h1>
      <p className="mb-4">Last Updated: April 27, 2026</p>
      <p>The Daily Draft uses the Instagram Graph API to allow users to post news drafts to their own Instagram accounts. We do not store your private Instagram credentials; we use secure OAuth tokens.</p>
      <h2 className="text-xl font-semibold mt-4">Data Usage</h2>
      <p>We only access the basic profile and content publishing permissions required to post your drafts. Your images are stored temporarily on Vercel Blob storage.</p>
    </div>
  )
}
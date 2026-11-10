// Supabase connection for the browser (the shared Family project, same as Felix Maze and Adventure).
// The publishable key is meant to be public; ltd_reviews only opens to the signed-in family account (RLS).
window.APP_CONFIG = {
  app: "learning-to-draw",
  prefix: "ltd",
  table: "ltd_reviews",
  url: "https://twvqvutrcobedvuhnzxq.supabase.co",
  key: "sb_publishable_eqUo8HEdEB1hMQM4CpSVqA_9i6b0qCo",
  timeoutMs: 8000,
  links: [["index.html", "🏠 Home"], ["pack.html", "🖨️ Print in bulk"], ["review.html", "🔍 Review"], ["research/index.html", "🔭 Research"], ["../index.html", "🌀 Felix Maze"]]
};

// Which bikes the Home page shows: newest first, the four newest with a photo
// fill the hero, the next four become "Featured bikes", so Home never shows
// the same unit twice. Shared by Home and the splash screen (which preloads
// exactly these images so the page is ready when the splash lifts).
export const pickHomeBikes = (bikes) => {
  const newest = [...bikes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const heroBikes = newest.filter((b) => b.images?.length > 0).slice(0, 4);
  const heroIds = new Set(heroBikes.map((b) => b._id));
  return {
    heroBikes,
    featuredBikes: newest.filter((b) => !heroIds.has(b._id)).slice(0, 4),
  };
};

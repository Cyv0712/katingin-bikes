const normalizeCombined = (liveModel, liveEngine) => {
  const liveModelLower = (liveModel || '').toLowerCase();
  const liveEngineLower = (liveEngine || '').toLowerCase().replace('cc', '').trim();
  return `${liveModelLower} ${liveEngineLower}`.replace(/[^\w\s]/g, '').trim();
};

const normalizeCompact = (combinedLive) => combinedLive.replace(/\s+/g, '');

const matchesCb650r = (combinedLive) => {
  const compact = normalizeCompact(combinedLive);
  if (compact.includes('cbr')) return false;
  return compact.includes('cb650r');
};

export const matchShowcaseToInventory = (showcaseBike, liveBike) => {
  if (liveBike.status && liveBike.status !== 'Available') return false;

  const targetBrand = showcaseBike.brand.toLowerCase().trim();
  const liveBrand = (liveBike.brand || '').toLowerCase().trim();
  if (liveBrand !== targetBrand) return false;

  const liveModel = liveBike.model || '';
  const liveEngine = liveBike.engineSize || '';
  const combinedLive = normalizeCombined(liveModel, liveEngine);

  switch (showcaseBike.slug) {
    case 'honda-africa-twin':
      return combinedLive.includes('africa') && combinedLive.includes('twin');
    case 'yamaha-tracer-900':
      return combinedLive.includes('tracer') && (combinedLive.includes('900') || combinedLive.includes('gt'));
    case 'kawasaki-versys-650':
      return combinedLive.includes('versys') && (combinedLive.includes('650') || combinedLive.includes('600'));
    case 'honda-cb650r':
      return matchesCb650r(combinedLive);
    case 'ducati-monster-937':
      return combinedLive.includes('monster') && (combinedLive.includes('937') || combinedLive.includes('900') || combinedLive.includes('821') || combinedLive.includes('797'));
    case 'bmw-gs-rallye':
      return combinedLive.includes('gs') && (combinedLive.includes('rallye') || combinedLive.includes('1250') || combinedLive.includes('1200'));
    default: {
      const targetWords = showcaseBike.model.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((word) => word && word !== 'cc');
      return targetWords.every((word) => combinedLive.includes(word));
    }
  }
};

export const findShowcaseInventoryMatch = (showcaseBike, inventory) =>
  inventory.find((liveBike) => matchShowcaseToInventory(showcaseBike, liveBike)) || null;

export const isShowcaseInStock = (showcaseBike, inventory) =>
  inventory.some((liveBike) => matchShowcaseToInventory(showcaseBike, liveBike));

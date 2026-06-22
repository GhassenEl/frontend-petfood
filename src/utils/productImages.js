/** Images produits — délègue au catalogue local platformImages */
export {
  resolveNaturalProductImage,
  buildProductFallbackDataUri,
  resolveCategoryProductImage,
  sanitizeProductImageUrl,
  PLATFORM_IMAGES,
} from './platformImages';

import { resolveNaturalProductImage } from './platformImages';
export default resolveNaturalProductImage;

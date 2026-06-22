import React, { useEffect, useMemo, useState } from 'react';
import {
  buildProductFallbackDataUri,
  PLATFORM_IMAGES,
  resolveCategoryProductImage,
  resolveImageSrc,
  sanitizeProductImageUrl,
} from '../utils/platformImages';

const uniqueUrls = (urls) => {
  const seen = new Set();
  return urls.filter((url) => {
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
};

const buildImageChain = ({ src, fallback, product }) => {
  if (product) {
    const primary = sanitizeProductImageUrl(src, product)
      || sanitizeProductImageUrl(product.imageUrl, product)
      || sanitizeProductImageUrl(product.image, product)
      || sanitizeProductImageUrl(product.icon, product);

    return uniqueUrls([
      primary,
      fallback ? sanitizeProductImageUrl(fallback, product) : '',
      resolveCategoryProductImage(product),
      buildProductFallbackDataUri(product),
      PLATFORM_IMAGES.productDefault,
    ]);
  }

  return uniqueUrls([
    resolveImageSrc(src, ''),
    fallback,
    PLATFORM_IMAGES.productDefault,
  ]);
};

/**
 * Image avec repli automatique si URL absente, 404 ou réseau indisponible.
 */
const SafeImage = ({
  src,
  fallback = PLATFORM_IMAGES.productDefault,
  product,
  alt = '',
  className,
  style,
  ...rest
}) => {
  const chain = useMemo(
    () => buildImageChain({ src, fallback, product }),
    [src, fallback, product?.id, product?.name, product?.imageUrl, product?.image, product?.icon],
  );

  const initial = chain[0] || PLATFORM_IMAGES.productDefault;
  const [current, setCurrent] = useState(initial);
  const [failIdx, setFailIdx] = useState(-1);

  useEffect(() => {
    setCurrent(chain[0] || PLATFORM_IMAGES.productDefault);
    setFailIdx(-1);
  }, [chain]);

  const handleError = () => {
    const nextIdx = failIdx + 1;
    if (nextIdx < chain.length) {
      setFailIdx(nextIdx);
      setCurrent(chain[nextIdx]);
      return;
    }
    setCurrent(buildProductFallbackDataUri(product || {}));
  };

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      loading={rest.loading || 'lazy'}
      decoding="async"
    />
  );
};

export default SafeImage;

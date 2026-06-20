import React, { useEffect, useState } from 'react';
import {
  buildProductFallbackDataUri,
  PLATFORM_IMAGES,
  resolveImageSrc,
} from '../utils/platformImages';

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
  const chain = product
    ? [resolveImageSrc(src, ''), fallback, buildProductFallbackDataUri(product)]
    : [resolveImageSrc(src, ''), fallback, PLATFORM_IMAGES.productDefault];

  const initial = chain.find(Boolean) || PLATFORM_IMAGES.productDefault;
  const [current, setCurrent] = useState(initial);
  const [failIdx, setFailIdx] = useState(-1);

  useEffect(() => {
    setCurrent(chain.find(Boolean) || PLATFORM_IMAGES.productDefault);
    setFailIdx(-1);
  }, [src, fallback, product?.id, product?.name]);

  const handleError = () => {
    const nextIdx = failIdx + 1;
    const candidates = chain.filter(Boolean);
    if (nextIdx < candidates.length) {
      setFailIdx(nextIdx);
      setCurrent(candidates[nextIdx]);
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

import React, { useState, useCallback } from 'react';

const PAWS_SRC = '/images/login-paws.png';

/** Logo empreintes CAT / DOG — image fournie + animations dynamiques. */
const LoginPetsLogo = () => {
  const [active, setActive] = useState(null);

  const sideClass = (side) =>
    ['login-paws-side', `login-paws-${side}`, active === side ? 'login-paws-active' : '']
      .filter(Boolean)
      .join(' ');

  return (
    <div className="login-paws-dynamic" role="group" aria-label="Empreintes chat et chien">
      <div className="login-paws-glow" aria-hidden />

      <div className="login-paws-row">
        <button
          type="button"
          className={sideClass('cat')}
          onMouseEnter={() => setActive('cat')}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setActive('cat')}
          onBlur={() => setActive(null)}
          aria-label="Chat"
        >
          <span className="login-paws-clip login-paws-clip-cat">
            <img src={PAWS_SRC} alt="" className="login-paws-sprite" draggable={false} />
          </span>
        </button>

        <button
          type="button"
          className={sideClass('dog')}
          onMouseEnter={() => setActive('dog')}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setActive('dog')}
          onBlur={() => setActive(null)}
          aria-label="Chien"
        >
          <span className="login-paws-clip login-paws-clip-dog">
            <img src={PAWS_SRC} alt="" className="login-paws-sprite" draggable={false} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default LoginPetsLogo;

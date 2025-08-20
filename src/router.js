import * as React from 'react';

export function useHashRoute(defaultPath = '#/time') {
  const [path, setPath] = React.useState(window.location.hash || defaultPath);

  React.useEffect(() => {
    const onHash = () => setPath(window.location.hash || defaultPath);
    window.addEventListener('hashchange', onHash);
    if (!window.location.hash) window.location.hash = defaultPath;
    return () => window.removeEventListener('hashchange', onHash);
  }, [defaultPath]);

  return path;
}

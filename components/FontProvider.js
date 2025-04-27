// Este archivo es simplemente un placeholder para mantener las importaciones
// existentes en la aplicación. No se usa activamente.
import React, { createContext, useContext } from 'react';

// Create a context for fonts
const FontContext = createContext(false);

// Provider component that wraps the app
export const FontProvider = ({ fontsLoaded, children }) => {
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
};

// Custom hook to use the font context
export const useFonts = () => false;

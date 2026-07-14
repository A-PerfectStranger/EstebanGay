import { RouterProvider } from 'react-router';
import { MotionConfig } from 'motion/react';
import { router } from './routes';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    // reducedMotion="user" hace que TODAS las animaciones de motion/react respeten
    // la preferencia del sistema operativo (prefers-reduced-motion), sin tener que
    // tocar cada componente individualmente.
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </MotionConfig>
  );
}

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { fetchUser } from './store/slices/authSlice';
import HomePage from './pages/home';
import GamePage from './pages/game';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: "/game/:roomCode",
    element: <GamePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);

function NotFoundPage() {
  return <h1>404 - Page Not Found</h1>;
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;


/* eslint-disable consistent-return */
import './styles/main.css';
import './styles/responsive.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DotLoader } from 'react-spinners';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import ProfilePage from './pages/ProfilePage';
import DetailProductPage from './pages/DetailProductPage';
import CartPage from './pages/CartPage';
import NavBar from './components/NavBar';
import { logoutFailure, logoutStart, logoutSuccess } from './redux/userRedux';
import { putAccessToken } from './utils/api';
import IdleTimer from './utils/IdleTimer';

function App() {
  const authedUser = useSelector((state) => state.user.currentUser);
  const isFetchingUser = false;
  const dispatch = useDispatch();
  console.log(isFetchingUser);
  const [isTimeout, setIsTimeout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const snapSrcUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const MidtransClientKey = process.env.MIDTRANS_CLIENT_KEY_SB;

    const script = document.createElement('script');
    script.src = snapSrcUrl;
    script.setAttribute('data-client-key', MidtransClientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  function onLogout() {
    try {
      dispatch(logoutStart());
      putAccessToken('');
    } catch (error) {
      dispatch(logoutFailure());
    }
    dispatch(logoutSuccess());
    navigate('/login');
  }

  useEffect(() => {
    if (authedUser) {
      const timer = new IdleTimer({
        timeout: 1800, // expire after 30 minute
        onTimeout: () => {
          setIsTimeout(true);
          onLogout();
        },
        onExpired: () => {
          // do something if expired on load
          setIsTimeout(true);
          onLogout();
        },
      });
      return () => {
        timer.cleanUp();
      };
    }
  }, [authedUser]);

  return (
    <div className="App">
      {
        isFetchingUser ? (
          <div className="loader">
            <DotLoader
              color="#254779"
              size={70}
              speedMultiplier={3}
            />
          </div>
        ) : (authedUser ? (
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              {/* <Route path="/profile" element={<RequireAuth authedUser={authedUser} />}>
                <Route path="/profile" element={<ProfilePage logout={onLogout} />} />
              </Route> */}
              <Route path="/profile" element={<ProfilePage logout={onLogout} />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<DetailProductPage />} />
              {/* <Route path="/cart" element={<RequireAuth authedUser={authedUser} />}>
                <Route path="/cart" element={<CartPage />} />
              </Route> */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        ) : (
          <main>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<DetailProductPage />} />
            </Routes>
          </main>
        )
        )
      }
    </div>
  );
}

export default App;

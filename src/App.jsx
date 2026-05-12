import { Outlet, Link, useLocation } from 'react-router-dom'
import './App.css'

function App() {
  const location = useLocation();
  return (
    <div>
      <nav style={navStyles.nav}>
        <Link
          to="/"
          style={{
            ...navStyles.link,
            ...(location.pathname === '/' ? navStyles.active : {})
          }}
        >
          Camera
        </Link>
        <Link
          to="/display"
          style={{
            ...navStyles.link,
            ...(location.pathname === '/display' ? navStyles.active : {})
          }}
        >
          Display
        </Link>
        <Link
          to="/find-old-picture"
          style={{
            ...navStyles.link,
            ...(location.pathname === '/find-old-picture' ? navStyles.active : {})
          }}
        >
          Find Photo
        </Link>
      </nav>
      <Outlet />
    </div>
  );
}

const navStyles = {
  nav: {
    display: 'flex',
    gap: '24px',
    padding: '12px 24px',
    backgroundColor: '#f9f9f9',
    borderBottom: '1px solid #ddd',
  },
  link: {
    textDecoration: 'none',
    color: '#111',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    padding: '6px 12px',
    borderRadius: '8px',
  },
  active: {
    backgroundColor: '#fae997',
    fontWeight: 'bold',
  },
};

export default App;
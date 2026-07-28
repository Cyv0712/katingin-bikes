import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { brandConfig } from '../data/brandConfig';

const NavigationBar = () => {
  const location = useLocation();
  const isInventoryActive = location.pathname === '/inventory' || 
                            location.pathname.startsWith('/bike') || 
                            location.pathname.startsWith('/showcase');

  return (
    <Navbar expand="lg" fixed="top" className="moto-nav glass-panel" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 gap-sm-3" style={{ fontWeight: 800, fontSize: 'clamp(1.05rem, 3.2vw, 1.35rem)' }}>
          <img 
            src="/static_data/Katingin_logo.webp" 
            alt="Katingin Bikes Logo" 
            style={{ height: 'clamp(32px, 7vw, 38px)', width: 'auto', borderRadius: '4px', transform: 'translateY(1px)' }} 
          />
          <span style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>
            {brandConfig.name} <span className="text-secondary fw-normal ms-1" style={{ fontSize: '0.75em', letterSpacing: '1px' }}>BY</span> <span className="text-accent fw-bold" style={{ letterSpacing: '0.5px' }}>REVLINE</span>
          </span>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_the_Philippines.svg"
            alt="Philippines"
            className="d-none d-sm-inline-block ms-1"
            style={{ height: '14px', width: 'auto', borderRadius: '2px', opacity: 0.85 }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" aria-label="Toggle Navigation Bar" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-lg-center">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>HOME</NavLink>
            <NavLink to="/inventory" className={`nav-link ${isInventoryActive ? 'active' : ''}`}>INVENTORY</NavLink>
            <NavLink to="/financing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>FINANCING</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>CONTACT</NavLink>
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>ADMIN</NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;

import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

import { brandConfig } from '../data/brandConfig';

const NavigationBar = () => {

  return (
    <Navbar expand="lg" fixed="top" className="moto-nav" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 gap-sm-3" style={{ fontWeight: 800, fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)' }}>
          <img 
            src="/static_data/Katingin_logo.webp" 
            alt="Katingin Bikes Logo" 
            style={{ height: 'clamp(32px, 8vw, 40px)', width: 'auto', borderRadius: '4px', transform: 'translateY(2px)' }} 
          />
          <span style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.5px' }}>{brandConfig.name} <span className="text-accent">{brandConfig.brandSuffix}</span></span>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_the_Philippines.svg"
            alt="Philippines"
            className="d-none d-sm-inline-block"
            style={{ height: '14px', width: 'auto', borderRadius: '2px', opacity: 0.85, marginLeft: '4px' }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" aria-label="Toggle Navigation Bar" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>HOME</NavLink>
            <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>INVENTORY</NavLink>
            <NavLink to="/financing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>FINANCING</NavLink>
            {/* <NavLink to="/buyers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>BUYERS</NavLink> */}
            {/* <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>ABOUT</NavLink> */}
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>CONTACT</NavLink>
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>ADMIN</NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;

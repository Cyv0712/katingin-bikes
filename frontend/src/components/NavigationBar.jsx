import { Navbar, Nav, Container } from 'react-bootstrap';
import { Activity } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { brandConfig } from '../data/brandConfig';

const NavigationBar = () => {
  const { pathname, hash } = useLocation();
  const getSectionLinkClass = (sectionHash) =>
    `nav-link ${pathname === '/' && hash === sectionHash ? 'active' : ''}`;

  return (
    <Navbar expand="lg" fixed="top" className="moto-nav" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-3" style={{ fontWeight: 800, fontSize: '1.4rem' }}>
          <img 
            src="/static_data/Katingin_logo.png" 
            alt="Katingin Bikes Logo" 
            style={{ height: '40px', width: 'auto', borderRadius: '4px' }} 
          />
          <span style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.5px' }}>{brandConfig.name} <span className="text-accent">{brandConfig.brandSuffix}</span></span>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_the_Philippines.svg"
            alt="Philippines"
            style={{ height: '14px', width: 'auto', borderRadius: '2px', opacity: 0.85, marginLeft: '4px' }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>HOME</NavLink>
            <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>INVENTORY</NavLink>
            <NavLink to="/buyers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>BUYERS</NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>ABOUT</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>CONTACT</NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;

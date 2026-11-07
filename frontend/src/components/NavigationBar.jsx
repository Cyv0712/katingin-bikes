import { useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { brandConfig } from '../data/brandConfig';

const NavigationBar = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const close = () => setExpanded(false);

  // Inventory stays highlighted on a bike's own page and on showcase pages
  const isInventoryActive =
    location.pathname === '/inventory' ||
    location.pathname.startsWith('/bike') ||
    location.pathname.startsWith('/showcase');

  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <Navbar expand="lg" className="moto-nav" expanded={expanded} onToggle={setExpanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="kb-brand" aria-label={`${brandConfig.fullName} home`} onClick={close}>
          <img src="/static_data/Katingin_logo.webp" alt="" width="40" height="40" />
          <span className="kb-brand-name">{brandConfig.fullName}</span>
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="main-navigation"
          aria-label={expanded ? 'Close menu' : 'Open menu'}
          className="kb-nav-toggle"
        >
          {expanded ? <X size={20} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.75} aria-hidden="true" />}
        </Navbar.Toggle>
        <Navbar.Collapse id="main-navigation">
          <Nav as="nav" aria-label="Main" className="ms-auto">
            <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
            <Link
              to="/inventory"
              className={`nav-link ${isInventoryActive ? 'active' : ''}`}
              aria-current={isInventoryActive ? 'page' : undefined}
              onClick={close}
            >
              Inventory
            </Link>
            <NavLink to="/financing" className={linkClass} onClick={close}>Financing</NavLink>
            <NavLink to="/contact" className={linkClass} onClick={close}>Contact</NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;

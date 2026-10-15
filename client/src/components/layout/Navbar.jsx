import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/employees', label: 'Employees' },
  { to: '/tasks', label: 'Tasks' },
];

const getLinkClass = ({ isActive }) =>
  isActive ? 'navbar__link navbar__link--active' : 'navbar__link';

export default function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__links">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={getLinkClass}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <span className="navbar__title">Employee &amp; Task Management</span>
    </header>
  );
}
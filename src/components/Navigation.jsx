import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#e8f5e9', // a light green
    borderBottom: '1px solid #c8e6c9',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#2e7d32', // a darker green
    fontWeight: 'bold',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  };

  const activeLinkStyle = {
    backgroundColor: '#2e7d32',
    color: 'white',
  };

  return (
    <nav style={navStyle}>
      <Link href="/" style={router.pathname === '/' ? { ...linkStyle, ...activeLinkStyle } : linkStyle}>Home</Link>
      <Link href="/tracker" style={router.pathname === '/tracker' ? { ...linkStyle, ...activeLinkStyle } : linkStyle}>Tracker</Link>
      <Link href="/recipes" style={router.pathname === '/recipes' ? { ...linkStyle, ...activeLinkStyle } : linkStyle}>Recipes</Link>
      <Link href="/mood-tracker" style={router.pathname === '/mood-tracker' ? { ...linkStyle, ...activeLinkStyle } : linkStyle}>Mood Tracker</Link>
      <Link href="/journal" style={router.pathname === '/journal' ? { ...linkStyle, ...activeLinkStyle } : linkStyle}>Journal</Link>
      <Link href="/quotes" style={router.pathname === '/quotes' ? { ...linkStyle, ...activeLinkStyle } : linkStyle}>Quotes</Link>
    </nav>
  );
}
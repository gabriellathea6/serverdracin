'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import {
  Icon,
  IconBell,
  IconLogOut,
  IconMenu,
  IconPlaySquare,
  IconSearch,
  type IconName,
} from './Icons';

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  match?: 'exact' | 'prefix';
};

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { href: '/aplikasi', label: 'Ringkasan', icon: 'layout-dashboard', match: 'exact' },
    ],
  },
  {
    title: 'Konten',
    items: [
      { href: '/aplikasi/drama', label: 'Drama', icon: 'clapperboard', match: 'prefix' },
      { href: '/aplikasi/episode', label: 'Episode', icon: 'film', match: 'prefix' },
    ],
  },
  {
    title: 'Konfigurasi',
    items: [
      { href: '/aplikasi/provider', label: 'Provider', icon: 'building-2', match: 'prefix' },
      { href: '/aplikasi/imgakit-api', label: 'ImageKit API', icon: 'image', match: 'prefix' },
    ],
  },
];

function isActive(pathname: string, item: NavItem) {
  if (item.match === 'exact') return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + '/');
}

export default function AppShell({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        html, body { margin:0; padding:0; overflow: hidden; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f4f7f4; }
        ::-webkit-scrollbar-thumb { background: #cbd9cb; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #a7bfa7; }
        .fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        .animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }

        .dash-root {
          display: flex;
          width: 100%;
          max-width: 100%;
          height: 100dvh;
          overflow: hidden;
          background: #f4f7f4;
          color: #2a392a;
          font-family: 'Inter', sans-serif;
        }

        .dash-sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: min(256px, 85vw);
          z-index: 50;
          display: flex;
          flex-direction: column;
          background: #fff;
          border-right: 1px solid #cbd9cb;
          box-shadow: 1px 0 4px rgba(0,0,0,0.04);
          transition: transform 0.3s ease;
        }
        .dash-sidebar.closed { transform: translateX(-100%); }

        .dash-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; width: 100%; }

        .dash-header {
          height: 64px;
          background: #fff;
          border-bottom: 1px solid #e4ebe4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          z-index: 10;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          gap: 12px;
          flex-shrink: 0;
        }
        .dash-search { width: 100%; max-width: 288px; min-width: 0; }
        .dash-user-email {
          display: none;
          font-size: 13px;
          color: #4a694a;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        .dash-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 16px;
          background: rgba(244,247,244,0.5);
          width: 100%;
          box-sizing: border-box;
        }
        .dash-menu-btn {
          display: flex;
          background: none;
          border: none;
          cursor: pointer;
          color: #4a694a;
          padding: 8px;
          border-radius: 8px;
        }

        .dash-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 4px;
          text-decoration: none;
          transition: all 0.15s;
          color: #4a694a;
        }
        .dash-nav-link:hover { background: #f4f7f4; }
        .dash-nav-link.active {
          background: #e4ebe4;
          color: #2a392a;
        }

        @media (min-width: 640px) {
          .dash-header { padding: 0 24px; }
          .dash-content { padding: 24px; }
          .dash-user-email { display: inline; }
        }
        @media (min-width: 1024px) {
          .dash-sidebar {
            position: relative;
            top: auto; left: auto; bottom: auto;
            width: 256px;
            transform: translateX(0) !important;
            flex-shrink: 0;
          }
          .dash-menu-btn { display: none; }
          .dash-header { padding: 0 32px; }
          .dash-content { padding: 28px 32px; }
        }
        @media (min-width: 1280px) {
          .dash-content { padding: 32px; }
        }
      `}</style>

      <div className="dash-root">
        {sidebarOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              background: 'rgba(42,57,42,0.4)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`dash-sidebar${sidebarOpen ? '' : ' closed'}`}>
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              borderBottom: '1px solid #e4ebe4',
            }}
          >
            <div style={{ background: '#4a694a', padding: 6, borderRadius: 8, marginRight: 10 }}>
              <IconPlaySquare size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px', color: '#2a392a' }}>
              MediaCDN<span style={{ color: '#608460', fontWeight: 500 }}>.net</span>
            </span>
          </div>

          <nav style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }}>
            {NAV_SECTIONS.map((section, sectionIndex) => (
              <div key={section.title}>
                <p
                  style={{
                    padding: '0 12px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#7fa07f',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                    marginTop: sectionIndex === 0 ? 0 : 24,
                  }}
                >
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const active = isActive(pathname, item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`dash-nav-link${active ? ' active' : ''}`}
                    >
                      <Icon
                        name={item.icon}
                        size={18}
                        color={active ? '#4a694a' : '#7fa07f'}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div style={{ padding: 16, borderTop: '1px solid #e4ebe4' }}>
            <form action={logoutAction}>
              <button
                type="submit"
                title={`Keluar (${userName})`}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: 14,
                  background: '#fef2f2',
                  color: '#dc2626',
                  minWidth: 0,
                }}
              >
                <IconLogOut size={18} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}
                >
                  Keluar ({userName})
                </span>
              </button>
            </form>
          </div>
        </aside>

        <div className="dash-main">
          <header className="dash-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              <button
                onClick={() => setSidebarOpen(true)}
                className="dash-menu-btn"
                aria-label="Buka menu"
              >
                <IconMenu size={24} />
              </button>
              <div style={{ position: 'relative', flex: 1, minWidth: 0, maxWidth: 288 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <IconSearch size={15} color="#7fa07f" />
                </span>
                <input
                  type="text"
                  placeholder="Cari file video, data metrik..."
                  className="dash-search"
                  style={{
                    paddingLeft: 36,
                    paddingRight: 16,
                    paddingTop: 8,
                    paddingBottom: 8,
                    border: '1px solid #cbd9cb',
                    borderRadius: 8,
                    fontSize: 13,
                    outline: 'none',
                    background: '#f4f7f4',
                    color: '#2a392a',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  color: '#608460',
                  padding: 4,
                }}
              >
                <IconBell size={20} />
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    background: '#f43f5e',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                  }}
                />
              </button>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid #a7bfa7',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=608460&color=fff&font-size=0.33`}
                  alt={userName}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <span className="dash-user-email">{userEmail}</span>
            </div>
          </header>

          <main className="fade-in dash-content">{children}</main>
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Chart: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lucide: any;
  }
}

const SERVER_STATUS_INITIAL = [
  { name: 'Asia Pasifik (SG)', load: 45, status: 'Operasional', uptime: '99.99%', ping: 12 },
  { name: 'Eropa Barat (FRA)', load: 82, status: 'Operasional', uptime: '99.95%', ping: 145 },
  { name: 'Amerika Utara (NY)', load: 91, status: 'Degradasi', uptime: '98.50%', ping: 210 },
  { name: 'Database Utama', load: 32, status: 'Operasional', uptime: '100.0%', ping: 2 },
];

const RECENT_LINKS = [
  { file: 'video_kampanye_2026.mp4', date: 'Diunggah 2 jam lalu', views: '14,203', bandwidth: '245 GB', status: 'Aktif' },
  { file: 'tutorial_penggunaan.mkv', date: 'Diunggah 5 jam lalu', views: '8,432', bandwidth: '112 GB', status: 'Aktif' },
  { file: 'webinar_recording_q1.mp4', date: 'Diunggah 1 hari lalu', views: '2,105', bandwidth: '45.2 GB', status: 'Arsip' },
  { file: 'intro_animation_v2.webm', date: 'Diunggah 3 hari lalu', views: '45,912', bandwidth: '1.2 TB', status: 'Aktif' },
  { file: 'company_profile_720p.mp4', date: 'Diunggah 1 minggu lalu', views: '1,204', bandwidth: '12.4 GB', status: 'Aktif' },
];

export default function DashboardView() {
  const [servers, setServers] = useState(SERVER_STATUS_INITIAL);
  const [scriptsReady, setScriptsReady] = useState(false);
  const apiChartRef = useRef<HTMLCanvasElement>(null);
  const storageChartRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstances = useRef<{ api: any; storage: any }>({ api: null, storage: null });

  useEffect(() => {
    if (!scriptsReady) return;
    if (!apiChartRef.current || !storageChartRef.current) return;
    if (!window.Chart) return;

    if (chartInstances.current.api) chartInstances.current.api.destroy();
    if (chartInstances.current.storage) chartInstances.current.storage.destroy();

    window.Chart.defaults.font.family = "'Inter', sans-serif";
    window.Chart.defaults.color = '#7fa07f';

    const ctxApi = apiChartRef.current.getContext('2d');
    const gradient = ctxApi!.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(96, 132, 96, 0.25)');
    gradient.addColorStop(1, 'rgba(96, 132, 96, 0.0)');

    chartInstances.current.api = new window.Chart(ctxApi, {
      type: 'line',
      data: {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        datasets: [{
          label: 'Request API (Juta)',
          data: [1.2, 1.9, 1.4, 2.4, 2.1, 2.9, 2.4],
          borderColor: '#608460',
          backgroundColor: gradient,
          borderWidth: 2.5,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#608460',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#2a392a',
            titleColor: '#fff',
            bodyColor: '#e4ebe4',
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: { label: (ctx: { parsed: { y: number } }) => ctx.parsed.y + ' Juta Request API' },
          },
        },
        scales: {
          y: { beginAtZero: true, max: 3.5, grid: { color: '#e4ebe4', borderDash: [5, 5], drawBorder: false }, border: { display: false } },
          x: { grid: { display: false }, border: { display: false } },
        },
        interaction: { mode: 'index', intersect: false },
      },
    });

    const ctxStorage = storageChartRef.current.getContext('2d');
    chartInstances.current.storage = new window.Chart(ctxStorage, {
      type: 'doughnut',
      data: {
        labels: ['Video MP4', 'WebM/Stream', 'Thumbnail', 'Cache CDN', 'Tersedia (Free)'],
        datasets: [{
          data: [45, 25, 8, 7, 15],
          backgroundColor: ['#334433', '#4a694a', '#7fa07f', '#cbd9cb', '#f4f7f4'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, padding: 16, boxWidth: 8, color: '#4a694a', font: { size: 11, weight: '500' } },
          },
          tooltip: {
            backgroundColor: '#2a392a',
            padding: 10,
            cornerRadius: 8,
            callbacks: { label: (ctx: { label: string; parsed: number }) => ' ' + ctx.label + ': ' + ctx.parsed + '%' },
          },
        },
      },
    });

    if (window.lucide) window.lucide.createIcons();
  }, [scriptsReady]);

  useEffect(() => {
    if (!scriptsReady || !window.lucide) return;
    window.lucide.createIcons();
  }, [scriptsReady]);

  useEffect(() => {
    const interval = setInterval(() => {
      setServers(prev => prev.map(s => {
        const pingVar = Math.floor(Math.random() * 7) - 3;
        const newPing = Math.max(1, s.ping + pingVar);
        const loadVar = Math.random() > 0.7 ? Math.floor(Math.random() * 5) - 2 : 0;
        const newLoad = Math.min(100, Math.max(10, s.load + loadVar));
        return { ...s, ping: newPing, load: newLoad };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="afterInteractive"
        onReady={() => setScriptsReady(true)}
      />

      <style>{`
        .dash-content-inner { width: 100%; max-width: none; margin: 0; }
        .dash-page-title {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .dash-metrics {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .dash-charts {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .dash-tables {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding-bottom: 24px;
        }
        @media (min-width: 640px) {
          .dash-metrics { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }
        @media (min-width: 1024px) {
          .dash-metrics { grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }
          .dash-charts { grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 28px; }
          .dash-tables { grid-template-columns: 1fr 1fr; gap: 24px; padding-bottom: 32px; }
          .dash-page-title { margin-bottom: 32px; }
        }
      `}</style>

      <div className="dash-content-inner">
        <div className="dash-page-title">
          <div>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: '#2a392a', letterSpacing: '-0.3px', margin: 0 }}>
              Ringkasan Sistem
            </h1>
            <p style={{ color: '#608460', fontSize: 13, marginTop: 4 }}>
              Monitoring real-time untuk server CDN file video.
            </p>
          </div>
          <button style={{
            background: '#4a694a', color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <i data-lucide="download-cloud" style={{ width: 15, height: 15 }}></i>
            Ekspor Laporan
          </button>
        </div>

        <div className="dash-metrics">
          {[
            { label: 'Data Tersimpan', value: '128.4', unit: 'TB', icon: 'database', change: '+12%', note: 'dari bulan lalu' },
            { label: 'Penggunaan API (24j)', value: '2.4', unit: 'Jt', icon: 'cpu', change: '+5.2%', note: 'dari kemarin' },
            { label: 'Link Aktif (Stream)', value: '1,842', unit: '', icon: 'link', change: '+24', note: 'link baru minggu ini' },
            { label: 'Kesehatan Server', value: 'Optimal', unit: '', icon: 'shield-check', change: 'Uptime: 99.98%', note: '', emerald: true },
          ].map(card => (
            <div key={card.label} style={{
              background: '#fff', borderRadius: 12, border: '1px solid #e4ebe4',
              padding: 20, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <p style={{ color: '#608460', fontSize: 13, fontWeight: 500, margin: 0 }}>{card.label}</p>
                  <h3 style={{ fontSize: 28, fontWeight: 700, color: card.emerald ? '#059669' : '#334433', margin: '4px 0 0', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    {card.value}
                    {card.unit && <span style={{ fontSize: 14, color: '#7fa07f', fontWeight: 600 }}>{card.unit}</span>}
                  </h3>
                </div>
                <div style={{
                  padding: 10, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  background: card.emerald ? '#d1fae5' : '#f4f7f4',
                  color: card.emerald ? '#059669' : '#4a694a',
                }}>
                  <i data-lucide={card.icon} style={{ width: 22, height: 22 }}></i>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, marginTop: 'auto' }}>
                <span style={{ background: '#d1fae5', color: '#059669', padding: '2px 6px', borderRadius: 4, fontWeight: 600, fontSize: 11 }}>
                  {card.change}
                </span>
                {card.note && <span style={{ color: '#7fa07f', marginLeft: 8 }}>{card.note}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="dash-charts">
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e4ebe4', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#334433', margin: 0 }}>Grafik Penggunaan API</h3>
                <p style={{ fontSize: 12, color: '#608460', marginTop: 4 }}>Total beban permintaan per hari</p>
              </div>
              <select style={{ background: '#f4f7f4', border: '1px solid #cbd9cb', color: '#334433', fontSize: 13, borderRadius: 8, padding: '6px 12px', outline: 'none' }}>
                <option>7 Hari Terakhir</option>
                <option>Bulan Ini</option>
                <option>Tahun Ini</option>
              </select>
            </div>
            <div style={{ height: 'clamp(200px, 40vw, 280px)', position: 'relative' }}>
              <canvas ref={apiChartRef} id="apiChart" />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e4ebe4', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#334433', margin: 0 }}>Distribusi Penyimpanan</h3>
            <p style={{ fontSize: 12, color: '#608460', marginTop: 4, marginBottom: 20 }}>Analisis tipe data tersimpan (Total 150TB)</p>
            <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 220 }}>
              <canvas ref={storageChartRef} id="storageChart" />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', marginTop: -20 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#334433' }}>85%</span>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7fa07f', fontWeight: 600 }}>Terpakai</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-tables">
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e4ebe4', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e4ebe4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#334433', margin: 0 }}>Media Populer (Bandwidth)</h3>
                <p style={{ fontSize: 11, color: '#7fa07f', marginTop: 2 }}>Link video yang paling sering diakses</p>
              </div>
              <button style={{ background: '#f4f7f4', border: 'none', padding: 6, borderRadius: 6, cursor: 'pointer', color: '#7fa07f' }}>
                <i data-lucide="external-link" style={{ width: 15, height: 15 }}></i>
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(244,247,244,0.8)', borderBottom: '1px solid #e4ebe4' }}>
                    {['File Media', 'Views', 'Trafik', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#608460', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_LINKS.map(link => (
                    <tr key={link.file} style={{ borderBottom: '1px solid #f4f7f4' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 6, background: '#e4ebe4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i data-lucide="video" style={{ width: 14, height: 14, color: '#4a694a' }}></i>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 500, color: '#2a392a', margin: 0, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'min(160px, 40vw)' }}>{link.file}</p>
                            <p style={{ fontSize: 11, color: '#7fa07f', margin: 0 }}>{link.date}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', color: '#334433', fontWeight: 500 }}>{link.views}</td>
                      <td style={{ padding: '10px 16px', color: '#4a694a', fontFamily: 'monospace', fontSize: 12 }}>{link.bandwidth}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                          background: link.status === 'Aktif' ? '#d1fae5' : '#e4ebe4',
                          color: link.status === 'Aktif' ? '#065f46' : '#4a694a',
                        }}>{link.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 20px', borderTop: '1px solid #e4ebe4', textAlign: 'center' }}>
              <a href="#" style={{ fontSize: 12, color: '#4a694a', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Lihat Semua Log Link <i data-lucide="arrow-right" style={{ width: 13, height: 13 }}></i>
              </a>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e4ebe4', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e4ebe4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#334433', margin: 0 }}>Monitoring Node Server</h3>
                <p style={{ fontSize: 11, color: '#7fa07f', marginTop: 2 }}>Status dan latensi server terdistribusi</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#d1fae5', padding: '4px 10px', borderRadius: 999, border: '1px solid #a7f3d0' }}>
                <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-flex' }}>
                  <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#34d399', opacity: 0.75 }}></span>
                  <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#065f46' }}>Live</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(244,247,244,0.8)', borderBottom: '1px solid #e4ebe4' }}>
                    {['Lokasi / Node', 'Beban (Load)', 'Ping', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#608460', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {servers.map(server => (
                    <tr key={server.name} style={{ borderBottom: '1px solid #f4f7f4' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i data-lucide="globe-2" style={{ width: 15, height: 15, color: '#7fa07f', flexShrink: 0 }}></i>
                          <div>
                            <p style={{ fontWeight: 500, color: '#2a392a', margin: 0, fontSize: 12 }}>{server.name}</p>
                            <p style={{ fontSize: 10, color: '#7fa07f', margin: 0, fontFamily: 'monospace' }}>Up: {server.uptime}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ width: '100%', background: '#e4ebe4', borderRadius: 999, height: 6, marginBottom: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: 6, borderRadius: 999, transition: 'width 1s ease-out',
                            background: server.load > 80 ? '#f59e0b' : '#4a694a',
                            width: `${server.load}%`,
                          }}></div>
                        </div>
                        <span style={{ fontSize: 10, color: '#608460', fontWeight: 500 }}>{server.load}% Kapasitas</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12, color: server.ping > 100 ? '#d97706' : '#4a694a', fontWeight: 500 }}>
                        {server.ping}ms
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: server.status === 'Operasional' ? '#10b981' : server.status === 'Degradasi' ? '#f59e0b' : '#ef4444',
                          }}></div>
                          <span style={{
                            fontSize: 12, fontWeight: 500,
                            color: server.status === 'Operasional' ? '#059669' : server.status === 'Degradasi' ? '#d97706' : '#dc2626',
                          }}>{server.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '8px 20px', borderTop: '1px solid #e4ebe4', textAlign: 'center', background: 'rgba(244,247,244,0.3)' }}>
              <p style={{ fontSize: 11, color: '#7fa07f', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <i data-lucide="refresh-cw" style={{ width: 12, height: 12 }}></i>
                Memperbarui otomatis (3s)
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

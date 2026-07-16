import Link from 'next/link';
import { IconPlus, IconArrowLeft } from './Icons';

type PageHeaderProps = {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
  backHref?: string;
};

export default function PageHeader({
  title,
  description,
  createHref,
  createLabel,
  backHref,
}: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div>
        {backHref && (
          <Link
            href={backHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#608460',
              fontSize: 12,
              fontWeight: 500,
              textDecoration: 'none',
              marginBottom: 8,
            }}
          >
            <IconArrowLeft size={14} color="#608460" />
            Kembali
          </Link>
        )}
        <h1
          style={{
            fontSize: 'clamp(20px, 4vw, 24px)',
            fontWeight: 700,
            color: '#2a392a',
            letterSpacing: '-0.3px',
            margin: 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ color: '#608460', fontSize: 13, marginTop: 4 }}>{description}</p>
        )}
      </div>
      {createHref && createLabel && (
        <Link
          href={createHref}
          style={{
            background: '#4a694a',
            color: '#fff',
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <IconPlus size={15} color="#fff" />
          {createLabel}
        </Link>
      )}
    </div>
  );
}

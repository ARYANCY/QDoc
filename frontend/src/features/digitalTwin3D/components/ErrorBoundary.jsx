import React from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Digital Twin Studio caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isCompact = this.props.compact || false;
      const title = this.props.title || '3D Studio Component Recovery';
      const message = this.props.message || 'An unexpected graphics or state issue occurred. You can restore this panel or reload the 3D twin session.';

      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            minHeight: isCompact ? '180px' : '260px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isCompact ? '16px' : '32px',
            background: 'var(--dt-bg-surface, #FFFFFF)',
            color: 'var(--dt-text-primary, #0F172A)',
            border: '1px solid var(--dt-border-default, #E2E8F0)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            textAlign: 'center',
            boxSizing: 'border-box',
            fontFamily: 'var(--dt-font-sans, "Plus Jakarta Sans", system-ui, sans-serif)',
          }}
        >
          {/* Alert Icon */}
          <div
            style={{
              width: isCompact ? '38px' : '48px',
              height: isCompact ? '38px' : '48px',
              borderRadius: '50%',
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E11D48',
              marginBottom: '12px',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={isCompact ? 18 : 22} />
          </div>

          {/* Heading & Details */}
          <div style={{ maxWidth: '440px', marginBottom: '18px' }}>
            <h3
              style={{
                fontSize: isCompact ? '0.86rem' : '1.05rem',
                fontWeight: 800,
                color: 'var(--dt-text-primary, #0F172A)',
                margin: '0 0 6px 0',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: isCompact ? '0.72rem' : '0.80rem',
                color: 'var(--dt-text-secondary, #475569)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {message}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: isCompact ? '6px 14px' : '9px 18px',
                borderRadius: '8px',
                background: '#2563EB',
                color: '#FFFFFF',
                fontSize: isCompact ? '0.74rem' : '0.82rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
            >
              <RefreshCw size={isCompact ? 13 : 15} />
              <span>Retry Component</span>
            </button>

            <button
              type="button"
              onClick={this.handleReload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: isCompact ? '6px 12px' : '9px 16px',
                borderRadius: '8px',
                background: 'var(--dt-bg-card, #F8FAFC)',
                color: 'var(--dt-text-secondary, #334155)',
                fontSize: isCompact ? '0.74rem' : '0.82rem',
                fontWeight: 600,
                border: '1px solid var(--dt-border-default, #CBD5E1)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dt-bg-card-hover, #F1F5F9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--dt-bg-card, #F8FAFC)'; }}
            >
              <RotateCcw size={isCompact ? 13 : 15} />
              <span>Reload Studio</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

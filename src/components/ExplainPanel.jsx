import React from 'react';
import { Info, HelpCircle, ArrowRight, Lightbulb, Compass } from 'lucide-react';

export default function ExplainPanel({
  phaseTitle,
  phaseColor,
  whatIsHappening,
  why,
  whatIsNext,
  crossHighlight = null,
  examinerTip = null
}) {
  return (
    <div className="panel" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: phaseColor,
            boxShadow: `0 0 8px ${phaseColor}`
          }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
            Compiler Walkthrough
          </h3>
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          background: `${phaseColor}20`,
          color: phaseColor,
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          {phaseTitle}
        </span>
      </div>

      {/* Cross Highlight details if any */}
      {crossHighlight && (
        <div style={{
          background: 'rgba(251, 191, 36, 0.08)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700,
            color: '#FBBF24',
            marginBottom: '4px'
          }}>
            <Compass size={16} />
            <span>Active Focus: {crossHighlight.label}</span>
          </div>
          <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13.5px' }}>
            {crossHighlight.value}
          </div>
          {crossHighlight.detail && (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {crossHighlight.detail}
            </div>
          )}
        </div>
      )}

      {/* 1. What is Happening */}
      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontSize: '15px',
          marginBottom: '6px'
        }}>
          <Info size={17} color="#3B82F6" />
          <span>What is Happening:</span>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {whatIsHappening}
        </p>
      </div>

      {/* 2. Why this decision was made */}
      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontSize: '15px',
          marginBottom: '6px'
        }}>
          <HelpCircle size={17} color="#A78BFA" />
          <span>Why this is done:</span>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {why}
        </p>
      </div>

      {/* 3. What is Next */}
      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontSize: '15px',
          marginBottom: '6px'
        }}>
          <ArrowRight size={17} color="#34D399" />
          <span>What is Next:</span>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {whatIsNext}
        </p>
      </div>

      {/* 4. Examiner Defense Tip */}
      {examinerTip && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '8px',
          padding: '12px',
          marginTop: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700,
            color: '#60A5FA',
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            <Lightbulb size={16} />
            <span>Examiner Defense Tip</span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {examinerTip}
          </p>
        </div>
      )}
    </div>
  );
}


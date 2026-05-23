import React from 'react';
import { Play, Info } from 'lucide-react';

export default function HeroBanner({ course, onOpenPlayer, onShowDetails }) {
  return (
    <div className="hero-banner" style={{
      backgroundImage: `linear-gradient(to top, var(--bg) 0%, rgba(10,12,20,0.35) 100%), url(${course.thumbnail})`,
    }}>
      <div className="hero-banner__content">
        <div className="hero-banner__badges">
          <span className="hero-banner__badge hero-banner__badge--green">✓ Liberado</span>
          <span className="hero-banner__badge hero-banner__badge--gold">★ Destaque</span>
        </div>
        <h1 className="hero-banner__title">{course.title}</h1>
        <p className="hero-banner__desc">{course.description}</p>
        <div className="hero-banner__actions">
          <button className="btn btn--primary hero-banner__btn" onClick={() => onOpenPlayer(course.id)}>
            <Play size={16} /> Acceder al Contenido
          </button>
          <button className="btn btn--ghost hero-banner__btn" onClick={() => onShowDetails(course)}>
            <Info size={16} /> Más Detalles
          </button>
        </div>
      </div>
    </div>
  );
}
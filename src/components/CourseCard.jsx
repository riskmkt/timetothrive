import React from 'react';
import { Play, Check, Star, Clock } from 'lucide-react';
import { getCourseDuration } from '../lib/duration.js';

export default function CourseCard({ course, isNew, onOpenPlayer, onShowDetails }) {
  const duration = getCourseDuration(course);

  return (
    <div className="pcard">
      <div className="pcard__img-wrap">
        <img className="pcard__img" src={course.thumbnail} alt={course.title} />
        <span className="pcard__badge pcard__badge--available" style={isNew ? { background: 'var(--accent)' } : {}}>
          {isNew ? <Star size={12} fill="white" /> : <Check size={12} />}
          {isNew ? ' Nuevo' : ' Disponible'}
        </span>
      </div>
      <div className="pcard__body">
        <span className="pcard__cat">{course.category || 'Prosperidad'}</span>
        <h3 className="pcard__name">{course.title}</h3>
        <p className="pcard__desc">{course.description}</p>
        <div className="pcard__meta">
          <div className="pcard__stars">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} />)}
          </div>
          <div className="pcard__time">
            <Clock size={14} />
            <span>{duration}</span>
          </div>
        </div>
        <div className="pcard__actions">
          <button className="btn btn--primary" onClick={() => onOpenPlayer(course.id)}>
            <Play size={16} /> Acceder al Curso
          </button>
          <button className="btn btn--ghost" onClick={() => onShowDetails(course)}>
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Play, Info, Check, Star, Clock } from 'lucide-react';
import LoadingSkeleton from '../../LoadingSkeleton.jsx';
import Footer from '../../Footer.jsx';
import CourseCard from '../components/CourseCard.jsx';
import HeroBanner from '../components/HeroBanner.jsx';

export default function HomePage({ courses, loading, onOpenPlayer, onShowDetails }) {
  return (
    <div>
      <main className="dashboard">
        {courses[0] && (
          <div className="dashboard__section fade-in">
            <HeroBanner course={courses[0]} onOpenPlayer={onOpenPlayer} onShowDetails={onShowDetails} />
          </div>
        )}

        <div className="dashboard__section fade-in fade-in-d1">
          <div className="dashboard__header">
            <h2>Tus Entrenamientos</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>{courses.length} Productos disponibles</span>
          </div>
          <div className="carousel">
            {loading ? (
              [...Array(4)].map((_, i) => <LoadingSkeleton key={i} />)
            ) : (
              courses.map(course => (
                <CourseCard key={course.id} course={course} onOpenPlayer={onOpenPlayer} onShowDetails={onShowDetails} />
              ))
            )}
          </div>
        </div>

        <div className="dashboard__section fade-in fade-in-d2">
          <div className="dashboard__header">
            <h2>Nuevos Lanzamientos</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>Llegaron esta semana</span>
          </div>
          <div className="carousel">
            {loading ? (
              [...Array(4)].map((_, i) => <LoadingSkeleton key={i} />)
            ) : (
              [...courses].reverse().map(course => (
                <CourseCard key={`novo-${course.id}`} course={course} isNew onOpenPlayer={onOpenPlayer} onShowDetails={onShowDetails} />
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
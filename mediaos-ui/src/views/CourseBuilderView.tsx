import React, { useState, useEffect } from 'react';
import { GraduationCap, FolderPlus, Layers, Play, CheckCircle2, ChevronRight, BookOpen, MoveVertical } from 'lucide-react';
import { MediaItem, api } from '../api';

interface CourseBuilderViewProps {
  mediaItems: MediaItem[];
  preselectedIds?: string[];
  onOpenMedia: (id: string) => void;
}

export const CourseBuilderView: React.FC<CourseBuilderViewProps> = ({
  mediaItems,
  preselectedIds = [],
  onOpenMedia
}) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(preselectedIds);
  const [courseTitle, setCourseTitle] = useState('Foundational Systems & Concurrent Architecture');
  const [isBuilding, setIsBuilding] = useState(false);

  useEffect(() => {
    api.listCourses().then(setCourses).catch(console.error);
  }, []);

  const handleBuildCourse = async () => {
    if (selectedIds.length === 0) return;
    setIsBuilding(true);
    try {
      const res = await api.buildCourse(courseTitle, 'Synthesized curriculum by MEDIAOS neural course compiler', selectedIds);
      if (res.success) {
        api.listCourses().then(setCourses);
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBuilding(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '4px' }}>
          PEDAGOGICAL MEDIA COMPILER
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Video → Course Builder
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Select multiple media lectures and compile them into structured, progressive modules with automatic notes and quizzes.
        </p>
      </div>

      {/* Course Creation Builder Box */}
      <div className="technical-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          CURRICULUM SYNTHESIZER
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Course Title:
            </label>
            <input
              type="text"
              value={courseTitle}
              onChange={e => setCourseTitle(e.target.value)}
              className="media-input-field"
              style={{ width: '100%', background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '8px 12px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn-primary"
              disabled={selectedIds.length === 0 || isBuilding}
              onClick={handleBuildCourse}
              style={{ width: '100%', padding: '9px', justifyContent: 'center' }}
            >
              <GraduationCap size={15} />
              {isBuilding ? 'Compiling Modules...' : `Build Course (${selectedIds.length} Videos)`}
            </button>
          </div>
        </div>

        {/* Video selector pills */}
        <div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '8px' }}>
            SELECT VIDEOS TO INCLUDE IN CURRICULUM:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {mediaItems.map(m => {
              const isSelected = selectedIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleSelect(m.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    background: isSelected ? 'var(--accent-lime-dim)' : 'var(--surface-secondary)',
                    border: isSelected ? '1px solid var(--accent-lime)' : '1px solid var(--border-color)',
                    color: isSelected ? 'var(--accent-lime)' : 'var(--text-secondary)'
                  }}
                >
                  {isSelected ? '✓ ' : '+ '}{m.title.slice(0, 32)}...
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Existing Courses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          COMPILED COURSES ({courses.length})
        </div>

        {courses.map(course => (
          <div key={course.id} className="technical-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="stage-pill active" style={{ fontSize: '10px' }}>
                  CURRICULUM ACTIVE
                </span>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {course.title}
                </h3>
              </div>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {course.modules?.length || 0} Modules
              </span>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {course.description}
            </p>

            {/* Modules List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {course.modules?.map((mod: any, midx: number) => (
                <div
                  key={midx}
                  style={{
                    background: 'var(--surface-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '3px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)' }}>
                      0{midx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {mod.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {mod.summary} • {mod.quiz_count} Knowledge Quizzes
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    onClick={() => onOpenMedia(mod.video_id)}
                  >
                    <Play size={11} /> Open Module
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

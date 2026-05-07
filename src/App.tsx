import React, { useState, useRef, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  isWeekend, 
  getDay,
  parse,
  isValid,
  set,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isToday,
  subMonths,
  eachDayOfInterval
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Sparkles,
  Loader2,
  ExternalLink,
  Users,
  Layers,
  FileText,
  Clipboard,
  Check,
  Search,
  RotateCcw,
  History,
  Clock3,
  Database,
  Map,
  GripVertical,
  X,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
type DayOption = 'weekdays' | 'weekends' | 'custom';
type TimeSlot = {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  sundayStartTime?: string;
  sundayEndTime?: string;
  tueThuStartTime?: string;
  tueThuEndTime?: string;
  tueThuTitle?: string;
  title: string;
  description: string;
  sessionLink: string; // For Q&A
  saturdayLink: string; // For LIVE
  sundayLink: string;   // For LIVE
  sessionPlatform: 'ZOOM' | 'MEET';
  category: 'qna-sessions-aig' | 'live-sessions-aig';
  instructors: string[];
  instructorsTue?: string[];
  instructorsThu?: string[];
  course: string[];
  courseLogic: 'sequential' | 'combined' | 'hybrid';
  batch: string[];
  courseGroup: string;
};

type GeneratedRow = {
  title: string;
  description: string;
  sessionLink: string;
  sessionPlatform: string;
  category: string;
  startTime: string;
  endTime: string;
  instructors: string;
  course: string;
  batch: string;
  courseGroup: string;
};

type SavedSchedule = {
  data: GeneratedRow[];
  startDate: string;
  endDate: string;
  dayOption: DayOption;
  customDays: number[];
  timeSlots: TimeSlot[];
  timestamp: string;
};

const SearchableInput = ({ 
  value, 
  onChange, 
  recentOptions, 
  isMandatory = false,
  onRemove,
  showRemove = false,
  placeholder = "Search..."
}: { 
  value: string, 
  onChange: (val: string) => void, 
  recentOptions: string[],
  isMandatory?: boolean,
  onRemove?: () => void,
  showRemove?: boolean,
  placeholder?: string,
  key?: React.Key
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = recentOptions.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input 
            type="text" 
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={isMandatory ? `${placeholder}*...` : `${placeholder}...`}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all text-slate-700 placeholder:text-slate-300"
          />
          <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
        </div>
        {showRemove && (
          <button 
            onClick={onRemove}
            className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (filteredOptions.length > 0 || search.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-40 overflow-y-auto custom-scrollbar p-1"
          >
            {filteredOptions.length > 0 ? (
              <div className="space-y-0.5">
                <div className="px-2 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Recent</div>
                {filteredOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between group"
                  >
                    {opt}
                    <ChevronRight size={10} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400 font-medium italic">
                No recent matches
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { 
  DndContext, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent, 
  DragOverEvent, 
  DragStartEvent, 
  closestCenter 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  CurriculumBlueprint, 
  DEFAULT_CURRICULUM_BLUEPRINT, 
  getSynchronizedCourseIDs,
  CurriculumPhase,
  CurriculumSession
} from './lib/curriculum';

const IST_TIMEZONE = 'Asia/Kolkata';

const DAYS_OF_WEEK = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
];

const CustomDatePicker = ({ 
  label, 
  value, 
  onChange, 
  startDate, 
  endDate 
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void,
  startDate: string,
  endDate: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(parse(value, 'yyyy-MM-dd', new Date()));
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync viewDate when value changes externally (e.g. if we want the calendar to jump to the selected date)
  useEffect(() => {
    if (isOpen) {
      setViewDate(parse(value, 'yyyy-MM-dd', new Date()));
    }
  }, [isOpen, value]);

  const selectedDate = parse(value, 'yyyy-MM-dd', new Date());
  const startRange = parse(startDate, 'yyyy-MM-dd', new Date());
  const endRange = parse(endDate, 'yyyy-MM-dd', new Date());

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const nextMonth = () => setViewDate(addMonths(viewDate, 1));
  const prevMonth = () => setViewDate(subMonths(viewDate, 1));

  const handleDateClick = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5 relative" ref={popoverRef}>
      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all text-slate-700 hover:bg-white hover:border-slate-300"
      >
        <span className="font-semibold">{format(selectedDate, 'MMM d, yyyy')}</span>
        <Calendar size={16} className="text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-[100] p-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                {format(viewDate, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, i) => {
                const isCurrentMonth = isSameMonth(date, monthStart);
                const isSelected = isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);
                
                // Range logic
                let isInRange = false;
                try {
                  isInRange = isWithinInterval(date, { 
                    start: startRange < endRange ? startRange : endRange, 
                    end: startRange < endRange ? endRange : startRange 
                  });
                } catch (e) {
                  // Fallback if dates are invalid
                }

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={`
                      relative h-9 w-full rounded-lg text-xs transition-all flex items-center justify-center
                      ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-600'}
                      ${isSelected ? 'bg-slate-900 text-white font-bold shadow-md z-10' : 'hover:bg-slate-50'}
                      ${isInRange && !isSelected ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}
                    `}
                  >
                    <span className="relative z-10">{format(date, 'd')}</span>
                    {isTodayDate && !isSelected && (
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SortableSession = ({ session, phaseId, onRename, onDelete }: { 
  key?: string;
  session: CurriculumSession; 
  phaseId: string;
  onRename: (phaseId: string, sessionId: string, newTitle: string) => void;
  onDelete: (phaseId: string, sessionId: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: session.id,
    data: { type: 'Session', session, phaseId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2 hover:border-indigo-200 transition-all shadow-sm"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-1">
        <Map size={14} />
      </div>
      <input
        type="text"
        value={session.title}
        onChange={(e) => onRename(phaseId, session.id, e.target.value)}
        className="flex-1 min-w-0 bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none focus:ring-0 p-0 text-ellipsis"
        placeholder="Session Title..."
      />
      <button
        onClick={() => onDelete(phaseId, session.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

const SortablePhase = ({ phase, onRenameSession, onDeleteSession, onAddSession, onDeletePhase, onRenamePhase }: { 
  key?: string;
  phase: CurriculumPhase;
  onRenameSession: (phaseId: string, sessionId: string, newTitle: string) => void;
  onDeleteSession: (phaseId: string, sessionId: string) => void;
  onAddSession: (phaseId: string) => void;
  onDeletePhase: (phaseId: string) => void;
  onRenamePhase: (phaseId: string, newName: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: phase.id,
    data: { type: 'Phase', phase }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-slate-50/50 border ${isDragging ? 'border-indigo-400 shadow-md ring-2 ring-indigo-500/20' : 'border-slate-200'} rounded-2xl p-4 space-y-4`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button 
            {...attributes} 
            {...listeners}
            className="cursor-move p-1 -ml-1 text-slate-300 hover:text-indigo-500 hover:bg-slate-100 rounded transition-colors touch-none shrink-0"
          >
            <GripVertical size={14} />
          </button>
          <input 
            type="text"
            value={phase.name}
            onChange={(e) => onRenamePhase(phase.id, e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') e.stopPropagation();
            }}
            className="flex-1 min-w-[120px] bg-transparent border border-transparent hover:border-slate-300 focus:bg-white focus:border-indigo-400 text-xs font-bold text-slate-700 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 px-2 py-1 rounded transition-all m-0"
            placeholder="Phase Name"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onAddSession(phase.id)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-2 py-1 rounded-lg"
          >
            <Plus size={12} />
            Add Session
          </button>
          <button
            onClick={() => {
              // Removed window.confirm due to iframe restrictions. 
              // A better approach would be an inline confirm state, but this works for now.
              onDeletePhase(phase.id);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <SortableContext items={phase.sessions.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {phase.sessions.map(session => (
            <SortableSession 
              key={session.id} 
              session={session} 
              phaseId={phase.id}
              onRename={onRenameSession}
              onDelete={onDeleteSession}
            />
          ))}
          {phase.sessions.length === 0 && (
            <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl">
              <p className="text-[10px] text-slate-400 font-medium italic">No sessions in this phase</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default function App() {
  // State
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dayOption, setDayOption] = useState<DayOption>('weekdays');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { 
      id: crypto.randomUUID(), 
      startTime: '19:30', 
      endTime: '20:30',
      tueThuStartTime: '18:30',
      tueThuEndTime: '21:30',
      tueThuTitle: 'Open Mic Q&A',
      title: 'Q&A session',
      description: '',
      sessionLink: '',
      saturdayLink: '',
      sundayLink: '',
      sessionPlatform: 'ZOOM',
      category: 'qna-sessions-aig',
      instructors: [''],
      instructorsTue: [''],
      instructorsThu: [''],
      course: [''],
      courseLogic: 'combined',
      batch: [''],
      courseGroup: ''
    }
  ]);
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedRow[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentInstructors, setRecentInstructors] = useState<string[]>([]);
  const [recentBatches, setRecentBatches] = useState<string[]>([]);
  const [recentCourses, setRecentCourses] = useState<string[]>([]);
  const [blueprint, setBlueprint] = useState<CurriculumBlueprint>(DEFAULT_CURRICULUM_BLUEPRINT);
  const [isCopied, setIsCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [lastGeneratedTime, setLastGeneratedTime] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const currentActiveBatches = Array.from(new Set([
    ...recentBatches,
    ...timeSlots.flatMap(s => s.batch.filter(b => b.trim() !== ''))
  ]));

  // Load recent instructors and saved schedule from localStorage
  useEffect(() => {
    if (timeSlots.length > 0 && !selectedSlotId) {
      setSelectedSlotId(timeSlots[0].id);
    }
  }, [timeSlots, selectedSlotId]);

  useEffect(() => {
    const savedInstructors = localStorage.getItem('recentInstructors');
    if (savedInstructors) {
      try {
        setRecentInstructors(JSON.parse(savedInstructors));
      } catch (e) {
        console.error('Failed to parse recent instructors', e);
      }
    }

    const savedBatches = localStorage.getItem('recentBatches');
    if (savedBatches) {
      try {
        setRecentBatches(JSON.parse(savedBatches));
      } catch (e) {
        console.error('Failed to parse recent batches', e);
      }
    }

    const savedCourses = localStorage.getItem('recentCourses');
    if (savedCourses) {
      try {
        setRecentCourses(JSON.parse(savedCourses));
      } catch (e) {
        console.error('Failed to parse recent courses', e);
      }
    }

    const savedBlueprint = localStorage.getItem('curriculum_blueprint');
    if (savedBlueprint) {
      try {
        const parsed = JSON.parse(savedBlueprint);
        // Migration: If old structure (sessions as object), reset to default
        if (parsed.phases) {
          setBlueprint(parsed);
        } else {
          setBlueprint(DEFAULT_CURRICULUM_BLUEPRINT);
        }
      } catch (e) {
        console.error('Failed to parse curriculum blueprint', e);
      }
    }

    const savedSchedule = localStorage.getItem('saved_schedule_data');
    if (savedSchedule) {
      try {
        const parsed = JSON.parse(savedSchedule);
        setHasSavedData(true);
        setLastGeneratedTime(parsed.timestamp);
      } catch (e) {
        console.error('Failed to parse saved schedule', e);
      }
    }
  }, []);

  const saveToRecentInstructors = (names: string[]) => {
    const updated = Array.from(new Set([...names.filter(n => n.trim() !== ''), ...recentInstructors])).slice(0, 10);
    setRecentInstructors(updated);
    localStorage.setItem('recentInstructors', JSON.stringify(updated));
  };

  const saveToRecentBatches = (batches: string[]) => {
    const updated = Array.from(new Set([...batches.filter(b => b.trim() !== ''), ...recentBatches])).slice(0, 10);
    setRecentBatches(updated);
    localStorage.setItem('recentBatches', JSON.stringify(updated));
  };

  const saveToRecentCourses = (courses: string[]) => {
    const updated = Array.from(new Set([...courses.filter(c => c.trim() !== ''), ...recentCourses])).slice(0, 10);
    setRecentCourses(updated);
    localStorage.setItem('recentCourses', JSON.stringify(updated));
  };

  const updateBlueprintBatchId = (batch: string, phaseId: string, courseId: string) => {
    const newBlueprint = {
      ...blueprint,
      batchPhaseIds: {
        ...blueprint.batchPhaseIds,
        [batch]: {
          ...(blueprint.batchPhaseIds[batch] || {}),
          [phaseId]: courseId
        }
      }
    };
    setBlueprint(newBlueprint);
    localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
  };

  const renameSession = (phaseId: string, sessionId: string, newTitle: string) => {
    const newBlueprint = {
      ...blueprint,
      phases: blueprint.phases.map(p => 
        p.id === phaseId 
          ? { ...p, sessions: p.sessions.map(s => s.id === sessionId ? { ...s, title: newTitle } : s) }
          : p
      )
    };
    setBlueprint(newBlueprint);
    localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
  };

  const deleteSession = (phaseId: string, sessionId: string) => {
    const newBlueprint = {
      ...blueprint,
      phases: blueprint.phases.map(p => 
        p.id === phaseId 
          ? { ...p, sessions: p.sessions.filter(s => s.id !== sessionId) }
          : p
      )
    };
    setBlueprint(newBlueprint);
    localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
  };

  const addSession = (phaseId: string) => {
    const newBlueprint = {
      ...blueprint,
      phases: blueprint.phases.map(p => 
        p.id === phaseId 
          ? { ...p, sessions: [...p.sessions, { id: crypto.randomUUID(), title: '' }] }
          : p
      )
    };
    setBlueprint(newBlueprint);
    localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
  };

  const addPhase = () => {
    const newPhaseId = `phase-${Date.now()}`;
    const newPhaseName = `PHASE ${blueprint.phases.length + 1}`;
    const newBlueprint = {
      ...blueprint,
      phases: [...blueprint.phases, { id: newPhaseId, name: newPhaseName, sessions: [] }]
    };
    setBlueprint(newBlueprint);
    localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
  };

  const renamePhase = (phaseId: string, newName: string) => {
    const newBlueprint = {
      ...blueprint,
      phases: blueprint.phases.map(p => 
        p.id === phaseId ? { ...p, name: newName } : p
      )
    };
    setBlueprint(newBlueprint);
    localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
  };

  const deletePhase = (phaseId: string) => {
    const newBlueprint = {
      ...blueprint,
      phases: blueprint.phases.filter(p => p.id !== phaseId)
    };
    setBlueprint(newBlueprint);
    localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      if (active.data.current?.type === 'Phase') {
        const activeIdx = blueprint.phases.findIndex(p => p.id === active.id);
        const overIdx = blueprint.phases.findIndex(p => p.id === over.id || (over.data.current?.type === 'Session' && p.id === over.data.current.phaseId));
        
        if (activeIdx !== -1 && overIdx !== -1) {
          const newPhases = arrayMove(blueprint.phases, activeIdx, overIdx);
          const newBlueprint = { ...blueprint, phases: newPhases };
          setBlueprint(newBlueprint);
          localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
        }
        return;
      }

      // It's a Session being dragged
      let activePhaseIdx = -1;
      let activeSessionIdx = -1;
      let overPhaseIdx = -1;
      let overSessionIdx = -1;

      blueprint.phases.forEach((p, pIdx) => {
        const sIdx = p.sessions.findIndex(s => s.id === active.id);
        if (sIdx !== -1) {
          activePhaseIdx = pIdx;
          activeSessionIdx = sIdx;
        }
        
        if (over.data.current?.type === 'Phase' && p.id === over.id) {
          overPhaseIdx = pIdx;
          overSessionIdx = p.sessions.length; // Drop at end of empty/target phase
        } else {
          const osIdx = p.sessions.findIndex(s => s.id === over.id);
          if (osIdx !== -1) {
            overPhaseIdx = pIdx;
            overSessionIdx = osIdx;
          }
        }
      });

      if (activePhaseIdx !== -1 && overPhaseIdx !== -1) {
        const newPhases = [...blueprint.phases];
        const [movedSession] = newPhases[activePhaseIdx].sessions.splice(activeSessionIdx, 1);
        
        // If moving within same phase
        if (activePhaseIdx === overPhaseIdx) {
          newPhases[activePhaseIdx].sessions.splice(overSessionIdx, 0, movedSession);
        } else {
          // Moving to a different phase
          newPhases[overPhaseIdx].sessions.splice(overSessionIdx, 0, movedSession);
        }

        const newBlueprint = { ...blueprint, phases: newPhases };
        setBlueprint(newBlueprint);
        localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const clearAll = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setStartDate(today);
    setEndDate(today);
    setDayOption('weekdays');
    setCustomDays([1, 2, 3, 4, 5]);
    setTimeSlots([
      { 
        id: crypto.randomUUID(), 
        startTime: '19:30', 
        endTime: '20:30',
        tueThuStartTime: '18:30',
        tueThuEndTime: '21:30',
        tueThuTitle: 'Open Mic Q&A',
        title: 'Q&A session',
        description: '',
        sessionLink: '',
        saturdayLink: '',
        sundayLink: '',
        sessionPlatform: 'ZOOM',
        category: 'qna-sessions-aig',
        instructors: [''],
        instructorsTue: [''],
        instructorsThu: [''],
        course: [''],
        courseLogic: 'combined',
        batch: [''],
        courseGroup: ''
      }
    ]);
    setGeneratedSchedule([]);
    setIsGenerated(false);
    setShowClearConfirm(false);
    localStorage.removeItem('saved_schedule_data');
    
    // Clear recent memory
    setRecentInstructors([]);
    setRecentBatches([]);
    setRecentCourses([]);
    localStorage.removeItem('recentInstructors');
    localStorage.removeItem('recentBatches');
    localStorage.removeItem('recentCourses');
    
    // Clear blueprint batch mappings
    setBlueprint(prev => {
      const newBlueprint = {
        ...prev,
        batchPhaseIds: {}
      };
      localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
      return newBlueprint;
    });
    
    setHasSavedData(false);
    setLastGeneratedTime(null);
  };

  const restoreLastSchedule = () => {
    const saved = localStorage.getItem('saved_schedule_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedSchedule;
        
        // Migration: Ensure arrays
        const migratedTimeSlots = parsed.timeSlots.map(slot => ({
          ...slot,
          batch: Array.isArray(slot.batch) ? slot.batch : [slot.batch || ''],
          course: Array.isArray(slot.course) ? slot.course : [slot.course || ''],
          courseLogic: (slot as any).courseLogic || 'combined',
          instructorsTue: slot.instructorsTue || [''],
          instructorsThu: slot.instructorsThu || ['']
        }));

        setStartDate(parsed.startDate);
        setEndDate(parsed.endDate);
        setDayOption(parsed.dayOption);
        setCustomDays(parsed.customDays);
        setTimeSlots(migratedTimeSlots);
        setGeneratedSchedule(parsed.data);
        setIsGenerated(true);
        setHasSavedData(false);
      } catch (e) {
        console.error("Failed to restore schedule", e);
      }
    }
  };

  // Quick Select Logic
  const handleQuickSelect = (type: 'this-month' | 'next-month' | 'next-90-days') => {
    const today = new Date();
    let start: Date, end: Date;

    if (type === 'this-month') {
      start = startOfMonth(today);
      end = endOfMonth(today);
    } else if (type === 'next-month') {
      const nextMonth = addMonths(today, 1);
      start = startOfMonth(nextMonth);
      end = endOfMonth(nextMonth);
    } else { // next-90-days
      start = today;
      end = addDays(today, 90);
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  const isThisMonthActive = startDate === format(startOfMonth(new Date()), 'yyyy-MM-dd') && 
                           endDate === format(endOfMonth(new Date()), 'yyyy-MM-dd');
  const isNextMonthActive = startDate === format(startOfMonth(addMonths(new Date(), 1)), 'yyyy-MM-dd') && 
                            endDate === format(endOfMonth(addMonths(new Date(), 1)), 'yyyy-MM-dd');
  const isNext90DaysActive = startDate === format(new Date(), 'yyyy-MM-dd') && 
                            endDate === format(addDays(new Date(), 90), 'yyyy-MM-dd');

  // Session Count Logic
  const sessionCount = (() => {
    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());

    if (!isValid(start) || !isValid(end) || start > end) return 0;

    const allDays = eachDayOfInterval({ start, end });
    const filteredDays = allDays.filter(date => {
      if (dayOption === 'weekdays') return !isWeekend(date);
      if (dayOption === 'weekends') return isWeekend(date);
      return customDays.includes(getDay(date));
    });

    return filteredDays.length * timeSlots.length;
  })();

  // Handlers
  const addTimeSlot = () => {
    const newId = crypto.randomUUID();
    setTimeSlots([...timeSlots, { 
      id: newId, 
      startTime: '09:00', 
      endTime: '10:00',
      tueThuStartTime: '09:00',
      tueThuEndTime: '10:00',
      tueThuTitle: 'Open Mic Q&A',
      title: 'Q&A session',
      description: '',
      sessionLink: '',
      saturdayLink: '',
      sundayLink: '',
      sessionPlatform: 'ZOOM',
      category: 'qna-sessions-aig',
      instructors: [''],
      instructorsTue: [''],
      instructorsThu: [''],
      course: [''],
      courseLogic: 'combined',
      batch: [''],
      courseGroup: ''
    }]);
    setSelectedSlotId(newId);
  };

  const removeTimeSlot = (id: string) => {
    if (timeSlots.length > 1) {
      const newSlots = timeSlots.filter(slot => slot.id !== id);
      setTimeSlots(newSlots);
      if (selectedSlotId === id) {
        setSelectedSlotId(newSlots[0].id);
      }
    }
  };

  const updateTimeSlot = (id: string, field: keyof TimeSlot, value: any) => {
    setTimeSlots(timeSlots.map(slot => slot.id === id ? { ...slot, [field]: value } : slot));
  };

  const addInstructor = (slotId: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, instructors: [...slot.instructors, ''] } : slot
    ));
  };

  const removeInstructor = (slotId: string, index: number) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, instructors: slot.instructors.filter((_, i) => i !== index) } : slot
    ));
  };

  const updateInstructor = (slotId: string, index: number, value: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { 
        ...slot, 
        instructors: slot.instructors.map((inst, i) => i === index ? value : inst) 
      } : slot
    ));
  };

  const addBatch = (slotId: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, batch: [...slot.batch, ''] } : slot
    ));
  };

  const removeBatch = (slotId: string, index: number) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, batch: slot.batch.filter((_, i) => i !== index) } : slot
    ));
  };

  const updateBatch = (slotId: string, index: number, value: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { 
        ...slot, 
        batch: slot.batch.map((b, i) => i === index ? value : b) 
      } : slot
    ));
  };

  const addCourse = (slotId: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, course: [...slot.course, ''] } : slot
    ));
  };

  const removeCourse = (slotId: string, index: number) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, course: slot.course.filter((_, i) => i !== index) } : slot
    ));
  };

  const updateCourse = (slotId: string, index: number, value: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { 
        ...slot, 
        course: slot.course.map((c, i) => i === index ? value : c) 
      } : slot
    ));
  };

  const toggleCustomDay = (day: number) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter(d => d !== day));
    } else {
      setCustomDays([...customDays, day]);
    }
  };

  const TimeInput12h = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) => {
    const [h24, m] = value.split(':').map(Number);
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;

    const [isHourOpen, setIsHourOpen] = useState(false);
    const [isMinuteOpen, setIsMinuteOpen] = useState(false);
    
    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (hourRef.current && !hourRef.current.contains(event.target as Node)) {
          setIsHourOpen(false);
        }
        if (minuteRef.current && !minuteRef.current.contains(event.target as Node)) {
          setIsMinuteOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateTime = (newH12: number, newM: number, newPeriod: 'AM' | 'PM') => {
      let newH24 = newH12;
      if (newPeriod === 'PM' && newH12 < 12) newH24 += 12;
      if (newPeriod === 'AM' && newH12 === 12) newH24 = 0;
      onChange(`${newH24.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
    };

    return (
      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</span>
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:border-indigo-500/50 transition-all">
          
          {/* Hour Selector */}
          <div className="relative" ref={hourRef}>
            <button 
              type="button"
              onClick={() => { setIsHourOpen(!isHourOpen); setIsMinuteOpen(false); }}
              className="text-sm font-semibold focus:outline-none cursor-pointer text-slate-700 hover:text-indigo-600 transition-colors min-w-[24px] text-center"
            >
              {h12}
            </button>
            <AnimatePresence>
              {isHourOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] p-2 grid grid-cols-3 gap-1"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => { updateTime(h, m, period); setIsHourOpen(false); }}
                      className={`h-9 rounded-lg text-xs transition-all flex items-center justify-center ${
                        h12 === h 
                          ? 'bg-slate-900 text-white font-bold shadow-md' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="text-slate-300 font-bold">:</span>

          {/* Minute Selector */}
          <div className="relative" ref={minuteRef}>
            <button 
              type="button"
              onClick={() => { setIsMinuteOpen(!isMinuteOpen); setIsHourOpen(false); }}
              className="text-sm font-semibold focus:outline-none cursor-pointer text-slate-700 hover:text-indigo-600 transition-colors min-w-[24px] text-center"
            >
              {m.toString().padStart(2, '0')}
            </button>
            <AnimatePresence>
              {isMinuteOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] p-2 grid grid-cols-5 gap-1 max-h-[240px] overflow-y-auto custom-scrollbar"
                >
                  {Array.from({ length: 60 }, (_, i) => i).map(min => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => { updateTime(h12, min, period); setIsMinuteOpen(false); }}
                      className={`h-8 rounded-lg text-[10px] transition-all flex items-center justify-center ${
                        m === min 
                          ? 'bg-slate-900 text-white font-bold shadow-md' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                      }`}
                    >
                      {min.toString().padStart(2, '0')}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            type="button"
            onClick={() => updateTime(h12, m, period === 'AM' ? 'PM' : 'AM')}
            className="ml-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-tight"
          >
            {period}
          </button>
        </div>
      </div>
    );
  };

  const generateSchedule = async () => {
    setIsGenerating(true);
    
    // Simulate a brief loading state for "SaaS" feel
    await new Promise(resolve => setTimeout(resolve, 800));

    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());

    if (!isValid(start) || !isValid(end) || start > end) {
      alert('Please select a valid date range.');
      setIsGenerating(false);
      return;
    }

    // Validation for mandatory fields
    const invalidSlot = timeSlots.find(slot => {
      const isQnA = slot.category === 'qna-sessions-aig';
      const isCustom = dayOption === 'custom';
      const linksValid = (isQnA || isCustom) ? !!slot.sessionLink : (!!slot.saturdayLink && !!slot.sundayLink);
      
      return !linksValid || !slot.instructors[0] || !slot.batch[0];
    });

    if (invalidSlot) {
      alert('Please fill in all mandatory fields (*) for all time slots (Session links, Instructor 1, and Batch).');
      setIsGenerating(false);
      return;
    }

    // Save used instructors, batches and courses to memory
    const allUsedInstructors = timeSlots.flatMap(s => s.instructors);
    saveToRecentInstructors(allUsedInstructors);
    
    const allUsedBatches = timeSlots.flatMap(s => s.batch);
    saveToRecentBatches(allUsedBatches);

    const allUsedCourses = timeSlots.flatMap(s => s.course);
    saveToRecentCourses(allUsedCourses);

    const allDays = eachDayOfInterval({ start, end });
    const filteredDays = allDays.filter(date => {
      if (dayOption === 'weekdays') return !isWeekend(date);
      if (dayOption === 'weekends') return isWeekend(date);
      return customDays.includes(getDay(date));
    });

    const curriculumManagerList = blueprint.phases.flatMap(p => 
      p.sessions.map(s => ({ name: s.title, phaseId: p.id }))
    );
    let liveSessionCounter = 0;

    const schedule: GeneratedRow[] = [];
    const totalSessions = filteredDays.length * timeSlots.length;
    let sessionIndex = 0;

    filteredDays.forEach(date => {
      const dayOfWeek = getDay(date); // 0 = Sunday, 6 = Saturday
      
      timeSlots.forEach(slot => {
        let currentStartTime = slot.startTime;
        let currentEndTime = slot.endTime;
        
        if (slot.category === 'live-sessions-aig' && dayOfWeek === 0) {
          currentStartTime = slot.sundayStartTime || slot.startTime;
          currentEndTime = slot.sundayEndTime || slot.endTime;
        } else if (slot.category === 'qna-sessions-aig' && (dayOfWeek === 2 || dayOfWeek === 4)) {
          // Tue (2) and Thu (4) overrides for Q&A
          currentStartTime = slot.tueThuStartTime || slot.startTime;
          currentEndTime = slot.tueThuEndTime || slot.endTime;
        }

        const [startH, startM] = currentStartTime.split(':').map(Number);
        const [endH, endM] = currentEndTime.split(':').map(Number);

        const startDateTime = set(date, { hours: startH, minutes: startM, seconds: 0 });
        let endDateTime = set(date, { hours: endH, minutes: endM, seconds: 0 });

        // Date Rollover Detection: If EndTime is less than or equal to StartTime, it's the next day
        if (endDateTime <= startDateTime) {
          endDateTime = addDays(endDateTime, 1);
        }

        // Format for IST display: [Day] [Month] [Year] [Time] IST
        const startStr = formatInTimeZone(startDateTime, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';
        const endStr = formatInTimeZone(endDateTime, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';

        // Conditional Session Link
        let sessionLink = '';
        if (slot.category === 'qna-sessions-aig' || dayOption === 'custom') {
          sessionLink = slot.sessionLink;
        } else {
          // Sunday (0) uses sundayLink, others use saturdayLink
          sessionLink = dayOfWeek === 0 ? slot.sundayLink : slot.saturdayLink;
        }

        // Course Logic
        let courseValue = '';
        let finalTitle = slot.title;
        if (slot.category === 'qna-sessions-aig' && (dayOfWeek === 2 || dayOfWeek === 4)) {
          finalTitle = slot.tueThuTitle || slot.title;
        }
        const activeCourses = slot.course.filter(c => c.trim() !== '');
        const activeBatches = slot.batch.filter(b => b.trim() !== '');
        
        if (slot.category === 'live-sessions-aig') {
          if (curriculumManagerList.length > 0) {
            const curriculumItem = curriculumManagerList[liveSessionCounter % curriculumManagerList.length];
            finalTitle = curriculumItem.name;
            
            const ids = activeBatches.map(batch => {
              const batchIds = blueprint.batchPhaseIds[batch];
              return batchIds?.[curriculumItem.phaseId] || "N/A";
            });
            courseValue = ids.join(', ');
            
            liveSessionCounter++;
          } else {
            courseValue = activeCourses.join(', ');
          }
        } else {
          if (slot.courseLogic === 'combined') {
            courseValue = activeCourses.join(', ');
          } else if (slot.courseLogic === 'sequential') {
            if (activeCourses.length > 0) {
              const courseIdx = Math.floor((sessionIndex / totalSessions) * activeCourses.length);
              courseValue = activeCourses[Math.min(courseIdx, activeCourses.length - 1)];
            }
          } else if (slot.courseLogic === 'hybrid') {
            courseValue = getSynchronizedCourseIDs(slot.title, activeBatches, blueprint);
          }
        }

        let currentInstructors = slot.instructors;
        if (slot.category === 'qna-sessions-aig') {
          if (dayOfWeek === 2 && slot.instructorsTue && slot.instructorsTue.length > 0 && slot.instructorsTue[0].trim() !== '') {
            currentInstructors = slot.instructorsTue;
          } else if (dayOfWeek === 4 && slot.instructorsThu && slot.instructorsThu.length > 0 && slot.instructorsThu[0].trim() !== '') {
            currentInstructors = slot.instructorsThu;
          }
        }

        schedule.push({ 
          title: finalTitle,
          description: slot.description,
          sessionLink: sessionLink,
          sessionPlatform: slot.sessionPlatform,
          category: slot.category,
          startTime: startStr,
          endTime: endStr,
          instructors: currentInstructors.filter(i => i.trim() !== '').join(', '),
          course: courseValue,
          batch: slot.batch.filter(b => b.trim() !== '').join(', '),
          courseGroup: slot.courseGroup
        });
        sessionIndex++;
      });
    });

    setGeneratedSchedule(schedule);
    setIsGenerated(true);
    setIsGenerating(false);

    const savedData: SavedSchedule = {
      data: schedule,
      startDate,
      endDate,
      dayOption,
      customDays,
      timeSlots,
      timestamp: format(new Date(), 'MMMM d, hh:mm a')
    };
    localStorage.setItem('saved_schedule_data', JSON.stringify(savedData));
    setHasSavedData(false);
    setLastGeneratedTime(savedData.timestamp);
  };

  const downloadCSV = () => {
    if (generatedSchedule.length === 0) return;

    const headers = [
      'Title', 
      'Description', 
      'SessionLink', 
      'SessionPlatform', 
      'Category', 
      'StartTime', 
      'EndTime', 
      'Instructors', 
      'Course',
      'Batch', 
      'CourseGroup'
    ];
    
    const rows = generatedSchedule.map(item => [
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.sessionLink.replace(/"/g, '""')}"`,
      `"${item.sessionPlatform.replace(/"/g, '""')}"`,
      `"${item.category.replace(/"/g, '""')}"`,
      `"${item.startTime}"`,
      `"${item.endTime}"`,
      `"${item.instructors.replace(/"/g, '""')}"`,
      `"${item.course.replace(/"/g, '""')}"`,
      `"${item.batch.replace(/"/g, '""')}"`,
      `"${item.courseGroup.replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `session_schedule_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (generatedSchedule.length === 0) return;

    // 1. Spreadsheet Format (Tab-Separated)
    const headers = ['Title', 'Description', 'SessionLink', 'SessionPlatform', 'Category', 'StartTime', 'EndTime', 'Instructors', 'Course', 'Batch', 'CourseGroup'];
    const tsvRows = generatedSchedule.map(item => [
      item.title,
      item.description,
      item.sessionLink,
      item.sessionPlatform,
      item.category,
      item.startTime,
      item.endTime,
      item.instructors,
      item.course,
      item.batch,
      item.courseGroup
    ].join('\t'));
    const tsvContent = [headers.join('\t'), ...tsvRows].join('\n');

    try {
      await navigator.clipboard.writeText(tsvContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
      alert('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-[1800px] mx-auto px-6 py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="space-y-2 text-center md:text-left">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest"
              >
                <Sparkles size={12} />
                <span>Professional Scheduler</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-extrabold tracking-tight text-slate-900 font-display"
              >
                Session <span className="text-indigo-600">Scheduler</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-sm font-medium"
              >
                Generate precise session schedules with flexible date ranges and automated mapping.
              </motion.p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <CheckCircle2 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">All Systems Operational</span>
              </div>
              <div className="px-4 py-2 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider">Asia/Kolkata Time</span>
              </div>
            </div>
        </header>

        <AnimatePresence>
          {hasSavedData && !isGenerated && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                  <History size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-900">You have a previously generated schedule available.</p>
                  <p className="text-xs text-indigo-600/70 font-medium">Last generated: {lastGeneratedTime}</p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={restoreLastSchedule}
                  className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                  Restore Last Generated
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('saved_schedule_data');
                    setHasSavedData(false);
                  }}
                  className="flex-1 sm:flex-none bg-white border border-indigo-200 text-indigo-600 px-6 py-3 rounded-2xl text-xs font-bold hover:bg-indigo-100 transition-all active:scale-95"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-10 items-stretch">
          {/* Controls Panel */}
          <div className="space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-8">
              {/* Date Range */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2.5">
                    <Calendar size={14} className="text-indigo-500" />
                    Date Range
                  </label>
                  
                  {/* Quick Select Chips */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleQuickSelect('this-month')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                        isThisMonthActive 
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                          : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      This Month
                    </button>
                    <button 
                      onClick={() => handleQuickSelect('next-month')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                        isNextMonthActive 
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                          : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      Next Month
                    </button>
                    <button 
                      onClick={() => handleQuickSelect('next-90-days')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                        isNext90DaysActive 
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                          : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      Next 90 Days
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CustomDatePicker 
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    startDate={startDate}
                    endDate={endDate}
                  />
                  <CustomDatePicker 
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>

              {/* Day Selection */}
              <div className="space-y-5">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2.5">
                  <ChevronRight size={14} className="text-indigo-500" />
                  Day Selection
                </label>
                <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 relative overflow-hidden">
                  {(['weekdays', 'weekends', 'custom'] as DayOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => setDayOption(option)}
                      className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                        dayOption === option 
                          ? 'text-white' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {dayOption === option && (
                        <motion.div 
                          layoutId="dayOptionBg"
                          className="absolute inset-0 bg-slate-900 rounded-xl -z-10 shadow-lg"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {dayOption === 'custom' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-wrap gap-2.5 pt-2"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => toggleCustomDay(day.value)}
                          className={`w-11 h-11 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center border-2 ${
                            customDays.includes(day.value)
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm'
                              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Curriculum Manager UI Component */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Database size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Curriculum Manager</h2>
                      <p className="text-xs text-slate-500">Edit sessions, phases, and map Course IDs</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-8">
                  {/* Phase-wise Course ID Mapping Grid */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Sparkles size={16} className="text-indigo-500" />
                      Phase-Wise Course ID Mapping
                    </h3>
                    {currentActiveBatches.length === 0 ? (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400">Add batches to see mapping options</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentActiveBatches.map(batch => (
                          <div key={batch} className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-600 flex items-center gap-2">
                              <Users size={14} />
                              {batch}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                              {blueprint.phases.map(phase => (
                                <div key={phase.id} className="space-y-1.5">
                                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">
                                    {phase.name} ID
                                  </label>
                                  <input 
                                    type="text"
                                    value={blueprint.batchPhaseIds[batch]?.[phase.id] || ''}
                                    onChange={(e) => updateBlueprintBatchId(batch, phase.id, e.target.value)}
                                    placeholder={`${phase.name} ID for ${batch}`}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all text-slate-700 placeholder:text-slate-300 shadow-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Editable Titles & Drag-and-Drop Grouping */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Layers size={16} className="text-indigo-500" />
                        Session Titles & Phase Grouping
                      </h3>
                      <button
                        onClick={addPhase}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-white transition-colors border border-indigo-200 hover:bg-indigo-600 px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        <Plus size={14} />
                        Add Phase
                      </button>
                    </div>
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={onDragEnd}
                    >
                      <SortableContext items={blueprint.phases.map(p => p.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {blueprint.phases.map(phase => (
                            <SortablePhase 
                              key={phase.id} 
                              phase={phase}
                              onRenameSession={renameSession}
                              onDeleteSession={deleteSession}
                              onAddSession={addSession}
                              onDeletePhase={deletePhase}
                              onRenamePhase={renamePhase}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              </div>

              {/* Time Slots Selection */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2.5">
                    <Clock size={14} className="text-indigo-500" />
                    Time Slots (IST)
                  </label>
                  <button 
                    onClick={addTimeSlot}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all shadow-md shadow-indigo-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <AnimatePresence initial={false}>
                    {timeSlots.map((slot, index) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative group"
                      >
                        <button
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border-2 flex items-center gap-3 ${
                            selectedSlotId === slot.id
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm'
                              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${selectedSlotId === slot.id ? 'bg-indigo-500 animate-pulse' : 'bg-slate-200'}`} />
                          Slot {index + 1}: {slot.category === 'live-sessions-aig' ? `Sat ${slot.startTime} / Sun ${slot.sundayStartTime || slot.startTime}` : slot.startTime}
                        </button>
                        {timeSlots.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTimeSlot(slot.id);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-20"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Slot Configuration Panel */}
              <AnimatePresence mode="wait">
                {selectedSlotId && timeSlots.find(s => s.id === selectedSlotId) && (
                  <motion.div
                    key={selectedSlotId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Zap size={16} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700">
                          Slot Configuration
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">
                        Active
                      </span>
                    </div>

                    {(() => {
                      const slot = timeSlots.find(s => s.id === selectedSlotId)!;
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {slot.category === 'live-sessions-aig' ? (
                            <>
                              <div className="col-span-2 space-y-3">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Saturday Time</span>
                                <div className="grid grid-cols-2 gap-4">
                                  <TimeInput12h 
                                    label="Start Time"
                                    value={slot.startTime}
                                    onChange={(val) => updateTimeSlot(slot.id, 'startTime', val)}
                                  />
                                  <TimeInput12h 
                                    label="End Time"
                                    value={slot.endTime}
                                    onChange={(val) => updateTimeSlot(slot.id, 'endTime', val)}
                                  />
                                </div>
                              </div>
                              <div className="col-span-2 space-y-3">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Sunday Time</span>
                                <div className="grid grid-cols-2 gap-4">
                                  <TimeInput12h 
                                    label="Start Time"
                                    value={slot.sundayStartTime || slot.startTime}
                                    onChange={(val) => updateTimeSlot(slot.id, 'sundayStartTime', val)}
                                  />
                                  <TimeInput12h 
                                    label="End Time"
                                    value={slot.sundayEndTime || slot.endTime}
                                    onChange={(val) => updateTimeSlot(slot.id, 'sundayEndTime', val)}
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="col-span-2 space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Mon/Wed/Fri &amp; Weekends</span>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <TimeInput12h 
                                      label="Start Time"
                                      value={slot.startTime}
                                      onChange={(val) => updateTimeSlot(slot.id, 'startTime', val)}
                                    />
                                    <TimeInput12h 
                                      label="End Time"
                                      value={slot.endTime}
                                      onChange={(val) => updateTimeSlot(slot.id, 'endTime', val)}
                                    />
                                  </div>
                                  <input 
                                    type="text" 
                                    value={slot.title}
                                    onChange={(e) => updateTimeSlot(slot.id, 'title', e.target.value)}
                                    placeholder="Mon/Wed/Fri Session Title..."
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all text-slate-700 placeholder:text-slate-300 shadow-sm"
                                  />
                                </div>
                              </div>
                              <div className="col-span-2 space-y-3 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                                <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wide">Tue/Thu Overrides</span>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <TimeInput12h 
                                      label="Tue/Thu Start Time"
                                      value={slot.tueThuStartTime || slot.startTime}
                                      onChange={(val) => updateTimeSlot(slot.id, 'tueThuStartTime', val)}
                                    />
                                    <TimeInput12h 
                                      label="Tue/Thu End Time"
                                      value={slot.tueThuEndTime || slot.endTime}
                                      onChange={(val) => updateTimeSlot(slot.id, 'tueThuEndTime', val)}
                                    />
                                  </div>
                                  <input 
                                    type="text" 
                                    value={slot.tueThuTitle || slot.title}
                                    onChange={(e) => updateTimeSlot(slot.id, 'tueThuTitle', e.target.value)}
                                    placeholder="Tue/Thu Session Title..."
                                    className="w-full bg-white border border-indigo-200/50 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all text-slate-700 placeholder:text-indigo-300 shadow-sm"
                                  />
                                </div>
                              </div>
                            </>
                           )}

                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Platform</span>
                            <div className="flex bg-white border border-slate-200 rounded-xl p-1 relative shadow-sm">
                              {(['ZOOM', 'MEET'] as const).map((p) => (
                                <button
                                  key={p}
                                  onClick={() => updateTimeSlot(slot.id, 'sessionPlatform', p)}
                                  className={`relative z-10 flex-1 py-2 text-[10px] font-bold rounded-lg transition-all duration-300 ${
                                    slot.sessionPlatform === p 
                                      ? 'text-white' 
                                      : 'text-slate-400 hover:text-slate-600'
                                  }`}
                                >
                                  {slot.sessionPlatform === p && (
                                    <motion.div 
                                      layoutId={`platformBg-${slot.id}`}
                                      className="absolute inset-0 bg-slate-900 rounded-lg -z-10 shadow-md"
                                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                  )}
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Category</span>
                            <div className="flex bg-white border border-slate-200 rounded-xl p-1 relative shadow-sm">
                              {(['qna-sessions-aig', 'live-sessions-aig'] as const).map((c) => (
                                <button
                                  key={c}
                                  onClick={() => updateTimeSlot(slot.id, 'category', c)}
                                  className={`relative z-10 flex-1 py-2 text-[9px] font-bold rounded-lg transition-all duration-300 ${
                                    slot.category === c 
                                      ? 'text-white' 
                                      : 'text-slate-400 hover:text-slate-600'
                                  }`}
                                >
                                  {slot.category === c && (
                                    <motion.div 
                                      layoutId={`categoryBg-${slot.id}`}
                                      className="absolute inset-0 bg-slate-900 rounded-lg -z-10 shadow-md"
                                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                  )}
                                  {c === 'qna-sessions-aig' ? 'Q&A' : 'LIVE'}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="col-span-2">
                            <AnimatePresence mode="wait">
                              {(slot.category === 'qna-sessions-aig' || dayOption === 'custom') ? (
                                <motion.div 
                                  key="single-link"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-1.5"
                                >
                                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                    <ExternalLink size={10} />
                                    Session Link *
                                  </span>
                                  <input 
                                    type="text" 
                                    value={slot.sessionLink}
                                    onChange={(e) => updateTimeSlot(slot.id, 'sessionLink', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all text-slate-700 placeholder:text-slate-300 shadow-sm"
                                  />
                                </motion.div>
                              ) : (
                                <motion.div 
                                  key="split-links"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="grid grid-cols-2 gap-4"
                                >
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                      <ExternalLink size={10} />
                                      Saturday Link *
                                    </span>
                                    <input 
                                      type="text" 
                                      value={slot.saturdayLink}
                                      onChange={(e) => updateTimeSlot(slot.id, 'saturdayLink', e.target.value)}
                                      placeholder="https://..."
                                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all text-slate-700 placeholder:text-slate-300 shadow-sm"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                      <ExternalLink size={10} />
                                      Sunday Link *
                                    </span>
                                    <input 
                                      type="text" 
                                      value={slot.sundayLink}
                                      onChange={(e) => updateTimeSlot(slot.id, 'sundayLink', e.target.value)}
                                      placeholder="https://..."
                                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all text-slate-700 placeholder:text-slate-300 shadow-sm"
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="col-span-2 space-y-4">
                            {/* General/MWF Instructors */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                  <Users size={10} />
                                  {slot.category === 'qna-sessions-aig' ? 'Mon/Wed/Fri Instructors *' : 'Instructors *'}
                                </span>
                                <button 
                                  onClick={() => addInstructor(slot.id)}
                                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                                >
                                  <Plus size={10} />
                                  Add Instructor
                                </button>
                              </div>
                              <div className="space-y-3">
                                {slot.instructors.map((inst, idx) => (
                                  <SearchableInput 
                                    key={`mwf-${idx}`}
                                    value={inst}
                                    onChange={(val) => updateInstructor(slot.id, idx, val)}
                                    recentOptions={recentInstructors}
                                    isMandatory={idx === 0}
                                    showRemove={idx > 0}
                                    onRemove={() => removeInstructor(slot.id, idx)}
                                    placeholder="Instructor ID"
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Q&A specific instructor fields */}
                            {slot.category === 'qna-sessions-aig' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                {/* Tuesday Instructors */}
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                      <Users size={10} />
                                      Tue Instructors *
                                    </span>
                                    <button 
                                      onClick={() => updateTimeSlot(slot.id, 'instructorsTue', [...(slot.instructorsTue || []), ''])}
                                      className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                                    >
                                      <Plus size={10} />
                                      Add
                                    </button>
                                  </div>
                                  <div className="space-y-3">
                                    {(slot.instructorsTue || ['']).map((inst, idx) => (
                                      <SearchableInput 
                                        key={`tue-${idx}`}
                                        value={inst}
                                        onChange={(val) => {
                                          const newArr = [...(slot.instructorsTue || [''])];
                                          newArr[idx] = val;
                                          updateTimeSlot(slot.id, 'instructorsTue', newArr);
                                        }}
                                        recentOptions={recentInstructors}
                                        isMandatory={idx === 0}
                                        showRemove={idx > 0}
                                        onRemove={() => {
                                          const newArr = (slot.instructorsTue || ['']).filter((_, i) => i !== idx);
                                          updateTimeSlot(slot.id, 'instructorsTue', newArr);
                                        }}
                                        placeholder="Tue Instructor ID"
                                      />
                                    ))}
                                  </div>
                                </div>
                                {/* Thursday Instructors */}
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                      <Users size={10} />
                                      Thu Instructors *
                                    </span>
                                    <button 
                                      onClick={() => updateTimeSlot(slot.id, 'instructorsThu', [...(slot.instructorsThu || []), ''])}
                                      className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                                    >
                                      <Plus size={10} />
                                      Add
                                    </button>
                                  </div>
                                  <div className="space-y-3">
                                    {(slot.instructorsThu || ['']).map((inst, idx) => (
                                      <SearchableInput 
                                        key={`thu-${idx}`}
                                        value={inst}
                                        onChange={(val) => {
                                          const newArr = [...(slot.instructorsThu || [''])];
                                          newArr[idx] = val;
                                          updateTimeSlot(slot.id, 'instructorsThu', newArr);
                                        }}
                                        recentOptions={recentInstructors}
                                        isMandatory={idx === 0}
                                        showRemove={idx > 0}
                                        onRemove={() => {
                                          const newArr = (slot.instructorsThu || ['']).filter((_, i) => i !== idx);
                                          updateTimeSlot(slot.id, 'instructorsThu', newArr);
                                        }}
                                        placeholder="Thu Instructor ID"
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="col-span-2 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                <Users size={10} />
                                Batch ID/Name *
                              </span>
                              <button 
                                onClick={() => addBatch(slot.id)}
                                className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                              >
                                <Plus size={10} />
                                Add Batch
                              </button>
                            </div>
                            <div className="space-y-3">
                              {slot.batch.map((b, idx) => (
                                <SearchableInput 
                                  key={idx}
                                  value={b}
                                  onChange={(val) => updateBatch(slot.id, idx, val)}
                                  recentOptions={recentBatches}
                                  isMandatory={idx === 0}
                                  showRemove={idx > 0}
                                  onRemove={() => removeBatch(slot.id, idx)}
                                  placeholder="Batch ID"
                                />
                              ))}
                            </div>
                          </div>

                          {slot.category === 'qna-sessions-aig' && (
                            <div className="col-span-2 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                  <Users size={10} />
                                  Course ID
                                </span>
                                <button 
                                  onClick={() => addCourse(slot.id)}
                                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                                >
                                  <Plus size={10} />
                                  Add Course
                                </button>
                              </div>
                              <div className="space-y-3">
                                {slot.course.map((c, idx) => (
                                  <SearchableInput 
                                    key={`course-${idx}`}
                                    value={c}
                                    onChange={(val) => updateCourse(slot.id, idx, val)}
                                    recentOptions={recentCourses}
                                    isMandatory={false}
                                    showRemove={idx > 0}
                                    onRemove={() => removeCourse(slot.id, idx)}
                                    placeholder="Course ID"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="col-span-2 space-y-1.5">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Course Group</span>
                            <input 
                              type="text" 
                              value={slot.courseGroup}
                              onChange={(e) => updateTimeSlot(slot.id, 'courseGroup', e.target.value)}
                              placeholder="Group Name..."
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all text-slate-700 placeholder:text-slate-300 shadow-sm"
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-slate-400 font-medium">
                    This will generate <span className={`font-bold ${sessionCount === 0 ? 'text-red-500' : 'text-slate-600'}`}>{sessionCount}</span> total sessions based on your current settings.
                  </p>
                </div>
                <button 
                  onClick={generateSchedule}
                  disabled={isGenerating}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-sm shadow-indigo-soft hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                    <span>Generate Schedule</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                {isGenerating && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                )}
              </button>

              <AnimatePresence>
                {showClearConfirm ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mt-4 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 text-rose-800">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Reset everything?</p>
                        <p className="text-[10px] text-rose-600/70 font-medium">All inputs and generated data will be lost.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={clearAll}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-[10px] font-bold transition-all shadow-sm active:scale-95"
                      >
                        Yes, Clear All
                      </button>
                      <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 bg-white border border-rose-200 text-rose-700 py-2.5 rounded-xl text-[10px] font-bold hover:bg-rose-100 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all text-xs font-bold group"
                  >
                    <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                    Clear All Inputs
                  </button>
                )}
              </AnimatePresence>
            </div>
            </section>
          </div>

          {/* Output Panel */}
          <div className="space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 h-full flex flex-col min-h-[600px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-900 font-display">Generated Schedule</h2>
                      {hasSavedData && !isGenerated && (
                        <button 
                          onClick={restoreLastSchedule}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Restore Last Generated"
                        >
                          <History size={18} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-slate-400">
                        {generatedSchedule.length} sessions found for the selected criteria.
                      </p>
                      {lastGeneratedTime && isGenerated && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <Clock3 size={10} />
                          {lastGeneratedTime}
                        </div>
                      )}
                    </div>
                  </div>
                {isGenerated && generatedSchedule.length > 0 && (
                  <div className="flex gap-3">
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center justify-center gap-2.5 bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-xs font-bold hover:bg-slate-200 hover:-translate-y-0.5 active:translate-y-0 transition-all border border-slate-200"
                    >
                      {isCopied ? (
                        <>
                          <Check size={16} className="text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Clipboard size={16} />
                          <span>Copy to Clipboard</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={downloadCSV}
                      className="flex items-center justify-center gap-2.5 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-indigo-100"
                    >
                      <Download size={16} />
                      <span>Download CSV</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden border border-slate-100 rounded-3xl bg-slate-50/50">
                {!isGenerated ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-soft flex items-center justify-center text-slate-200">
                      <Calendar size={40} />
                    </div>
                    <div className="space-y-2 max-w-xs">
                      <p className="text-lg font-bold text-slate-700">Ready to generate</p>
                      <p className="text-sm font-medium text-slate-400 leading-relaxed">Adjust your settings and click the generate button to see your schedule here.</p>
                    </div>
                  </div>
                ) : generatedSchedule.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                    <div className="w-24 h-24 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-400">
                      <AlertCircle size={40} />
                    </div>
                    <div className="space-y-2 max-w-xs">
                      <p className="text-lg font-bold text-slate-700 text-rose-600">No sessions found</p>
                      <p className="text-sm font-medium text-slate-400 leading-relaxed">Try expanding your date range or changing your day selection filters.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
                        <tr>
                          <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">#</th>
                          <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Title</th>
                          <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Course</th>
                          <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Batch</th>
                          <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Start Time (IST)</th>
                          <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">End Time (IST)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {generatedSchedule.map((item, index) => (
                          <tr key={index} className="hover:bg-white transition-colors group">
                            <td className="px-6 py-5 text-[11px] font-mono text-slate-300">{index + 1}</td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-700 truncate max-w-[140px]" title={item.title}>{item.title || '-'}</td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-500">{item.course}</td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-500">{item.batch}</td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-600 whitespace-nowrap">{item.startTime}</td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-600 whitespace-nowrap">{item.endTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-slate-400 uppercase font-bold tracking-[0.2em]">
          <div className="flex items-center gap-6">
            <span>© 2026 Scheduler SaaS</span>
            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
            <span>Asia/Kolkata Standard Time</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full">
            <CheckCircle2 size={14} />
            <span>All Systems Operational</span>
          </div>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
}

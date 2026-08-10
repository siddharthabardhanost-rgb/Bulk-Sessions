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
  FileSpreadsheet,
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
  Zap,
  Upload,
  Image as ImageIcon
, Link as LinkIcon} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
type DayOption = 'weekdays' | 'weekends' | 'custom';

type CustomDayConfig = {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  title: string;
  link?: string;
  category?: 'live-sessions-aig' | 'qna-sessions-aig' | 'qna-sessions-bsiai';
  instructors?: string[];
};

type QnaDayConfig = {
  type: 'normal' | 'open-mic';
  instructors: string[];
  startTime?: string;
  endTime?: string;
  title?: string;
};

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
  category: 'qna-sessions-aig' | 'live-sessions-aig' | 'qna-sessions-bsiai';
  instructors: string[];
  instructorsTue?: string[];
  instructorsThu?: string[];
  course: string[];
  courseLogic: 'sequential' | 'combined' | 'hybrid';
  batch: string[];
  courseGroup: string;
  customDayConfigs?: { [dayOfWeek: number]: CustomDayConfig };
  qnaDayConfigs?: { [dayOfWeek: number]: QnaDayConfig };
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
    <div className={`relative ${isOpen ? 'z-[100]' : ''}`} ref={containerRef}>
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
            className="w-full bg-white/[0.05] border border-brand-border rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500"
          />
          <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        {showRemove && (
          <button 
            onClick={onRemove}
            className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
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
            className="absolute z-50 w-full mt-2 bg-[#09090b] border border-brand-border rounded-xl shadow-2xl max-h-40 overflow-y-auto custom-scrollbar p-1"
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
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-white/[0.05] rounded-lg transition-colors flex items-center justify-between group"
                  >
                    {opt}
                    <ChevronRight size={10} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-all" />
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
import { parseCurriculumFromImage } from './lib/gemini';

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
    <div className={`space-y-1.5 relative ${isOpen ? 'z-[100]' : ''}`} ref={popoverRef}>
      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white/[0.05] border border-brand-border rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 hover:bg-white/5 hover:border-slate-300"
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
            className="absolute top-full left-0 mt-2 w-72 bg-[#09090b] border border-brand-border rounded-2xl shadow-2xl z-[100] p-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100">
                {format(viewDate, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-white/[0.1] rounded-lg text-slate-400 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-white/[0.1] rounded-lg text-slate-400 transition-colors"
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
                      ${!isCurrentMonth ? 'text-slate-500' : 'text-slate-500'}
                      ${isSelected ? 'bg-brand-accent-violet text-white font-bold shadow-md z-10' : 'hover:bg-white/[0.05]'}
                      ${isInRange && !isSelected ? 'bg-brand-accent-violet/10 text-indigo-700 font-medium' : ''}
                    `}
                  >
                    <span className="relative z-10">{format(date, 'd')}</span>
                    {isTodayDate && !isSelected && (
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-accent-violet rounded-full" />
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
      className="group flex items-center gap-3 bg-white/5 border border-brand-border rounded-xl p-2 hover:border-brand-accent-teal/40 transition-all shadow-sm"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-400 p-1">
        <Map size={14} />
      </div>
      <input
        type="text"
        value={session.title}
        onChange={(e) => onRename(phaseId, session.id, e.target.value)}
        className="flex-1 min-w-0 bg-transparent border-none text-xs font-semibold text-slate-200 focus:outline-none focus:ring-0 p-0 text-ellipsis"
        placeholder="Session Title..."
      />
      <button
        onClick={() => onDelete(phaseId, session.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-400 transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

const SortablePhase = ({ phase, onRenameSession, onDeleteSession, onAddSession, onDeletePhase, onRenamePhase, onUpdatePhase }: { 
  key?: string;
  phase: CurriculumPhase;
  onRenameSession: (phaseId: string, sessionId: string, newTitle: string) => void;
  onDeleteSession: (phaseId: string, sessionId: string) => void;
  onAddSession: (phaseId: string) => void;
  onDeletePhase: (phaseId: string) => void;
  onRenamePhase: (phaseId: string, newName: string) => void;
  onUpdatePhase: (phaseId: string, updates: Partial<CurriculumPhase>) => void;
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
      className={`bg-white/[0.03] border ${isDragging ? 'border-indigo-400 shadow-md ring-2 ring-brand-accent-violet/40' : 'border-brand-border'} rounded-2xl p-4 space-y-4`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button 
            {...attributes} 
            {...listeners}
            className="cursor-move p-1 -ml-1 text-slate-500 hover:text-brand-accent-violet hover:bg-white/[0.1] rounded transition-colors touch-none shrink-0"
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
            className="flex-1 min-w-[120px] bg-transparent border border-transparent hover:border-slate-300 focus:bg-white/5 focus:border-indigo-400 text-xs font-bold text-slate-200 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-accent-violet/40 px-2 py-1 rounded transition-all m-0"
            placeholder="Phase Name"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onAddSession(phase.id)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-brand-accent-teal hover:text-indigo-700 transition-colors bg-brand-accent-violet/10 px-2 py-1 rounded-lg"
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
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-slate-400 uppercase font-bold w-12 shrink-0">Day</label>
          <div className="flex flex-wrap gap-1 flex-1">
            {[{l:'S',v:0}, {l:'M',v:1}, {l:'T',v:2}, {l:'W',v:3}, {l:'T',v:4}, {l:'F',v:5}, {l:'S',v:6}].map(d => {
              const isActive = phase.daysOfWeek?.includes(d.v) || (phase.daysOfWeek === undefined && phase.dayOfWeek === d.v);
              return (
                <button
                  key={d.v}
                  onClick={() => {
                    let current = phase.daysOfWeek;
                    if (!current) {
                      current = (phase.dayOfWeek !== undefined && phase.dayOfWeek !== 'all') ? [phase.dayOfWeek] : [];
                    }
                    if (current.includes(d.v)) {
                      onUpdatePhase(phase.id, { daysOfWeek: current.filter(x => x !== d.v), dayOfWeek: 'all' });
                    } else {
                      onUpdatePhase(phase.id, { daysOfWeek: [...current, d.v], dayOfWeek: 'all' });
                    }
                  }}
                  className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition-colors ${isActive ? 'bg-brand-accent-violet text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  {d.l}
                </button>
              );
            })}
            {((!phase.daysOfWeek || phase.daysOfWeek.length === 0) && (phase.dayOfWeek === undefined || phase.dayOfWeek === 'all')) && <span className="text-[10px] text-slate-500 ml-1 leading-6 italic">Any</span>}
          </div>
        </div>
        {(() => {
          const activeDays = phase.daysOfWeek && phase.daysOfWeek.length > 0 
            ? phase.daysOfWeek 
            : (phase.dayOfWeek !== undefined && phase.dayOfWeek !== 'all' ? [phase.dayOfWeek] : []);
            
          if (activeDays.length > 0) {
            return (
              <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-white/10">
                {activeDays.sort().map(dayVal => {
                  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayVal];
                  const st = phase.dayTimes?.[dayVal]?.startTime || phase.startTime || '';
                  const et = phase.dayTimes?.[dayVal]?.endTime || phase.endTime || '';
                  
                  return (
                    <div key={dayVal} className="flex items-center gap-2">
                      <label className="text-[10px] text-brand-accent-teal uppercase font-bold w-12 shrink-0">{dayName}</label>
                      <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center gap-1 flex-1">
                        <div onPointerDown={(e) => e.stopPropagation()} className="w-full 2xl:w-auto 2xl:flex-1 min-w-0"><TimeInput12h value={st || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: val, endTime: et } } })} /></div>
                        <span className="hidden 2xl:block text-[10px] text-slate-500">-</span>
                        <div onPointerDown={(e) => e.stopPropagation()} className="w-full 2xl:w-auto 2xl:flex-1 min-w-0"><TimeInput12h value={et || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { dayTimes: { ...(phase.dayTimes || {}), [dayVal]: { startTime: st, endTime: val } } })} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          } else {
            return (
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold w-12 shrink-0">Time</label>
                <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center gap-1 flex-1">
                  <div onPointerDown={(e) => e.stopPropagation()} className="w-full 2xl:w-auto 2xl:flex-1 min-w-0"><TimeInput12h value={phase.startTime || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { startTime: val })} /></div>
                  <span className="hidden 2xl:block text-[10px] text-slate-500">-</span>
                  <div onPointerDown={(e) => e.stopPropagation()} className="w-full 2xl:w-auto 2xl:flex-1 min-w-0"><TimeInput12h value={phase.endTime || '00:00'} onChange={(val) => onUpdatePhase(phase.id, { endTime: val })} /></div>
                </div>
              </div>
            );
          }
        })()}
        
        {/* Phase Meta Data */}
        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-400 uppercase font-bold w-16 shrink-0">Instructor IDs</label>
            <input 
              type="text" 
              value={(phase.instructors || []).join(', ')}
              onChange={(e) => onUpdatePhase(phase.id, { instructors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="Instructor ID"
              className="flex-1 bg-white/5 border border-brand-border rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent-violet/50"
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>

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
            <div className="text-center py-4 border border-dashed border-brand-border rounded-xl">
              <p className="text-[10px] text-slate-400 font-medium italic">No sessions in this phase</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i+1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal.trim());
      lines.push(row);
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (row.length > 0 || currentVal !== '') {
    row.push(currentVal.trim());
    lines.push(row);
  }
  return lines.filter(r => r.length > 0 && r.some(cell => cell !== ''));
}

const TimeInput12h = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label?: string }) => {
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
      <div className={`${label ? 'space-y-1.5' : ''} ${isHourOpen || isMinuteOpen ? 'relative z-[100]' : ''}`}>
        {label && <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</span>}
        <div className="flex items-center justify-between bg-white/5 border border-brand-border rounded-xl px-2 py-1.5 shadow-sm  focus-within:ring-brand-accent-violet/20 focus-within:border-brand-accent-violet/50 transition-all">
          
          {/* Hour Selector */}
          <div className={`relative ${isHourOpen ? 'z-[100]' : ''}`} ref={hourRef}>
            <button 
              type="button"
              onClick={() => { setIsHourOpen(!isHourOpen); setIsMinuteOpen(false); }}
              className="text-xs font-semibold focus:outline-none cursor-pointer text-slate-200 hover:text-brand-accent-teal transition-colors min-w-[18px] text-center"
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
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 bg-[#09090b] border border-brand-border rounded-xl shadow-2xl z-[100] p-2 grid grid-cols-3 gap-1"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => { updateTime(h, m, period); setIsHourOpen(false); }}
                      className={`h-9 rounded-lg text-xs transition-all flex items-center justify-center ${
                        h12 === h 
                          ? 'bg-brand-accent-violet text-white font-bold shadow-md' 
                          : 'text-slate-400 hover:bg-brand-accent-teal/10 hover:text-brand-accent-teal'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="text-slate-500 font-bold">:</span>

          {/* Minute Selector */}
          <div className={`relative ${isMinuteOpen ? 'z-[100]' : ''}`} ref={minuteRef}>
            <button 
              type="button"
              onClick={() => { setIsMinuteOpen(!isMinuteOpen); setIsHourOpen(false); }}
              className="text-xs font-semibold focus:outline-none cursor-pointer text-slate-200 hover:text-brand-accent-teal transition-colors min-w-[18px] text-center"
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
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#09090b] border border-brand-border rounded-xl shadow-2xl z-[100] p-2 grid grid-cols-5 gap-1 max-h-[240px] overflow-y-auto custom-scrollbar"
                >
                  {Array.from({ length: 60 }, (_, i) => i).map(min => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => { updateTime(h12, min, period); setIsMinuteOpen(false); }}
                      className={`h-8 rounded-lg text-[10px] transition-all flex items-center justify-center ${
                        m === min 
                          ? 'bg-brand-accent-violet text-white font-bold shadow-md' 
                          : 'text-slate-400 hover:bg-brand-accent-teal/10 hover:text-brand-accent-teal'
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
            className="ml-1 px-2.5 py-1 bg-white/[0.1] rounded-lg text-[10px] font-bold text-slate-500 hover:bg-gradient-to-r from-brand-accent-violet to-brand-accent-teal border-none shadow-glow text-white hover:text-white transition-all uppercase tracking-tight"
          >
            {period}
          </button>
        </div>
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
      tueThuTitle: 'Open Mic Q&A Session',
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
  const [customLiveCategories, setCustomLiveCategories] = useState<{label: string, slug: string}[]>(() => {
    const saved = localStorage.getItem('custom_live_categories');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [blueprint, setBlueprint] = useState<CurriculumBlueprint>(DEFAULT_CURRICULUM_BLUEPRINT);
  const [isParsingImage, setIsParsingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [lastGeneratedTime, setLastGeneratedTime] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [scheduleCategoryFilter, setScheduleCategoryFilter] = useState<string>('all');
  const [includeLiveSessions, setIncludeLiveSessions] = useState<boolean>(true);
  const [includeQnaSessions, setIncludeQnaSessions] = useState<boolean>(false);

  const currentActiveBatches = Array.from(new Set([
    ...recentBatches,
    ...timeSlots.flatMap(s => s.batch.filter(b => b.trim() !== '')),
    ...(blueprint.globalBatches || []).filter(b => b.trim() !== '')
  ]));

  const DAYS_LIST = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' }
  ];

  const activeDaysList = (() => {
    if (dayOption === 'weekdays') {
      return DAYS_LIST.filter(d => d.value !== 6 && d.value !== 0);
    } else if (dayOption === 'weekends') {
      return DAYS_LIST.filter(d => d.value === 6 || d.value === 0);
    } else {
      return DAYS_LIST.filter(d => customDays.includes(d.value));
    }
  })();

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

  const handleAddCustomCategory = () => {
    if (newCatLabel.trim() && newCatSlug.trim()) {
      const updated = [...customLiveCategories, { label: newCatLabel.trim(), slug: newCatSlug.trim() }];
      setCustomLiveCategories(updated);
      localStorage.setItem('custom_live_categories', JSON.stringify(updated));
      setNewCatLabel('');
      setNewCatSlug('');
      setShowCategoryModal(false);
    }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(',')[1];
        
        try {
          const extractedPhases = await parseCurriculumFromImage(base64Content, file.type);
          
          if (extractedPhases && extractedPhases.length > 0) {
            const newBlueprint = {
              ...blueprint,
              phases: extractedPhases
            };
            setBlueprint(newBlueprint);
            localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
            alert('Curriculum updated successfully from the uploaded image!');
          } else {
            alert('Could not extract any phases from the image. Please try another one.');
          }
        } catch (error: any) {
          console.error(error);
          alert('Error parsing image: ' + error.message);
        } finally {
          setIsParsingImage(false);
          // reset the input
          e.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      setIsParsingImage(false);
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const text = reader.result as string;
        try {
          const rows = parseCSV(text);
          const phases: CurriculumPhase[] = [];
          let currentPhase: CurriculumPhase | null = null;
          let sessionCounter = 1;

          rows.forEach(row => {
            const colA = row[0] || '';
            const colB = row[1] || '';
            
            // Heuristic for Phase rows
            const isPhaseRow = colA.toLowerCase().includes('phase') || (colB.trim() !== '' && colA.trim() !== '');
            
            if (isPhaseRow) {
              const phaseId = colB.trim() || `p_${Date.now()}_${phases.length + 1}`;
              const phaseName = colA.trim();
              
              currentPhase = {
                id: phaseId,
                name: phaseName,
                sessions: [],
                courseId: colB.trim() || undefined
              };
              phases.push(currentPhase);
            } else if (colA.trim() !== '') {
              if (!currentPhase) {
                currentPhase = {
                  id: `p_default_${Date.now()}`,
                  name: 'Default Phase',
                  sessions: [],
                  courseId: undefined
                };
                phases.push(currentPhase);
              }
              currentPhase.sessions.push({
                id: `s_${sessionCounter++}`,
                title: colA.trim()
              });
            }
          });

          if (phases.length > 0) {
            // Auto capture phase IDs for phase-wise course id mapping
            const batchPhaseIds = { ...blueprint.batchPhaseIds };
            
            // Pre-populate mapping for all current active batches using the phase IDs
            currentActiveBatches.forEach(batch => {
              if (!batchPhaseIds[batch]) {
                batchPhaseIds[batch] = {};
              }
              phases.forEach(p => {
                batchPhaseIds[batch][p.id] = p.courseId || p.id;
              });
            });

            const newBlueprint = {
              phases,
              batchPhaseIds
            };
            setBlueprint(newBlueprint);
            localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
            alert('Curriculum updated successfully from the CSV file! Phase IDs mapped automatically.');
          } else {
            alert('Could not parse any phases from the CSV. Please ensure columns are formatted correctly.');
          }
        } catch (error: any) {
          console.error(error);
          alert('Error parsing CSV file: ' + error.message);
        } finally {
          e.target.value = '';
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      console.error(err);
      alert('Error reading file: ' + err.message);
    }
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

  const updatePhase = (phaseId: string, updates: Partial<CurriculumPhase>) => {
    const newBlueprint = {
      ...blueprint,
      phases: blueprint.phases.map(p => 
        p.id === phaseId ? { ...p, ...updates } : p
      )
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
        tueThuTitle: 'Open Mic Q&A Session',
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
    let count = 0;
    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());

    if (!isValid(start) || !isValid(end) || start > end) return 0;

    const allDays = eachDayOfInterval({ start, end });
    const filteredDays = allDays.filter(date => {
      if (dayOption === 'weekdays') return !isWeekend(date);
      if (dayOption === 'weekends') return isWeekend(date);
      return customDays.includes(getDay(date));
    });

    if (includeQnaSessions) {
      count += filteredDays.length * timeSlots.length;
    }
    if (includeLiveSessions) {
      const curriculumManagerList = blueprint.phases.flatMap(p => 
        p.sessions.map(s => ({ name: s.title, phaseId: p.id, phase: p }))
      );
      count += curriculumManagerList.length;
    }

    return count;
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
      tueThuTitle: 'Open Mic Q&A Session',
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

  const getCustomDayConfig = (slot: TimeSlot, dayValue: number) => {
    const config = slot.customDayConfigs?.[dayValue];
    return {
      startTime: config?.startTime || slot.startTime,
      endTime: config?.endTime || slot.endTime,
      title: config !== undefined ? config.title : slot.title,
      link: config?.link || '',
      category: config?.category || 'qna-sessions-aig',
      instructors: config?.instructors !== undefined ? config.instructors : slot.instructors
    };
  };

  const updateCustomDayConfig = (
    slotId: string, 
    dayValue: number, 
    key: 'startTime' | 'endTime' | 'title' | 'link' | 'category' | 'instructors', 
    value: any
  ) => {
    setTimeSlots(timeSlots.map(slot => {
      if (slot.id === slotId) {
        const currentConfigs = slot.customDayConfigs || {};
        const currentDayConfig = currentConfigs[dayValue] || {
          startTime: slot.startTime,
          endTime: slot.endTime,
          title: slot.title,
          link: '',
          category: 'qna-sessions-aig',
          instructors: slot.instructors
        };
        return {
          ...slot,
          customDayConfigs: {
            ...currentConfigs,
            [dayValue]: {
              ...currentDayConfig,
              [key]: value
            }
          }
        };
      }
      return slot;
    }));
  };

  const getQnaDayConfig = (slot: TimeSlot, dayValue: number): QnaDayConfig => {
    const config = slot.qnaDayConfigs?.[dayValue];
    if (config) {
      return config;
    }
    const isDefaultOpenMic = dayValue === 2 || dayValue === 4;
    return {
      type: isDefaultOpenMic ? 'open-mic' : 'normal',
      instructors: isDefaultOpenMic 
        ? (dayValue === 2 ? (slot.instructorsTue || ['']) : (slot.instructorsThu || ['']))
        : slot.instructors,
      startTime: isDefaultOpenMic ? (slot.tueThuStartTime || slot.startTime) : slot.startTime,
      endTime: isDefaultOpenMic ? (slot.tueThuEndTime || slot.endTime) : slot.endTime,
      title: isDefaultOpenMic ? (slot.tueThuTitle || 'Open Mic Q&A Session') : slot.title
    };
  };

  const updateQnaDayConfig = (
    slotId: string,
    dayValue: number,
    key: keyof QnaDayConfig,
    value: any
  ) => {
    setTimeSlots(timeSlots.map(slot => {
      if (slot.id === slotId) {
        const currentConfigs = slot.qnaDayConfigs || {};
        const currentDayConfig = getQnaDayConfig(slot, dayValue);
        return {
          ...slot,
          qnaDayConfigs: {
            ...currentConfigs,
            [dayValue]: {
              ...currentDayConfig,
              [key]: value
            }
          }
        };
      }
      return slot;
    }));
  };

  const addQnaInstructor = (slotId: string, dayValue: number) => {
    setTimeSlots(timeSlots.map(slot => {
      if (slot.id === slotId) {
        const currentConfigs = slot.qnaDayConfigs || {};
        const qnaConfig = getQnaDayConfig(slot, dayValue);
        return {
          ...slot,
          qnaDayConfigs: {
            ...currentConfigs,
            [dayValue]: {
              ...qnaConfig,
              instructors: [...(qnaConfig.instructors || []), '']
            }
          }
        };
      }
      return slot;
    }));
  };

  const updateQnaInstructor = (slotId: string, dayValue: number, idx: number, value: string) => {
    setTimeSlots(timeSlots.map(slot => {
      if (slot.id === slotId) {
        const currentConfigs = slot.qnaDayConfigs || {};
        const qnaConfig = getQnaDayConfig(slot, dayValue);
        const newArr = [...(qnaConfig.instructors || [''])];
        newArr[idx] = value;
        return {
          ...slot,
          qnaDayConfigs: {
            ...currentConfigs,
            [dayValue]: {
              ...qnaConfig,
              instructors: newArr
            }
          }
        };
      }
      return slot;
    }));
  };

  const removeQnaInstructor = (slotId: string, dayValue: number, idx: number) => {
    setTimeSlots(timeSlots.map(slot => {
      if (slot.id === slotId) {
        const currentConfigs = slot.qnaDayConfigs || {};
        const qnaConfig = getQnaDayConfig(slot, dayValue);
        const newArr = (qnaConfig.instructors || ['']).filter((_, i) => i !== idx);
        return {
          ...slot,
          qnaDayConfigs: {
            ...currentConfigs,
            [dayValue]: {
              ...qnaConfig,
              instructors: newArr
            }
          }
        };
      }
      return slot;
    }));
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

  const generateSchedule = async () => {
    setIsGenerating(true);
    
    // Slight artificial delay for UX
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Save used instructors, batches and courses to memory
    const allUsedInstructors = timeSlots.flatMap(s => s.instructors);
    saveToRecentInstructors(allUsedInstructors);
    
    const allUsedBatches = [...timeSlots.flatMap(s => s.batch), ...(blueprint.globalBatches || [])];
    saveToRecentBatches(allUsedBatches);

    const allUsedCourses = timeSlots.flatMap(s => s.course);
    saveToRecentCourses(allUsedCourses);

    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());
    if (!isValid(start) || !isValid(end) || start > end) {
      alert('Invalid date range.');
      setIsGenerating(false);
      return;
    }
    const allDays = eachDayOfInterval({ start, end });
    const filteredDays = allDays.filter(date => {
      if (dayOption === 'weekdays') return !isWeekend(date);
      if (dayOption === 'weekends') return isWeekend(date);
      return customDays.includes(getDay(date));
    });

    const schedule: GeneratedRow[] = [];
    console.log("Generating schedule...", { allDays: allDays.length, filteredDays: filteredDays.length, timeSlots: timeSlots.length, phases: blueprint.phases.length, includeQnaSessions, includeLiveSessions });
    
    // 1. Generate Q&A Sessions from timeSlots (if enabled)
    if (includeQnaSessions) {
      const totalSessions = filteredDays.length * timeSlots.length;
      let sessionIndex = 0;
      
      filteredDays.forEach(date => {
        const dayOfWeek = getDay(date); // 0 = Sunday, 6 = Saturday
        
        timeSlots.forEach(slot => {
          // Skip live sessions from timeSlots since they are now generated from curriculum
          if (slot.category === 'live-sessions-aig' || customLiveCategories.some(c => c.slug === slot.category)) {
            return;
          }
          
          let currentStartTime = slot.startTime;
          let currentEndTime = slot.endTime;
          let finalTitle = slot.title;
          let finalCategory = slot.category;
          
          if (dayOption === 'custom') {
            const customConfig = slot.customDayConfigs?.[dayOfWeek];
            if (customConfig) {
              currentStartTime = customConfig.startTime || slot.startTime;
              currentEndTime = customConfig.endTime || slot.endTime;
              if (customConfig.title !== undefined && customConfig.title.trim() !== '') {
                finalTitle = customConfig.title;
              }
              if (customConfig.category) {
                finalCategory = customConfig.category;
              }
            }
          } else if (slot.category.startsWith('qna-sessions')) {
            const qnaConfig = getQnaDayConfig(slot, dayOfWeek);
            currentStartTime = qnaConfig.startTime || slot.startTime;
            currentEndTime = qnaConfig.endTime || slot.endTime;
            finalTitle = qnaConfig.title || (qnaConfig.type === 'open-mic' ? 'Open Mic Q&A Session' : slot.title);
          }

          const [startH, startM] = currentStartTime.split(':').map(Number);
          const [endH, endM] = currentEndTime.split(':').map(Number);
          const startDateTime = set(date, { hours: startH, minutes: startM, seconds: 0 });
          let endDateTime = set(date, { hours: endH, minutes: endM, seconds: 0 });

          if (endDateTime <= startDateTime) {
            endDateTime = addDays(endDateTime, 1);
          }

          let startStr = formatInTimeZone(startDateTime, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';
          let endStr = formatInTimeZone(endDateTime, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';

          let sessionLink = '';
          if (dayOption === 'custom') {
            const customConfig = slot.customDayConfigs?.[dayOfWeek];
            sessionLink = (customConfig && customConfig.link) ? customConfig.link : slot.sessionLink;
          } else {
            sessionLink = slot.sessionLink;
          }

          let courseValue = '';
          const activeCourses = slot.course.filter(c => c.trim() !== '');
          if (slot.courseLogic === 'combined') {
            courseValue = activeCourses.join(', ');
          } else if (slot.courseLogic === 'sequential') {
            if (activeCourses.length > 0) {
              const courseIdx = Math.floor((sessionIndex / totalSessions) * activeCourses.length);
              courseValue = activeCourses[Math.min(courseIdx, activeCourses.length - 1)];
            }
          }

          let currentInstructors = slot.instructors;
          if (dayOption === 'custom') {
            const customConfig = slot.customDayConfigs?.[dayOfWeek];
            if (customConfig && customConfig.instructors && customConfig.instructors.length > 0 && customConfig.instructors[0].trim() !== '') {
              currentInstructors = customConfig.instructors;
            }
          } else if (finalCategory.startsWith('qna-sessions')) {
            const qnaConfig = getQnaDayConfig(slot, dayOfWeek);
            if (qnaConfig && qnaConfig.instructors && qnaConfig.instructors.length > 0 && qnaConfig.instructors[0].trim() !== '') {
              currentInstructors = qnaConfig.instructors;
            }
          }

          schedule.push({ 
            title: finalTitle,
            description: slot.description,
            sessionLink: sessionLink,
            sessionPlatform: slot.sessionPlatform,
            category: finalCategory,
            startTime: startStr,
            endTime: endStr,
            instructors: currentInstructors.filter(i => i.trim() !== '').join(', '),
            course: courseValue,
            batch: slot.batch.filter(b => b.trim() !== '').join(', '),
            courseGroup: slot.courseGroup,
            _rawDate: startDateTime
          } as any);
          sessionIndex++;
        });
      });
    }

    // 2. Generate Live Sessions from Curriculum (if enabled)
    if (includeLiveSessions) {
      const curriculumManagerList = blueprint.phases.flatMap(p => 
        p.sessions.map(s => ({ name: s.title, phaseId: p.id, phase: p }))
      );

      let liveDayIndex = 0;
      
      for (const item of curriculumManagerList) {
        let foundDay = false;
        const phase = item.phase;
        
        let attempts = 0;
        while (attempts < 365) {
          attempts++;
          if (liveDayIndex >= allDays.length) {
            const lastDay = allDays[allDays.length - 1];
            allDays.push(addDays(lastDay, 1));
          }
          const date = allDays[liveDayIndex];
          const dayOfWeek = getDay(date);
          
          const requiresSpecificDays = phase.daysOfWeek && phase.daysOfWeek.length > 0;
          const requiresLegacyDay = phase.dayOfWeek !== undefined && phase.dayOfWeek !== 'all';
          
          let isValidDay = true;
          if (requiresSpecificDays && !phase.daysOfWeek!.includes(dayOfWeek)) {
            isValidDay = false;
          } else if (!requiresSpecificDays && requiresLegacyDay && phase.dayOfWeek !== dayOfWeek) {
            isValidDay = false;
          }
          
          if (isValidDay) {
            foundDay = true;
            
            let currentStartTime = phase.dayTimes?.[dayOfWeek]?.startTime || phase.startTime || '10:00';
            let currentEndTime = phase.dayTimes?.[dayOfWeek]?.endTime || phase.endTime || '12:00';
            
            const [startH, startM] = currentStartTime.split(':').map(Number);
            const [endH, endM] = currentEndTime.split(':').map(Number);
            
            const startDateTime = set(date, { hours: startH, minutes: startM, seconds: 0 });
            let endDateTime = set(date, { hours: endH, minutes: endM, seconds: 0 });
            
            if (endDateTime <= startDateTime) endDateTime = addDays(endDateTime, 1);
            
            const startStr = formatInTimeZone(startDateTime, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';
            const endStr = formatInTimeZone(endDateTime, IST_TIMEZONE, 'd MMMM yyyy hh:mm a') + ' IST';
            
            const activeBatches = blueprint.globalBatches || [];
            let courseValue = '';
            if (activeBatches.length > 0) {
              const ids = activeBatches.map(batch => {
                const batchIds = blueprint.batchPhaseIds?.[batch];
                return batchIds?.[phase.id] || phase.courseId || phase.id || "N/A";
              });
              courseValue = ids.join(', ');
            } else {
              courseValue = phase.courseId || phase.name || '';
            }
            
            schedule.push({
              title: item.name,
              description: phase.name || '',
              sessionLink: dayOfWeek === 6 ? (blueprint.globalSaturdayLink || '') : dayOfWeek === 0 ? (blueprint.globalSundayLink || '') : '',
              sessionPlatform: 'ZOOM',
              category: 'live-sessions-aig',
              startTime: startStr,
              endTime: endStr,
              instructors: (phase.instructors || []).join(', '),
              course: courseValue,
              batch: activeBatches.join(', '),
              courseGroup: phase.name || '',
              _rawDate: startDateTime
            } as any);
            
            liveDayIndex++; // Consume one slot for this live session
            break;
          } else {
            liveDayIndex++;
          }
        }
        if (!foundDay) break;
      }
    }

    // Sort combined schedule by date and time
    schedule.sort((a: any, b: any) => a._rawDate.getTime() - b._rawDate.getTime());
    
    // Remove temporary sorting field
    const finalSchedule = schedule.map((s: any) => {
      const copy = { ...s };
      delete copy._rawDate;
      return copy as GeneratedRow;
    });

    console.log("Final schedule generated:", finalSchedule.length);
    setGeneratedSchedule(finalSchedule);
    setIsGenerated(true);
    setIsGenerating(false);

    const savedData: SavedSchedule = {
      data: finalSchedule,
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
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      `"${(item.sessionLink || '').replace(/"/g, '""')}"`,
      `"${(item.sessionPlatform || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${item.startTime || ''}"`,
      `"${item.endTime || ''}"`,
      `"${(item.instructors || '').replace(/"/g, '""')}"`,
      `"${(item.course || '').replace(/"/g, '""')}"`,
      `"${(item.batch || '').replace(/"/g, '""')}"`,
      `"${(item.courseGroup || '').replace(/"/g, '""')}"`
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
    <div className="min-h-screen bg-brand-bg relative overflow-hidden text-white font-sans selection:bg-brand-accent-teal/30 selection:text-brand-accent-teal">
      {/* Decorative Holographic Lines Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex items-center justify-center mix-blend-screen h-[50vh]">
        <svg width="100%" height="100%" viewBox="0 0 1000 500" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,250 Q100,100 200,250 T400,250 T600,250 T800,250 T1000,250" stroke="url(#gradient)" strokeWidth="2" fill="transparent" />
          <path d="M0,200 Q200,400 300,200 T500,200 T700,200 T900,200 T1000,200" stroke="url(#gradient)" strokeWidth="1" fill="transparent" />
          <path d="M0,300 Q150,50 250,300 T450,300 T650,300 T850,300 T1000,300" stroke="url(#gradient)" strokeWidth="1.5" fill="transparent" />
          <circle cx="200" cy="250" r="4" fill="#8b5cf6" filter="url(#glow)" />
          <circle cx="400" cy="250" r="3" fill="#06b6d4" filter="url(#glow)" />
          <circle cx="600" cy="250" r="5" fill="#8b5cf6" filter="url(#glow)" />
          <circle cx="800" cy="250" r="2" fill="#06b6d4" filter="url(#glow)" />
          <circle cx="300" cy="200" r="4" fill="#06b6d4" filter="url(#glow)" />
          <circle cx="700" cy="200" r="4" fill="#8b5cf6" filter="url(#glow)" />
          <circle cx="250" cy="300" r="3" fill="#8b5cf6" filter="url(#glow)" />
          <circle cx="650" cy="300" r="3" fill="#06b6d4" filter="url(#glow)" />
          
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2"/>
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
      <div className="max-w-[1800px] mx-auto px-6 py-8 md:py-12 space-y-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 glass-card p-8 border border-white/10">
            <div className="space-y-2 text-center md:text-left">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-brand-accent-violet/10 text-brand-accent-teal rounded-full text-[10px] font-bold uppercase tracking-widest"
              >
                <Sparkles size={12} />
                <span>Professional Scheduler</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-extrabold tracking-tight text-white font-display"
              >
                Session <span className="text-brand-accent-teal">Scheduler</span>
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
              <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <CheckCircle2 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">All Systems Operational</span>
              </div>
              <div className="px-4 py-2 bg-white/[0.05] text-slate-400 rounded-2xl border border-brand-border">
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
              className="p-5 bg-brand-accent-violet/10 border border-indigo-100 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-accent-teal shadow-sm">
                  <History size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-900">You have a previously generated schedule available.</p>
                  <p className="text-xs text-brand-accent-teal/70 font-medium">Last generated: {lastGeneratedTime}</p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={restoreLastSchedule}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-brand-accent-violet to-brand-accent-teal border-none shadow-glow text-white hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                  Restore Last Generated
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('saved_schedule_data');
                    setHasSavedData(false);
                  }}
                  className="flex-1 sm:flex-none bg-white/5 border border-brand-accent-teal/40 text-brand-accent-teal px-6 py-3 rounded-2xl text-xs font-bold hover:bg-indigo-100 transition-all active:scale-95"
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
            <section className="glass-card p-8 border border-white/10 space-y-8">
              {/* Date Range */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2.5">
                    <Calendar size={14} className="text-brand-accent-violet" />
                    Date Range
                  </label>
                  
                  {/* Quick Select Chips */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleQuickSelect('this-month')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                        isThisMonthActive 
                          ? 'bg-brand-accent-violet/10 text-brand-accent-teal border-brand-accent-teal/40' 
                          : 'bg-white/[0.05] text-slate-400 border-transparent hover:bg-white/[0.1]'
                      }`}
                    >
                      This Month
                    </button>
                    <button 
                      onClick={() => handleQuickSelect('next-month')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                        isNextMonthActive 
                          ? 'bg-brand-accent-violet/10 text-brand-accent-teal border-brand-accent-teal/40' 
                          : 'bg-white/[0.05] text-slate-400 border-transparent hover:bg-white/[0.1]'
                      }`}
                    >
                      Next Month
                    </button>
                    <button 
                      onClick={() => handleQuickSelect('next-90-days')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                        isNext90DaysActive 
                          ? 'bg-brand-accent-violet/10 text-brand-accent-teal border-brand-accent-teal/40' 
                          : 'bg-white/[0.05] text-slate-400 border-transparent hover:bg-white/[0.1]'
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
                  <ChevronRight size={14} className="text-brand-accent-violet" />
                  Day Selection
                </label>
                <div className="flex bg-white/[0.05] p-1 rounded-2xl border border-brand-border relative overflow-hidden">
                  {(['weekdays', 'weekends', 'custom'] as DayOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => setDayOption(option)}
                      className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                        dayOption === option 
                          ? 'text-white' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {dayOption === option && (
                        <motion.div 
                          layoutId="dayOptionBg"
                          className="absolute inset-0 bg-brand-accent-violet text-white rounded-xl -z-10 shadow-lg"
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
                              ? 'bg-brand-accent-violet/10 border-indigo-500 text-brand-accent-teal shadow-sm'
                              : 'bg-white/5 border-brand-border text-slate-400 hover:border-brand-border'
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
              <div className="bg-white/5 rounded-3xl shadow-sm border border-brand-border overflow-hidden mb-8">
                <div className="p-6 border-b border-brand-border flex items-center justify-between bg-white/[0.03] flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-accent-violet/10 flex items-center justify-center text-brand-accent-teal">
                      <Database size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Curriculum Manager</h2>
                      <p className="text-xs text-slate-400">Edit sessions, phases, and map Course IDs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className={`flex items-center gap-2 px-4 py-2 ${isParsingImage ? 'bg-brand-accent-violet/50 cursor-not-allowed' : 'bg-brand-accent-violet hover:bg-brand-accent-violet/80 cursor-pointer'} text-white rounded-xl text-xs font-bold transition-colors`}>
                      {isParsingImage ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ImageIcon size={14} />
                      )}
                      <span>{isParsingImage ? 'Parsing Curriculum...' : 'Upload Image'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={isParsingImage}
                      />
                    </label>

                    <label className="flex items-center gap-2 px-4 py-2 bg-brand-accent-teal hover:bg-brand-accent-teal/80 cursor-pointer text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                      <FileSpreadsheet size={14} />
                      <span>Upload CSV</span>
                      <input 
                        type="file" 
                        accept=".csv" 
                        className="hidden" 
                        onChange={handleCSVUpload}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="p-6 space-y-8">
                  {/* Phase-wise Course ID Mapping Grid */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Sparkles size={16} className="text-brand-accent-violet" />
                      Phase-Wise Course ID Mapping
                    </h3>
                    {currentActiveBatches.length === 0 ? (
                      <div className="text-center py-6 bg-white/[0.05] rounded-2xl border border-dashed border-brand-border">
                        <p className="text-xs text-slate-400">Add batches to see mapping options</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentActiveBatches.map(batch => (
                          <div key={batch} className="space-y-3 bg-white/[0.03] p-4 rounded-2xl border border-brand-border">
                            <h4 className="text-xs font-bold text-slate-500 flex items-center gap-2">
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
                                    value={blueprint.batchPhaseIds[batch]?.[phase.id] || phase.courseId || ''}
                                    onChange={(e) => updateBlueprintBatchId(batch, phase.id, e.target.value)}
                                    placeholder={`${phase.name} ID for ${batch}`}
                                    className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
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
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <Layers size={16} className="text-brand-accent-violet" />
                        Session Titles & Phase Grouping
                      </h3>
                      <button
                        onClick={addPhase}
                        className="flex items-center gap-1.5 text-xs font-bold text-brand-accent-teal hover:text-white transition-colors border border-brand-accent-teal/40 hover:bg-gradient-to-r from-brand-accent-violet to-brand-accent-teal border-none shadow-glow text-white px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        <Plus size={14} />
                        Add Phase
                      </button>
                    </div>
                    
                    {/* Global Phase Details (Batches & Links) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white/[0.02] p-4 rounded-2xl border border-brand-border">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                          <Users size={12} className="text-brand-accent-violet" />
                          Global Batch IDs (For Live Sessions)
                        </label>
                        <input 
                          type="text" 
                          value={(blueprint.globalBatches || []).join(', ')}
                          onChange={(e) => setBlueprint(prev => ({ ...prev, globalBatches: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                          placeholder="e.g. batch_id_1, batch_id_2"
                          className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                          <LinkIcon size={12} className="text-brand-accent-teal" />
                          Saturday Session Link
                        </label>
                        <input 
                          type="text" 
                          value={blueprint.globalSaturdayLink || ''}
                          onChange={(e) => setBlueprint(prev => ({ ...prev, globalSaturdayLink: e.target.value }))}
                          placeholder="https://zoom.us/..."
                          className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-teal/20 focus:border-brand-accent-teal/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                          <LinkIcon size={12} className="text-brand-accent-teal" />
                          Sunday Session Link
                        </label>
                        <input 
                          type="text" 
                          value={blueprint.globalSundayLink || ''}
                          onChange={(e) => setBlueprint(prev => ({ ...prev, globalSundayLink: e.target.value }))}
                          placeholder="https://zoom.us/..."
                          className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-teal/20 focus:border-brand-accent-teal/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                        />
                      </div>
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
                              onUpdatePhase={updatePhase}
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
                    <Clock size={14} className="text-brand-accent-violet" />
                    Time Slots (IST)
                  </label>
                  <button 
                    onClick={addTimeSlot}
                    className="p-2 bg-gradient-to-r from-brand-accent-violet to-brand-accent-teal border-none shadow-glow text-white rounded-xl hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all shadow-md shadow-indigo-200"
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
                              ? 'bg-brand-accent-violet/10 border-indigo-500 text-brand-accent-teal shadow-sm'
                              : 'bg-white/5 border-brand-border text-slate-400 hover:border-brand-border'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${selectedSlotId === slot.id ? 'bg-brand-accent-violet animate-pulse' : 'bg-white/20'}`} />
                          Slot {index + 1}: {slot.startTime}
                        </button>
                        {timeSlots.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTimeSlot(slot.id);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white/5 border border-brand-border text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-20"
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
                    className="bg-white/[0.03] rounded-3xl p-6 border border-brand-border space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-brand-border pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-brand-accent-teal">
                          <Zap size={16} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-200">
                          Slot Configuration
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-brand-border">
                        Active
                      </span>
                    </div>

                    {(() => {
                      const slot = timeSlots.find(s => s.id === selectedSlotId)!;
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {dayOption === 'custom' ? (
                            <>
                              {customDays.length === 0 ? (
                                <div className="col-span-2 text-center py-6 px-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl text-xs font-semibold">
                                  Please select at least one day in the "Day Selection" panel above to customize timing.
                                </div>
                              ) : (
                                DAYS_OF_WEEK.filter(d => customDays.includes(d.value)).map((day) => {
                                  const dayConfig = getCustomDayConfig(slot, day.value);
                                  return (
                                    <div key={day.value} className="col-span-2 space-y-3 p-4 bg-white/[0.03] rounded-2xl border border-brand-border/40">
                                      <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                                        <span className="text-[11px] text-brand-accent-teal uppercase font-bold tracking-wider flex items-center gap-1.5">
                                          <Calendar size={12} className="text-brand-accent-violet" />
                                          {day.label} Custom Settings
                                        </span>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                          Active
                                        </span>
                                      </div>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <TimeInput12h 
                                            label="Start Time"
                                            value={dayConfig.startTime}
                                            onChange={(val) => updateCustomDayConfig(slot.id, day.value, 'startTime', val)}
                                          />
                                          <TimeInput12h 
                                            label="End Time"
                                            value={dayConfig.endTime}
                                            onChange={(val) => updateCustomDayConfig(slot.id, day.value, 'endTime', val)}
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Session Name / Title</span>
                                          <input 
                                            type="text" 
                                            value={dayConfig.title}
                                            onChange={(e) => updateCustomDayConfig(slot.id, day.value, 'title', e.target.value)}
                                            placeholder={`Enter session name for ${day.label}...`}
                                            className="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                                          />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-1.5">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Category</span>
                                            <div className="flex bg-white/5 border border-brand-border rounded-xl p-1 relative shadow-sm">
                                              {(['qna-sessions-aig', 'qna-sessions-bsiai'] as string[]).map((c) => (
                                                <button
                                                  key={c}
                                                  type="button"
                                                  onClick={() => updateCustomDayConfig(slot.id, day.value, 'category', c)}
                                                  className={`relative z-10 flex-1 py-1.5 text-[9px] font-bold rounded-lg transition-all duration-300 ${
                                                    dayConfig.category === c 
                                                      ? 'text-white bg-brand-accent-violet animate-pulse-subtle' 
                                                      : 'text-slate-400 hover:text-slate-200'
                                                  }`}
                                                >
                                                  {c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c}
                                                </button>
                                              ))}
                                              <button type="button" onClick={() => setShowCategoryModal(true)} className="relative z-10 px-2 py-1.5 text-[9px] font-bold rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center bg-white/5 ml-1">+ Add</button>
                                            </div>
                                          </div>
                                          <div className="space-y-1.5">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1">
                                              <ExternalLink size={10} />
                                              {day.label} Link *
                                            </span>
                                            <input 
                                              type="text" 
                                              value={dayConfig.link || ''}
                                              onChange={(e) => updateCustomDayConfig(slot.id, day.value, 'link', e.target.value)}
                                              placeholder="https://..."
                                              className="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                                            />
                                          </div>
                                        </div>

                                        {/* Custom day Instructors */}
                                        <div className="space-y-3 pt-3 border-t border-white/[0.05]">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                              <Users size={10} />
                                              {day.label} Instructor IDs *
                                            </span>
                                            <button 
                                              type="button"
                                              onClick={() => updateCustomDayConfig(slot.id, day.value, 'instructors', [...(dayConfig.instructors || []), ''])}
                                              className="flex items-center gap-1 text-[10px] font-bold text-brand-accent-violet hover:text-brand-accent-teal transition-colors"
                                            >
                                              <Plus size={10} />
                                              Add Instructor ID
                                            </button>
                                          </div>
                                          <div className="space-y-3">
                                            {(dayConfig.instructors || ['']).map((inst, idx) => (
                                              <SearchableInput 
                                                key={`custom-inst-${day.value}-${idx}`}
                                                value={inst}
                                                onChange={(val) => {
                                                  const newArr = [...(dayConfig.instructors || [''])];
                                                  newArr[idx] = val;
                                                  updateCustomDayConfig(slot.id, day.value, 'instructors', newArr);
                                                }}
                                                recentOptions={recentInstructors}
                                                isMandatory={idx === 0}
                                                showRemove={idx > 0}
                                                onRemove={() => {
                                                  const newArr = (dayConfig.instructors || ['']).filter((_, i) => i !== idx);
                                                  updateCustomDayConfig(slot.id, day.value, 'instructors', newArr);
                                                }}
                                                placeholder={`${day.label} Instructor ID`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </>
                          ) : (
                            <>
                              <div className="col-span-2 space-y-3">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Base Q&A Session Time</span>
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
                              <div className="col-span-2 space-y-1.5">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Base Q&A Title</span>
                                <input 
                                  type="text" 
                                  value={slot.title}
                                  onChange={(e) => updateTimeSlot(slot.id, 'title', e.target.value)}
                                  placeholder="Session Title (e.g. Q&A session)..."
                                  className="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                                />
                              </div>
                            </>
                          )}

                          <div className={dayOption === 'custom' ? "col-span-2 space-y-1.5" : "space-y-1.5"}>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Platform</span>
                            <div className="flex bg-white/5 border border-brand-border rounded-xl p-1 relative shadow-sm">
                              {(['ZOOM', 'MEET'] as const).map((p) => (
                                <button
                                  key={p}
                                  onClick={() => updateTimeSlot(slot.id, 'sessionPlatform', p)}
                                  className={`relative z-10 flex-1 py-2 text-[10px] font-bold rounded-lg transition-all duration-300 ${
                                    slot.sessionPlatform === p 
                                      ? 'text-white' 
                                      : 'text-slate-400 hover:text-slate-500'
                                  }`}
                                >
                                  {slot.sessionPlatform === p && (
                                    <motion.div 
                                      layoutId={`platformBg-${slot.id}`}
                                      className="absolute inset-0 bg-brand-accent-violet text-white rounded-lg -z-10 shadow-md"
                                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                  )}
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          {dayOption !== 'custom' && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Category</span>
                              <div className="flex bg-white/5 border border-brand-border rounded-xl p-1 relative shadow-sm">
                                {(['qna-sessions-aig', 'qna-sessions-bsiai'] as string[]).map((c) => (
                                  <button
                                    key={c}
                                    onClick={() => updateTimeSlot(slot.id, 'category', c)}
                                    className={`relative z-10 flex-1 py-2 text-[9px] font-bold rounded-lg transition-all duration-300 ${
                                      slot.category === c 
                                        ? 'text-white' 
                                        : 'text-slate-400 hover:text-slate-500'
                                    }`}
                                  >
                                    {slot.category === c && (
                                      <motion.div 
                                        layoutId={`categoryBg-${slot.id}`}
                                        className="absolute inset-0 bg-brand-accent-violet text-white rounded-lg -z-10 shadow-md"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                      />
                                    )}
                                    {c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c}
                                  </button>
                                ))}
                                <button type="button" onClick={() => setShowCategoryModal(true)} className="relative z-10 px-2 py-2 text-[9px] font-bold rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center bg-white/5 ml-1">+ Add</button>
                              </div>
                            </div>
                          )}

                          {dayOption !== 'custom' && (
                            <div className="col-span-2">
                              <AnimatePresence mode="wait">
                                {slot.category.startsWith('qna-sessions') ? (
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
                                      className="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
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
                                        className="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
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
                                        className="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                                      />
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {dayOption !== 'custom' && (
                            <div className="col-span-2 space-y-4">
                              {(
                                /* Q&A Days Configuration */
                                <div className="space-y-4">
                                  <div className="border-b border-white/[0.05] pb-2">
                                    <h4 className="text-xs font-bold text-slate-200 tracking-wide uppercase flex items-center gap-1.5">
                                      <CalendarDays size={12} className="text-brand-accent-teal" />
                                      Q&A Days Configuration
                                    </h4>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                      Select which days have Normal Q&A vs Open Mic Q&A, and configure their specific instructors, titles, and times.
                                    </p>
                                  </div>

                                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                                    {activeDaysList.map((day) => {
                                      const qnaConfig = getQnaDayConfig(slot, day.value);
                                      const isOpenMic = qnaConfig.type === 'open-mic';

                                      return (
                                        <div 
                                          key={`qna-day-${day.value}`}
                                          className={`p-4 rounded-2xl border transition-all duration-300 ${
                                            isOpenMic 
                                              ? 'bg-brand-accent-teal/10 border-brand-accent-teal/20' 
                                              : 'bg-white/[0.02] border-brand-border'
                                          }`}
                                        >
                                          {/* Day Name & Toggle */}
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                              isOpenMic ? 'text-brand-accent-teal' : 'text-slate-300'
                                            }`}>
                                              <Clock size={12} />
                                              {day.label}
                                            </span>

                                            <div className="flex bg-white/5 border border-brand-border rounded-xl p-1 relative w-full sm:w-64 shadow-sm">
                                              {(['normal', 'open-mic'] as const).map((t) => {
                                                const isSelected = qnaConfig.type === t;
                                                return (
                                                  <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => updateQnaDayConfig(slot.id, day.value, 'type', t)}
                                                    className={`relative z-10 flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-300 ${
                                                      isSelected 
                                                        ? 'text-white' 
                                                        : 'text-slate-400 hover:text-slate-500'
                                                    }`}
                                                  >
                                                    {isSelected && (
                                                      <motion.div 
                                                        layoutId={`qnaTypeBg-${slot.id}-${day.value}`}
                                                        className={`absolute inset-0 rounded-lg -z-10 shadow-md ${
                                                          isOpenMic ? 'bg-brand-accent-teal' : 'bg-brand-accent-violet'
                                                        }`}
                                                        transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                                                      />
                                                    )}
                                                    {t === 'normal' ? 'Normal Q&A' : 'Open Mic Q&A'}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>

                                          {/* Sub-config: Title and Times */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-3 border-t border-white/[0.05]">
                                            {/* Custom Times */}
                                            <div className="space-y-2">
                                              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Time Override</span>
                                              <div className="grid grid-cols-2 gap-2">
                                                <TimeInput12h 
                                                  label="Start Time"
                                                  value={qnaConfig.startTime || slot.startTime}
                                                  onChange={(val) => updateQnaDayConfig(slot.id, day.value, 'startTime', val)}
                                                />
                                                <TimeInput12h 
                                                  label="End Time"
                                                  value={qnaConfig.endTime || slot.endTime}
                                                  onChange={(val) => updateQnaDayConfig(slot.id, day.value, 'endTime', val)}
                                                />
                                              </div>
                                            </div>

                                            {/* Custom Title */}
                                            <div className="space-y-2">
                                              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Session Title Override</span>
                                              <input 
                                                type="text" 
                                                value={qnaConfig.title || ''}
                                                onChange={(e) => updateQnaDayConfig(slot.id, day.value, 'title', e.target.value)}
                                                placeholder={isOpenMic ? "Open Mic Q&A Session" : "Default Q&A title"}
                                                className="w-full bg-white/5 border border-brand-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
                                              />
                                            </div>
                                          </div>

                                          {/* Instructor Configuration */}
                                          <div className="space-y-3 pt-3 border-t border-white/[0.05]">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                                <Users size={10} />
                                                Instructor IDs *
                                              </span>
                                              <button 
                                                type="button"
                                                onClick={() => addQnaInstructor(slot.id, day.value)}
                                                className="flex items-center gap-1 text-[10px] font-bold text-brand-accent-violet hover:text-brand-accent-teal transition-colors"
                                              >
                                                <Plus size={10} />
                                                Add Instructor ID
                                              </button>
                                            </div>
                                            <div className="space-y-3">
                                              {qnaConfig.instructors.map((inst, idx) => (
                                                <SearchableInput 
                                                  key={`qna-inst-${day.value}-${idx}`}
                                                  value={inst}
                                                  onChange={(val) => updateQnaInstructor(slot.id, day.value, idx, val)}
                                                  recentOptions={recentInstructors}
                                                  isMandatory={idx === 0}
                                                  showRemove={idx > 0}
                                                  onRemove={() => removeQnaInstructor(slot.id, day.value, idx)}
                                                  placeholder="Instructor ID"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="col-span-2 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                <Users size={10} />
                                Batch IDs
                              </span>
                              <button 
                                onClick={() => addBatch(slot.id)}
                                className="flex items-center gap-1 text-[10px] font-bold text-brand-accent-violet hover:text-brand-accent-teal transition-colors"
                              >
                                <Plus size={10} />
                                Add Batch ID
                              </button>
                            </div>
                            <div className="space-y-3">
                              {slot.batch.map((b, idx) => (
                                <SearchableInput 
                                  key={idx}
                                  value={b}
                                  onChange={(val) => updateBatch(slot.id, idx, val)}
                                  recentOptions={recentBatches}
                                  isMandatory={false}
                                  showRemove={idx > 0}
                                  onRemove={() => removeBatch(slot.id, idx)}
                                  placeholder="Batch ID"
                                />
                              ))}
                            </div>
                          </div>

                          {slot.category.startsWith('qna-sessions') && (
                            <div className="col-span-2 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                  <Users size={10} />
                                  Course ID
                                </span>
                                <button 
                                  onClick={() => addCourse(slot.id)}
                                  className="flex items-center gap-1 text-[10px] font-bold text-brand-accent-violet hover:text-brand-accent-teal transition-colors"
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
                              className="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-brand-accent-violet/20 focus:border-brand-accent-violet/50 transition-all text-slate-200 placeholder:text-slate-500 shadow-sm"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/[0.03] p-4 rounded-2xl border border-brand-border">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-200">
                    <input 
                      type="checkbox" 
                      checked={includeLiveSessions} 
                      onChange={(e) => setIncludeLiveSessions(e.target.checked)}
                      className="w-4 h-4 rounded border-brand-border text-brand-accent-violet focus:ring-brand-accent-violet/20 bg-white/5"
                    />
                    <span>Live Sessions (Curriculum Phases)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-200">
                    <input 
                      type="checkbox" 
                      checked={includeQnaSessions} 
                      onChange={(e) => setIncludeQnaSessions(e.target.checked)}
                      className="w-4 h-4 rounded border-brand-border text-brand-accent-violet focus:ring-brand-accent-violet/20 bg-white/5"
                    />
                    <span>Q&A Sessions (Time Slots)</span>
                  </label>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 font-medium">
                    This will generate <span className={`font-bold ${sessionCount === 0 ? 'text-red-500' : 'text-slate-500'}`}>{sessionCount}</span> total sessions based on your current settings.
                  </p>
                </div>
                <button 
                  onClick={generateSchedule}
                  disabled={isGenerating}
                  className="w-full bg-brand-accent-violet text-white py-5 rounded-2xl font-bold text-sm shadow-glow hover:bg-black hover:-translate-y-1 hover:shadow-glow-hover active:translate-y-0 transition-all flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-brand-accent-teal group-hover:rotate-12 transition-transform" />
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
                    className="mt-4 p-5 bg-rose-500/10 border border-rose-100 rounded-2xl flex flex-col gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 text-rose-800">
                      <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Reset everything?</p>
                        <p className="text-[10px] text-rose-400/70 font-medium">All inputs and generated data will be lost.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={clearAll}
                        className="flex-1 bg-rose-500/100 hover:bg-rose-600 text-white py-2.5 rounded-xl text-[10px] font-bold transition-all shadow-sm active:scale-95"
                      >
                        Yes, Clear All
                      </button>
                      <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 bg-white/5 border border-rose-500/30 text-rose-400 py-2.5 rounded-xl text-[10px] font-bold hover:bg-rose-500/20 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-brand-border text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-100 transition-all text-xs font-bold group"
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
            <section className="glass-card p-8 border border-white/10 h-full flex flex-col min-h-[600px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-white font-display">Generated Schedule</h2>
                      {hasSavedData && !isGenerated && (
                        <button 
                          onClick={restoreLastSchedule}
                          className="p-1.5 text-slate-400 hover:text-brand-accent-teal hover:bg-brand-accent-violet/10 rounded-lg transition-all"
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
                      className="flex items-center justify-center gap-2.5 bg-white/[0.1] text-slate-500 px-6 py-3 rounded-2xl text-xs font-bold hover:bg-white/20 hover:-translate-y-1 hover:shadow-glow-hover active:translate-y-0 transition-all border border-brand-border"
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
                      className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-accent-violet to-brand-accent-teal border-none shadow-glow text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-glow-hover active:translate-y-0 transition-all shadow-lg shadow-indigo-100"
                    >
                      <Download size={16} />
                      <span>Download CSV</span>
                    </button>
                  </div>
                )}
              </div>
              {isGenerated && generatedSchedule.length > 0 && (
                <div className="flex items-center gap-2 mb-4 bg-white/[0.03] p-1.5 rounded-2xl border border-brand-border w-fit">
                  <button
                    onClick={() => setScheduleCategoryFilter('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      scheduleCategoryFilter === 'all'
                        ? 'bg-brand-accent-violet text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({generatedSchedule.length})
                  </button>
                  <button
                    onClick={() => setScheduleCategoryFilter('live')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      scheduleCategoryFilter === 'live'
                        ? 'bg-brand-accent-violet text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Live Sessions ({generatedSchedule.filter(i => i.category === 'live-sessions-aig' || customLiveCategories.some(c => c.slug === i.category)).length})
                  </button>
                  <button
                    onClick={() => setScheduleCategoryFilter('qna')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      scheduleCategoryFilter === 'qna'
                        ? 'bg-brand-accent-violet text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Q&A Sessions ({generatedSchedule.filter(i => i.category.startsWith('qna-sessions') || (!i.category.startsWith('live') && i.category !== 'live-sessions-aig')).length})
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-hidden border border-brand-border rounded-3xl bg-white/[0.03]">
                {!isGenerated ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                    <div className="w-24 h-24 bg-white/5 rounded-3xl shadow-soft flex items-center justify-center text-slate-200">
                      <Calendar size={40} />
                    </div>
                    <div className="space-y-2 max-w-xs">
                      <p className="text-lg font-bold text-slate-200">Ready to generate</p>
                      <p className="text-sm font-medium text-slate-400 leading-relaxed">Adjust your settings and click the generate button to see your schedule here.</p>
                    </div>
                  </div>
                ) : generatedSchedule.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                    <div className="w-24 h-24 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-400">
                      <AlertCircle size={40} />
                    </div>
                    <div className="space-y-2 max-w-xs">
                      <p className="text-lg font-bold text-slate-200 text-rose-400">No sessions found</p>
                      <p className="text-sm font-medium text-slate-400 leading-relaxed">Try expanding your date range or changing your day selection filters.</p>
                    </div>
                  </div>
                ) : (() => {
                  const filteredList = generatedSchedule.filter(item => {
                    if (scheduleCategoryFilter === 'all') return true;
                    if (scheduleCategoryFilter === 'live') {
                      return item.category === 'live-sessions-aig' || customLiveCategories.some(c => c.slug === item.category);
                    }
                    if (scheduleCategoryFilter === 'qna') {
                      return item.category.startsWith('qna-sessions') || (!item.category.startsWith('live') && item.category !== 'live-sessions-aig');
                    }
                    return true;
                  });
                  return filteredList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                      <div className="space-y-2 max-w-xs">
                        <p className="text-lg font-bold text-slate-200">No sessions found in this category</p>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">Try selecting a different category filter.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-black/40 border-b border-brand-border z-10">
                          <tr>
                            <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">#</th>
                            <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Title</th>
                            <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Category</th>
                            <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Course</th>
                            <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Batch</th>
                            <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Start Time (IST)</th>
                            <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">End Time (IST)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredList.map((item, index) => {
                            const isLive = item.category === 'live-sessions-aig' || customLiveCategories.some(c => c.slug === item.category);
                            return (
                              <tr key={index} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-5 text-[11px] font-mono text-slate-500">{index + 1}</td>
                                <td className="px-6 py-5 text-sm font-semibold text-slate-200 truncate max-w-[140px]" title={item.title}>{item.title || '-'}</td>
                                <td className="px-6 py-5">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isLive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  }`}>
                                    {isLive ? 'Live Session' : 'Q&A'}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-400">{item.course}</td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-400">{item.batch}</td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-500 whitespace-nowrap">{item.startTime}</td>
                                <td className="px-6 py-5 text-sm font-medium text-slate-500 whitespace-nowrap">{item.endTime}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-slate-400 uppercase font-bold tracking-[0.2em]">
          <div className="flex items-center gap-6">
            <span>© 2026 Scheduler SaaS</span>
            <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
            <span>Asia/Kolkata Standard Time</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full">
            <CheckCircle2 size={14} />
            <span>All Systems Operational</span>
          </div>
        </footer>

        <AnimatePresence>
          {showCategoryModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-brand-surface w-full max-w-md rounded-3xl p-6 border border-brand-border shadow-2xl relative"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus size={20} className="text-brand-accent-violet" />
                    Add Custom Category
                  </h3>
                  <button 
                    onClick={() => setShowCategoryModal(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Label (e.g. Masterclass)</label>
                    <input 
                      type="text"
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      placeholder="Category Name"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-accent-violet/50 text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slug (e.g. live-sessions-mc)</label>
                    <input 
                      type="text"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      placeholder="live-sessions-xyz"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-accent-violet/50 text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                  <button 
                    onClick={handleAddCustomCategory}
                    disabled={!newCatLabel.trim() || !newCatSlug.trim()}
                    className="w-full mt-4 bg-brand-accent-violet hover:bg-brand-accent-violet/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-glow"
                  >
                    Add Category
                  </button>

                  {customLiveCategories.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-brand-border space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Custom Categories</h4>
                      {customLiveCategories.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-xl border border-brand-border">
                          <div>
                            <p className="text-sm font-bold text-white">{cat.label}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{cat.slug}</p>
                          </div>
                          <button
                            onClick={() => {
                              const updated = customLiveCategories.filter((_, i) => i !== idx);
                              setCustomLiveCategories(updated);
                              localStorage.setItem('custom_live_categories', JSON.stringify(updated));
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

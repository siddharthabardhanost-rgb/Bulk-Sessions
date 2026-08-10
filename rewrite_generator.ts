import * as fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = app.indexOf('  const generateSchedule = async () => {');
const endIdx = app.indexOf('  const downloadCSV = () => {');

const newGenerator = `  const generateSchedule = async () => {
    setIsGenerating(true);
    
    // Slight artificial delay for UX
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Validation for QnA mandatory fields in timeSlots
    const invalidSlot = timeSlots.find(slot => {
      const isQnA = slot.category.startsWith('qna-sessions');
      const isCustom = dayOption === 'custom';
      
      if (isCustom) {
        if (customDays.length === 0) return true;
        const allDaysValid = customDays.every(dayVal => {
          const cfg = getCustomDayConfig(slot, dayVal);
          if (!cfg.link || cfg.link.trim() === '') return false;
          if (!cfg.instructors || cfg.instructors.length === 0 || !cfg.instructors[0] || cfg.instructors[0].trim() === '') return false;
          return true;
        });
        return !allDaysValid;
      }
      
      if (isQnA) {
        if (!slot.sessionLink || slot.sessionLink.trim() === '') return true;
        
        const activeDays = dayOption === 'weekdays' ? [1, 2, 3, 4, 5] : [6, 0];
        const allDaysHaveInstructors = activeDays.every(dayVal => {
          const cfg = getQnaDayConfig(slot, dayVal);
          return cfg && cfg.instructors && cfg.instructors[0] && cfg.instructors[0].trim() !== '';
        });
        return !allDaysHaveInstructors;
      }
      return false; // Assuming Live Sessions in timeSlots are ignored now
    });

    if (invalidSlot) {
      alert('Please fill in all mandatory fields (*) for Q&A time slots.');
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

    const schedule: GeneratedRow[] = [];
    
    // 1. Generate Q&A Sessions from timeSlots
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

    // 2. Generate Live Sessions from Curriculum
    const curriculumManagerList = blueprint.phases.flatMap(p => 
      p.sessions.map(s => ({ name: s.title, phaseId: p.id, phase: p }))
    );

    let dayIndex = 0;
    
    for (const item of curriculumManagerList) {
      let foundDay = false;
      const phase = item.phase;
      
      while (dayIndex < filteredDays.length) {
        const date = filteredDays[dayIndex];
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
          
          const activeBatches = phase.batches || [];
          const ids = activeBatches.map(batch => {
            const batchIds = blueprint.batchPhaseIds?.[batch];
            return batchIds?.[phase.id] || phase.courseId || phase.id || "N/A";
          });
          const courseValue = ids.join(', ');
          
          schedule.push({
            title: item.name,
            description: '',
            sessionLink: phase.sessionLink || '',
            sessionPlatform: '',
            category: 'live-sessions-aig',
            startTime: startStr,
            endTime: endStr,
            instructors: (phase.instructors || []).join(', '),
            course: courseValue,
            batch: activeBatches.join(', '),
            courseGroup: phase.courseId || '',
            _rawDate: startDateTime
          } as any);
          
          dayIndex++; // Consume one slot for this live session
          break;
        } else {
          dayIndex++;
        }
      }
      if (!foundDay) break;
    }

    // Sort combined schedule by date and time
    schedule.sort((a: any, b: any) => a._rawDate.getTime() - b._rawDate.getTime());
    
    // Remove temporary sorting field
    const finalSchedule = schedule.map((s: any) => {
      const copy = { ...s };
      delete copy._rawDate;
      return copy as GeneratedRow;
    });

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
`;

app = app.substring(0, startIdx) + newGenerator + app.substring(endIdx);
fs.writeFileSync('src/App.tsx', app);

import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldLogic = `        if (isLiveCategory) {
          if (curriculumManagerList.length > 0) {
            if (liveSessionCounter >= curriculumManagerList.length) {
              // Curriculum exhausted, skip generating further sessions of this type
              return;
            }
            const curriculumItem = curriculumManagerList[liveSessionCounter];
            finalTitle = curriculumItem.name;
            
            const ids = activeBatches.map(batch => {
              const batchIds = blueprint.batchPhaseIds[batch];
              const phase = blueprint.phases.find(p => p.id === curriculumItem.phaseId);
              return batchIds?.[curriculumItem.phaseId] || phase?.courseId || curriculumItem.phaseId || "N/A";
            });
            courseValue = ids.join(', ');
            
            liveSessionCounter++;
          } else {
            courseValue = activeCourses.join(', ');
          }`;

const newLogic = `        if (isLiveCategory) {
          if (curriculumManagerList.length > 0) {
            if (liveSessionCounter >= curriculumManagerList.length) {
              // Curriculum exhausted, skip generating further sessions of this type
              return;
            }
            const curriculumItem = curriculumManagerList[liveSessionCounter];
            const phase = blueprint.phases.find(p => p.id === curriculumItem.phaseId);

            if (phase && phase.dayOfWeek !== undefined && phase.dayOfWeek !== 'all' && phase.dayOfWeek !== dayOfWeek) {
              // The phase requires a specific day, but today is not that day. Skip scheduling this slot.
              return;
            }

            if (phase) {
              if (phase.startTime) currentStartTime = phase.startTime;
              if (phase.endTime) currentEndTime = phase.endTime;
            }

            finalTitle = curriculumItem.name;
            
            const ids = activeBatches.map(batch => {
              const batchIds = blueprint.batchPhaseIds[batch];
              return batchIds?.[curriculumItem.phaseId] || phase?.courseId || curriculumItem.phaseId || "N/A";
            });
            courseValue = ids.join(', ');
            
            liveSessionCounter++;
          } else {
            courseValue = activeCourses.join(', ');
          }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/App.tsx', content);

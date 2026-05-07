
export interface CurriculumSession {
  id: string;
  title: string;
}

export interface CurriculumPhase {
  id: string;
  name: string;
  sessions: CurriculumSession[];
}

export interface CurriculumBlueprint {
  phases: CurriculumPhase[];
  batchPhaseIds: Record<string, Record<string, string>>; // Batch -> PhaseID -> CourseID
}

export const DEFAULT_CURRICULUM_BLUEPRINT: CurriculumBlueprint = {
  phases: [
    {
      id: 'p1.1',
      name: 'Phase 1.1',
      sessions: [
        { id: 's1', title: 'The AI Generalist Mindset & Generative AI Ecosystem Deep Dive' },
        { id: 's2', title: 'AI tools for research work & 10x Productivity' },
        { id: 's3', title: '10x Productivity at Work with Claude' },
        { id: 's4', title: 'Make Money Using AI' },
        { id: 's5', title: 'LinkedIn Optimisation with AI' },
      ]
    },
    {
      id: 'p1.2',
      name: 'Phase 1.2',
      sessions: [
        { id: 's6', title: 'Product Building & Tech 101' },
        { id: 's7', title: 'Workflow Automation with Make' },
        { id: 's8', title: 'Present Like a Pro: AI-Powered Decks & Storytelling' },
        { id: 's9', title: 'Data Analysis with AI using Excel Part 1' },
        { id: 's10', title: 'Data Analysis with AI using Excel Part 2' },
        { id: 's11', title: 'Data Visualisation with AI using Power BI' },
      ]
    },
    {
      id: 'p1.3',
      name: 'Phase 1.3',
      sessions: [
        { id: 's12', title: 'AI Agents & Automation with n8n' },
        { id: 's13', title: 'Build Your Own AI Employee Part 1' },
        { id: 's14', title: 'Build Your Own AI Employee Part 2' },
        { id: 's15', title: 'Smart Real-Time Voice Agents & MCP Part 1' },
        { id: 's16', title: 'Smart Real-Time Voice Agents & MCP Part 2' },
        { id: 's17', title: 'Customer Support Agent with RAG Part 1' },
        { id: 's18', title: 'Customer Support Agent with RAG Part 2' },
      ]
    },
    {
      id: 'p1.4',
      name: 'Phase 1.4',
      sessions: [
        { id: 's19', title: 'ATS Friendly Resume Writing' },
        { id: 's20', title: 'Interview Preparation Using AI' },
        { id: 's21', title: 'Job Hunting Using AI' },
      ]
    },
    {
      id: 'p1.5',
      name: 'Phase 1.5',
      sessions: [
        { id: 's22', title: 'AI Powered Image & Video Generation' },
        { id: 's23', title: 'Business Communication with AI' },
        { id: 's24', title: 'AI in Leadership & Team Management' },
      ]
    },
    {
      id: 'p2',
      name: 'Phase 2',
      sessions: [
        { id: 's25', title: 'AI Generalist Hackathon Intro Call' },
        { id: 's26', title: 'AI Generalist Hackathon Solution' },
      ]
    }
  ],
  batchPhaseIds: {}
};

/**
 * Returns the concatenated Course ID string for a given session title and active batches.
 */
export function getSynchronizedCourseIDs(
  title: string, 
  activeBatches: string[], 
  blueprint: CurriculumBlueprint
): string {
  // Find phase by title
  let phaseId = '';
  for (const phase of blueprint.phases) {
    if (phase.sessions.some(s => s.title === title)) {
      phaseId = phase.id;
      break;
    }
  }
  
  if (!phaseId) {
    return "N/A";
  }

  const ids = activeBatches.map(batch => {
    const batchIds = blueprint.batchPhaseIds[batch];
    return batchIds?.[phaseId] || "N/A";
  });

  return ids.join(', ');
}

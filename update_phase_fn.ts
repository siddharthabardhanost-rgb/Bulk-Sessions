import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  `  const renamePhase = (phaseId: string, newName: string) => {`,
  `  const updatePhase = (phaseId: string, updates: Partial<CurriculumPhase>) => {
    const newBlueprint = {
      ...blueprint,
      phases: blueprint.phases.map(p => 
        p.id === phaseId ? { ...p, ...updates } : p
      )
    };
    setBlueprint(newBlueprint);
    localStorage.setItem('curriculum_blueprint', JSON.stringify(newBlueprint));
  };

  const renamePhase = (phaseId: string, newName: string) => {`
);

content = content.replace(
  `  onRenamePhase: (phaseId: string, newName: string) => void;
}) => {`,
  `  onRenamePhase: (phaseId: string, newName: string) => void;
  onUpdatePhase: (phaseId: string, updates: Partial<CurriculumPhase>) => void;
}) => {`
);

content = content.replace(
  `const SortablePhase = ({ phase, onRenameSession, onDeleteSession, onAddSession, onDeletePhase, onRenamePhase }: {`,
  `const SortablePhase = ({ phase, onRenameSession, onDeleteSession, onAddSession, onDeletePhase, onRenamePhase, onUpdatePhase }: {`
);

content = content.replace(
  `                              onRenamePhase={renamePhase}
                            />`,
  `                              onRenamePhase={renamePhase}
                              onUpdatePhase={updatePhase}
                            />`
);

fs.writeFileSync('src/App.tsx', content);

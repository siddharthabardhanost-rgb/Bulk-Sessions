import * as fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf-8');

const strToRemove = `                          ) : slot.category === 'live-sessions-aig' ? (
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
                          ) : (`;

app = app.replace(strToRemove, `                          ) : (`);

const instructorStrToRemove = `                              {slot.category === 'live-sessions-aig' ? (
                                /* Standard LIVE Instructors */
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
                                      <Users size={10} />
                                      Instructors *
                                    </span>
                                    <button 
                                      onClick={() => addInstructor(slot.id)}
                                      className="flex items-center gap-1 text-[10px] font-bold text-brand-accent-violet hover:text-brand-accent-teal transition-colors"
                                    >
                                      <Plus size={10} />
                                      Add Instructor
                                    </button>
                                  </div>
                                  <div className="space-y-3">
                                    {slot.instructors.map((inst, idx) => (
                                      <SearchableInput 
                                        key={idx}
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
                              ) : (`;

app = app.replace(instructorStrToRemove, `                              {(`);

fs.writeFileSync('src/App.tsx', app);

import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// For custom day config
content = content.replace(
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c === 'live-sessions-aig' ? 'LIVE' : customLiveCategories.find(cat => cat.slug === c)?.label || c}
                                                </button>
                                              ))}`,
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c === 'live-sessions-aig' ? 'LIVE' : customLiveCategories.find(cat => cat.slug === c)?.label || c}
                                                </button>
                                              ))}
                                              <button type="button" onClick={() => setShowCategoryModal(true)} className="relative z-10 px-2 py-1.5 text-[9px] font-bold rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center bg-white/5 ml-1">+ Add</button>`
);


// For standard time slot config
content = content.replace(
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c === 'live-sessions-aig' ? 'LIVE' : customLiveCategories.find(cat => cat.slug === c)?.label || c}
                                  </button>
                                ))}`,
  `{c === 'qna-sessions-aig' ? 'Q&A' : c === 'qna-sessions-bsiai' ? 'BSIAI Q&A' : c === 'live-sessions-aig' ? 'LIVE' : customLiveCategories.find(cat => cat.slug === c)?.label || c}
                                  </button>
                                ))}
                                <button type="button" onClick={() => setShowCategoryModal(true)} className="relative z-10 px-2 py-2 text-[9px] font-bold rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center bg-white/5 ml-1">+ Add</button>`
);

fs.writeFileSync('src/App.tsx', content);

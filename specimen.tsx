import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FlaskConical, Sparkles, Image as ImageIcon, History, Layers, Sun, Moon, LogOut, 
  Menu, X, Search, Pin, Trash2, Edit3, Check, Calendar, Download, Share2, 
  Play, ExternalLink, ArrowRight, RefreshCw, AlertCircle, FileText, CheckCircle2,
  Clock, Plus, ShieldCheck, HelpCircle, ChevronRight, Send, Bell, Link2
} from 'lucide-react';

// Helper to dynamically load jsPDF CDN on demand
const loadJsPDF = () => {
  return new Promise((resolve, reject) => {
    if (window.jspdf && window.jspdf.jsPDF) {
      return resolve(window.jspdf.jsPDF);
    }
    if (window.jsPDF) {
      return resolve(window.jsPDF);
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve(window.jspdf.jsPDF);
      } else if (window.jsPDF) {
        resolve(window.jsPDF);
      } else {
        reject(new Error('jsPDF loaded but not found on window object'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load jsPDF library'));
    document.head.appendChild(script);
  });
};

// --- INITIAL MOCK DATA ---
const INITIAL_TEMPLATES = [
  {
    id: 'tmpl-1',
    name: 'Elephant Toothpaste Exothermic Action',
    prompt_text: 'Decomposition of hydrogen peroxide using potassium iodide or yeast catalyst to create massive foam elephant toothpaste.',
    requirements: ['30% Hydrogen Peroxide', 'Dish Soap', 'Dry Yeast or Potassium Iodide', 'Warm Water', 'Graduated Cylinder', 'Food Coloring', 'Safety Goggles & Gloves'],
    procedure: [
      'Put on safety goggles and protective gloves.',
      'Measure 50ml of hydrogen peroxide and pour into the flask/cylinder.',
      'Add a squirt of dish soap and a few drops of food coloring, then swirl gently.',
      'In a separate small cup, mix 1 tbsp dry yeast with 3 tbsp warm water for 30 seconds.',
      'Pour yeast mixture directly into the cylinder and immediately stand back.'
    ]
  },
  {
    id: 'tmpl-2',
    name: 'Starch Test on Photosynthetic Leaf',
    prompt_text: 'Testing a variegated leaf for starch presence after light exposure using iodine solution.',
    requirements: ['Green variegated leaf', 'Iodine solution', 'Ethanol / Methylated spirits', 'Beaker of water', 'Bunsen burner or hot plate', 'Petri dish', 'Forceps'],
    procedure: [
      'Boil leaf in water for 2 minutes to soften cell walls.',
      'Turn off flame. Submerge leaf in a tube of warm ethanol for 10 mins to remove chlorophyll.',
      'Rinse leaf in warm water to soften.',
      'Spread flat in petri dish and drop 5-10 drops of iodine solution across the surface.',
      'Observe color change (Blue-black indicates starch, brown/yellow indicates no starch).'
    ]
  },
  {
    id: 'tmpl-3',
    name: 'Density Rainbow Column',
    prompt_text: 'Layering liquids with different densities and sugar content in a glass cylinder.',
    requirements: ['Honey', 'Dish Soap', 'Water', 'Vegetable Oil', 'Rubbing Alcohol', 'Food Coloring', 'Tall Glass Cylinder'],
    procedure: [
      'Tint water red and rubbing alcohol blue using food coloring.',
      'Pour honey directly into the center of the cylinder bottom.',
      'Carefully layer dish soap over the honey along the cylinder wall.',
      'Slowly pour colored water over the soap layer using a spoon backing.',
      'Layer vegetable oil next, followed very gently by colored rubbing alcohol on top.'
    ]
  }
];

const INITIAL_EXPERIMENTS = [
  {
    id: 'exp-101',
    title: 'Elephant Toothpaste Exothermic Catalytic Foam',
    prompt_text: 'We mixed hydrogen peroxide, dish soap, food dye, and yeast. It erupted in a huge warm column of foam!',
    image_uri: null,
    status: 'ready',
    aim: 'To observe the rapid catalytic decomposition of hydrogen peroxide into water and oxygen gas, creating exothermic trapped foam.',
    requirements: ['30% Hydrogen Peroxide (H2O2)', 'Liquid Dish Soap', 'Dry Active Yeast', 'Warm Water', 'Food Coloring', 'Erlenmeyer Flask', 'Safety Tray'],
    procedure: [
      'Place the Erlenmeyer flask on the safety tray and wear protective eye gear.',
      'Add 100 mL of hydrogen peroxide solution into the flask.',
      'Add 10 mL of liquid dish soap and 5 drops of food coloring; swirl gently to mix.',
      'Dissolve 1 packet of active dry yeast in 3 tablespoons of warm water in a separate beaker.',
      'Pour the yeast mixture quickly into the flask and step back to record the expansion rate and temperature rise.'
    ],
    observation: 'Within 2 seconds of adding yeast, a dense pillar of colorful foam shot upward out of the flask neck. The outer surface of the flask felt noticeably warm to touch.',
    conclusion: 'Yeast acts as a biological catalyst (catalase) that speeds up H2O2 decomposition. The trapped O2 gas forms soap bubbles, and heat generation proves the reaction is exothermic.',
    principle: '2H₂O₂ (aq) → 2H₂O (l) + O₂ (g) + Heat. The catalyst lowers activation energy without being consumed. Soap traps the released oxygen gas into an expanding foam matrix.',
    search_query: 'elephant toothpaste chemical reaction demo',
    videos: [
      {
        title: 'World Record Elephant Toothpaste Experiment',
        url: 'https://www.youtube.com/watch?v=p1U12T3iN8U',
        platform: 'YouTube',
        creator: 'Science Max',
        summary: 'High energy demonstration scaling hydrogen peroxide catalysts in large outdoor cylinders.'
      },
      {
        title: 'Exothermic Foam Chemistry Breakdown',
        url: 'https://www.youtube.com/watch?v=Kou7ur5F_4c',
        platform: 'YouTube',
        creator: 'Periodic Videos',
        summary: 'Detailed explanation of catalase enzyme activity on peroxide molecule bonds.'
      }
    ],
    illustration_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%"><rect width="500" height="400" fill="%23181e29"/><text x="250" y="40" fill="%2393c5fd" font-family="monospace" font-size="16" font-weight="bold" text-anchor="middle">EXPERIMENTAL DIAGRAM: FOAM CATALYSIS</text><path d="M 220 330 L 220 240 L 200 140 L 300 140 L 280 240 L 280 330 Z" fill="none" stroke="%2393c5fd" stroke-width="3"/><path d="M 180 140 Q 250 20 320 140 Q 300 80 200 90 Z" fill="%2360a5fa" opacity="0.6"/><circle cx="240" cy="110" r="12" fill="%2393c5fd"/><circle cx="265" cy="85" r="16" fill="%2393c5fd"/><circle cx="230" cy="65" r="20" fill="%2393c5fd"/><line x1="120" y1="200" x2="210" y2="200" stroke="%23f87171" stroke-width="2" stroke-dasharray="4"/><text x="40" y="204" fill="%23f87171" font-family="sans-serif" font-size="12">H2O2 + Dish Soap</text><line x1="380" y1="90" x2="280" y2="90" stroke="%234ade80" stroke-width="2" stroke-dasharray="4"/><text x="390" y="94" fill="%234ade80" font-family="sans-serif" font-size="12">O2 Foam Eruption</text><text x="250" y="370" fill="%2394a3b8" font-family="monospace" font-size="12" text-anchor="middle">FIG 1.1: Exothermic Catalytic Column Setup</text></svg>',
    generated_video_url: null,
    finalized: true,
    pinned: true,
    due_date: '2026-11-20',
    error: null,
    created_date: '2026-11-01T10:00:00.000Z'
  }
];

// Custom local storage hook
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading storage key ${key}`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting storage key ${key}`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// Simulated AI Pipeline Engine
const runAIPipeline = async (promptText, imageBase64, onProgress) => {
  onProgress("Understanding your experiment…");
  await new Promise(r => setTimeout(r, 1200));

  onProgress("Drawing the diagram…");
  await new Promise(r => setTimeout(r, 1400));

  onProgress("Searching platforms for demos…");
  await new Promise(r => setTimeout(r, 1300));

  onProgress("Writing up the experiment…");
  await new Promise(r => setTimeout(r, 1100));

  // Determine experiment title & topic based on prompt keyword matching
  const promptLower = (promptText || '').toLowerCase();
  let title = "Custom Science Exploration";
  let aim = "Investigating chemical and physical properties of the system.";
  let reqs = ["Beaker", "Measuring Cylinder", "Distilled Water", "Safety Goggles", "Timer", "Pipette"];
  let proc = [
    "Assemble apparatus cleanly on a stable, heat-resistant lab bench.",
    "Measure exact volumes of reactants using calibrated volumetric tools.",
    "Combine primary agents gradually while constantly observing temperature and state changes.",
    "Record time-series quantitative data and qualitative surface reactions.",
    "Dispose of chemical waste according to standard laboratory environmental guidelines."
  ];
  let obs = "Rapid state transition observed with temperature fluctuation and light emission/bubbling.";
  let conc = "The reaction verified kinetic predictions, forming expected products under STP.";
  let sci = "Thermodynamic equilibrium shifts according to Le Chatelier's principle when reactant concentration increases.";
  let searchQuery = "chemistry physics hands on science demonstration";

  if (promptLower.includes('lava') || promptLower.includes('oil')) {
    title = "DIY Lava Lamp Density & Intermolecular Forces";
    aim = "To demonstrate density differentials between polar and nonpolar liquids alongside CO2 convection.";
    reqs = ["Vegetable Oil", "Water", "Food Coloring", "Alka-Seltzer (Effervescent) Tablets", "Clear Glass Bottle"];
    proc = [
      "Fill 3/4 of the glass bottle with vegetable oil.",
      "Fill the remaining quarter with tap water, leaving 1 inch space at top.",
      "Add 10 drops of dark food coloring; notice how drops pass through oil into water.",
      "Break an effervescent tablet into 4 pieces.",
      "Drop one tablet piece into the bottle to initiate carbonic gas convection."
    ];
    obs = "Colored water droplets bubble up through the clear oil column, crest at the top surface, and sink back down smoothly.";
    conc = "Oil and water do not mix due to polarity differences. CO2 gas lowers water blob density temporarily.";
    sci = "Water is polar and denser than nonpolar oil (0.92 g/cm³). Effervescence (citric acid + sodium bicarbonate) produces CO2 bubbles that carry colored water upwards.";
    searchQuery = "diy lava lamp oil water alka seltzer demo";
  } else if (promptLower.includes('starch') || promptLower.includes('leaf')) {
    title = "Starch Content Test in Photosynthetic Leaves";
    aim = "To prove that chlorophyll and sunlight exposure produce stored starch in plant leaves.";
    reqs = ["Variegated Plant Leaf", "Iodine Solution", "Ethanol (95%)", "Water Bath", "Petri Dish", "Tweezers", "Hot Plate"];
    proc = [
      "Submerge leaf in boiling water for 2 minutes to disrupt cellular walls.",
      "Transfer leaf into a beaker of ethanol placed in boiling water bath until green pigment bleaches.",
      "Rinse bleached leaf in warm water bath to soften tissues.",
      "Spread leaf evenly inside a petri dish.",
      "Apply 5-8 drops of iodine solution over leaf surface and monitor color shift for 2 minutes."
    ];
    obs = "Sun-exposed green regions of leaf turned deep blue-black; shaded/white leaf sections remained yellowish-brown.";
    conc = "Starch is synthesized exclusively in leaf regions containing active chlorophyll receiving sunlight.";
    sci = "Photosynthesis: 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂. Glucose polymerizes into amylose starch, which reacts with triiodide ions to yield dark blue complex.";
    searchQuery = "leaf starch test iodine photosynthesis lab";
  } else if (promptLower.includes('rainbow') || promptLower.includes('density')) {
    title = "Liquid Density Column Rainbow Gradient";
    aim = "To stack five immiscible or sugar-variable liquids into stable gravitational strata.";
    reqs = ["Honey", "Dish Soap", "Water + Food Color", "Vegetable Oil", "Rubbing Alcohol", "Graduated Cylinder"];
    proc = [
      "Pour honey directly to bottom center of cylinder (density ~1.42 g/cm³).",
      "Gently layer dish soap over honey down the tilted wall (density ~1.06 g/cm³).",
      "Slowly drip colored water over soap layer (density ~1.00 g/cm³).",
      "Pipette vegetable oil down side of cylinder (density ~0.92 g/cm³).",
      "Carefully add colored alcohol on top without disturbing oil interface (density ~0.79 g/cm³)."
    ];
    obs = "Five distinct colorful bands formed without intermixing, remaining stable over 24 hours.";
    conc = "Liquids float or sink based on relative mass per unit volume (density) when surface turbulence is minimized.";
    sci = "Buoyancy force F = ρ · V · g. Higher density fluids exert greater buoyant force on lower density fluids above them.";
    searchQuery = "density column liquid layers science experiment";
  } else if (promptText.trim().length > 0) {
    title = promptText.slice(0, 50) + (promptText.length > 50 ? '...' : '');
  }

  // Draw SVG Illustration based on generated data
  const svgDiagram = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%"><rect width="500" height="400" fill="%23181e29"/><text x="250" y="36" fill="%2393c5fd" font-family="monospace" font-size="15" font-weight="bold" text-anchor="middle">${title.toUpperCase().slice(0, 35)}</text><rect x="60" y="70" width="380" height="250" rx="16" fill="%231e293b" stroke="%23334155" stroke-width="2"/><circle cx="150" cy="200" r="45" fill="%2338bdf8" opacity="0.3"/><circle cx="150" cy="200" r="30" fill="%2393c5fd" opacity="0.6"/><rect x="280" y="140" width="110" height="120" rx="8" fill="%230f172a" stroke="%2364748b" stroke-width="2"/><path d="M 290 220 L 380 220 L 380 250 L 290 250 Z" fill="%23f43f5e" opacity="0.7"/><line x1="150" y1="200" x2="285" y2="170" stroke="%2338bdf8" stroke-width="3" stroke-dasharray="6"/><text x="150" y="270" fill="%23cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">Primary Chamber</text><text x="335" y="280" fill="%23cbd5e1" font-family="sans-serif" font-size="12" text-anchor="middle">Reaction Zone</text><text x="250" y="360" fill="%2394a3b8" font-family="monospace" font-size="12" text-anchor="middle">GRAPHITE STUDIO DIAGRAM SYSTEM v2.4</text></svg>`;

  // Mock videos
  const videos = [
    {
      title: `${title} - Step by Step Lab Guide`,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'YouTube',
      creator: 'Lab Studio HD',
      summary: 'Complete classroom setup walkthrough with safety standards.'
    },
    {
      title: `Understanding ${title} Science Principles`,
      url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
      platform: 'YouTube',
      creator: 'Professor Science',
      summary: 'In-depth molecular level animation explaining the core reactions.'
    }
  ];

  return {
    title,
    aim,
    requirements: reqs,
    procedure: proc,
    observation: obs,
    conclusion: conc,
    principle: sci,
    search_query: searchQuery,
    videos,
    illustration_url: svgDiagram,
    generated_video_url: null,
    status: 'ready',
    finalized: false,
    pinned: false,
    due_date: null,
    error: null
  };
};

export default function App() {
  // Theme state
  const [theme, setTheme] = useLocalStorage('specimen_theme', 'dark');
  
  // Auth state
  const [user, setUser] = useLocalStorage('specimen_user', { email: 'student@lab.edu', name: 'Alex River' });
  const [authView, setAuthView] = useState(null); // 'login', 'register', 'forgot', 'reset'
  const [slackWebhook, setSlackWebhook] = useLocalStorage('specimen_slack', '');

  // Persistent App State
  const [experiments, setExperiments] = useLocalStorage('specimen_experiments', INITIAL_EXPERIMENTS);
  const [templates, setTemplates] = useLocalStorage('specimen_templates', INITIAL_TEMPLATES);

  // Router simulator
  const [currentPath, setCurrentPath] = useState('/');
  
  // Slide drawers state
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Sync route state with history API safely (handles blob/sandboxed iframe restrictions)
  const navigate = (path) => {
    try {
      if (window.location.protocol !== 'blob:') {
        window.history.pushState({}, '', path);
      }
    } catch (e) {
      // In sandboxed blob preview environments, pushState throws SecurityError; fall back to react state navigation
      console.warn('History pushState restricted in preview environment, using memory routing fallback.');
    }
    setCurrentPath(path);
    setMenuOpen(false);
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      try {
        if (window.location.protocol !== 'blob:') {
          setCurrentPath(window.location.pathname || '/');
        }
      } catch (e) {
        // Fallback for sandboxed URLs
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update theme class on root html
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle Slack Webhook alert
  const sendSlackNotification = (exp) => {
    if (!slackWebhook) return;
    try {
      const payload = {
        text: `*${exp.title}* — experiment report finalized\n*Aim:* ${exp.aim}\n*Conclusion:* ${exp.conclusion}\n*Full report link:* ${window.location.origin}/experiment/${exp.id}`
      };
      fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      }).catch(err => console.log('Slack dispatch silently handled', err));
    } catch (e) {
      console.log('Slack alert exception suppressed');
    }
  };

  // Auth Screen Guard
  if (!user && !authView) {
    return <AuthScreen view="login" setAuthView={setAuthView} onLogin={(u) => setUser(u)} />;
  }
  if (!user) {
    return <AuthScreen view={authView} setAuthView={setAuthView} onLogin={(u) => setUser(u)} />;
  }

  // Parse path parameters
  const isExperimentDetail = currentPath.startsWith('/experiment/');
  const experimentId = isExperimentDetail ? currentPath.split('/experiment/')[1] : null;

  return (
    <div className={`min-h-screen bg-background text-foreground font-sans transition-colors duration-200 antialiased selection:bg-primary/30 selection:text-primary`}>
      
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 h-14 bg-secondary/95 backdrop-blur border-b border-border px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="w-9 h-9 rounded-full hover:bg-card border border-border/50 flex items-center justify-center text-foreground transition-colors focus-visible:outline-2 outline-offset-2 outline-primary"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-mono text-base sm:text-lg font-semibold tracking-tighter hover:text-primary transition-colors"
          >
            <span className="text-primary text-xl">⌬</span>
            <span>My Experiments</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* History Pill in Header (Home shortcut) */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 bg-card hover:bg-secondary border border-border px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-colors shadow-sm focus-visible:outline-2 outline-offset-2 outline-primary"
          >
            <History className="w-3.5 h-3.5 text-primary" />
            <span className="uppercase font-medium">History</span>
            <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold text-[10px]">
              {experiments.length}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle light and dark theme"
            className="w-9 h-9 rounded-full bg-card hover:bg-secondary border border-border flex items-center justify-center text-foreground transition-colors focus-visible:outline-2 outline-offset-2 outline-primary"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Logout Button */}
          <button
            onClick={() => setUser(null)}
            aria-label="Sign out"
            className="w-9 h-9 rounded-full bg-card hover:bg-destructive/20 border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-2 outline-offset-2 outline-primary"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* AMBIENT SPECIMEN FILL DRIFT BAR */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary via-chart-2 to-transparent opacity-80" />

      {/* LEFT NAVIGATION DRAWER */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-background/70 backdrop-blur-sm transition-opacity" 
            onClick={() => setMenuOpen(false)} 
          />
          <aside className="relative w-72 bg-secondary border-r border-border h-full p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xl">⌬</span>
                  <span className="font-mono font-semibold tracking-tight">Navigation</span>
                </div>
                <button 
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-8 h-8 rounded-full hover:bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => navigate('/')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-mono text-sm flex items-center gap-3 transition-colors ${currentPath === '/' ? 'bg-card font-semibold text-primary border border-border' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>New experiment</span>
                </button>
                
                <button
                  onClick={() => navigate('/history')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-mono text-sm flex items-center gap-3 transition-colors ${currentPath === '/history' ? 'bg-card font-semibold text-primary border border-border' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </button>

                <button
                  onClick={() => navigate('/templates')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-mono text-sm flex items-center gap-3 transition-colors ${currentPath === '/templates' ? 'bg-card font-semibold text-primary border border-border' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Templates</span>
                </button>
              </nav>

              <div className="mt-8 pt-6 border-t border-border">
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-semibold block mb-2">
                  Slack alerts
                </span>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Receive instant webhooks when experiments are finalized.
                </p>
                <input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-mono text-muted-foreground text-center">
                My Experiments · your lab notebook
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* RIGHT HISTORY DRAWER */}
      {historyOpen && (
        <HistoryDrawer 
          experiments={experiments} 
          setExperiments={setExperiments}
          onClose={() => setHistoryOpen(false)} 
          onNavigate={(path) => { navigate(path); setHistoryOpen(false); }}
        />
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 min-h-[calc(100vh-3.75rem)]">
        {currentPath === '/' && (
          <HomeScreen 
            experiments={experiments} 
            setExperiments={setExperiments}
            templates={templates}
            navigate={navigate}
          />
        )}

        {currentPath === '/history' && (
          <HistoryPage 
            experiments={experiments} 
            setExperiments={setExperiments} 
            navigate={navigate} 
          />
        )}

        {currentPath === '/templates' && (
          <TemplatesPage 
            templates={templates} 
            setTemplates={setTemplates} 
            navigate={navigate} 
          />
        )}

        {isExperimentDetail && (
          <ExperimentReportPage 
            experimentId={experimentId} 
            experiments={experiments} 
            setExperiments={setExperiments}
            setTemplates={setTemplates}
            sendSlackNotification={sendSlackNotification}
            navigate={navigate}
          />
        )}

        {!['/', '/history', '/templates'].includes(currentPath) && !isExperimentDetail && (
          <NotFoundPage navigate={navigate} />
        )}
      </main>
    </div>
  );
}

// --- AUTH SCREENS ---
function AuthScreen({ view, setAuthView, onLogin }) {
  const [email, setEmail] = useState('student@lab.edu');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Alex River');
  const [sentNotice, setSentNotice] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === 'login' || view === 'register') {
      onLogin({ email, name: name || email.split('@')[0] });
    } else {
      setSentNotice(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-primary text-3xl font-mono">⌬</span>
          <h1 className="font-mono text-2xl font-bold tracking-tight">SPECIMEN</h1>
        </div>

        {sentNotice ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-mono text-xl font-semibold mb-2">Instructions Sent</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Check your inbox for confirmation link to complete your security request.
            </p>
            <button
              onClick={() => { setSentNotice(false); setAuthView('login'); }}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-mono font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-mono text-lg font-semibold text-center mb-4 text-muted-foreground">
              {view === 'login' && 'Sign in to your Lab Studio'}
              {view === 'register' && 'Create your Student/Teacher Account'}
              {view === 'forgot' && 'Reset your password'}
              {view === 'reset' && 'Enter new password'}
            </h2>

            {view === 'register' && (
              <div>
                <label className="block text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {(view === 'login' || view === 'register' || view === 'reset') && (
              <div>
                <label className="block text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-mono font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              {view === 'login' && 'Sign In'}
              {view === 'register' && 'Register Account'}
              {view === 'forgot' && 'Send Reset Link'}
              {view === 'reset' && 'Update Password'}
            </button>

            <div className="flex flex-col gap-2 pt-4 border-t border-border text-center text-xs text-muted-foreground">
              {view === 'login' && (
                <>
                  <button type="button" onClick={() => setAuthView('register')} className="hover:text-primary">
                    Don't have an account? Register
                  </button>
                  <button type="button" onClick={() => setAuthView('forgot')} className="hover:text-primary">
                    Forgot password?
                  </button>
                </>
              )}
              {view !== 'login' && (
                <button type="button" onClick={() => setAuthView('login')} className="hover:text-primary font-mono">
                  ← Back to Sign In
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// --- SCREEN 1: HOME COMPOSER ---
function HomeScreen({ experiments, setExperiments, templates, navigate }) {
  const [promptText, setPromptText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiIdeas, setAiIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const fileInputRef = useRef(null);

  // Check URL query parameters for template pre-fills (?t=id)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tmplId = urlParams.get('t');
    if (tmplId) {
      const tmpl = templates.find(t => t.id === tmplId);
      if (tmpl) {
        setPromptText(tmpl.prompt_text || tmpl.name);
      }
    }
  }, [templates]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!promptText.trim() && !imagePreview) return;

    setIsSubmitting(true);
    const newId = 'exp-' + Date.now();

    // Create immediate placeholder processing record
    const initialExp = {
      id: newId,
      title: promptText.trim() ? promptText.slice(0, 50) : "Experiment from photo",
      prompt_text: promptText,
      image_uri: imagePreview,
      status: 'processing',
      aim: '',
      requirements: [],
      procedure: [],
      observation: '',
      conclusion: '',
      principle: '',
      search_query: '',
      videos: [],
      illustration_url: null,
      generated_video_url: null,
      finalized: false,
      pinned: false,
      due_date: null,
      error: null,
      created_date: new Date().toISOString()
    };

    setExperiments(prev => [initialExp, ...prev]);

    // Navigate immediately to report view
    navigate(`/experiment/${newId}`);

    // Trigger AI pipeline in background
    try {
      const result = await runAIPipeline(promptText, imagePreview, (progressMsg) => {
        setExperiments(prev => prev.map(exp => 
          exp.id === newId ? { ...exp, error: progressMsg } : exp
        ));
      });

      setExperiments(prev => prev.map(exp => 
        exp.id === newId ? { ...exp, ...result, status: 'ready', error: null } : exp
      ));
    } catch (err) {
      setExperiments(prev => prev.map(exp => 
        exp.id === newId ? { ...exp, status: 'failed', error: err.message || 'Pipeline error' } : exp
      ));
    }
  };

  const handleSurpriseIdeas = async () => {
    setLoadingIdeas(true);
    await new Promise(r => setTimeout(r, 800));
    const sampleIdeas = [
      "Bouncing egg dissolved in vinegar acid",
      "Cell membrane osmosis with gummy bears",
      "Oobleck non-Newtonian fluid dynamics",
      "Solar oven with pizza box reflector",
      "DIY electric motor with magnet and wire"
    ];
    // Pick 3 random ideas
    const shuffled = [...sampleIdeas].sort(() => 0.5 - Math.random());
    setAiIdeas(shuffled.slice(0, 3));
    setLoadingIdeas(false);
  };

  const quickStarts = [
    { num: '01', title: 'Elephant toothpaste', prompt: 'We mixed hydrogen peroxide, soap and yeast to make elephant toothpaste.' },
    { num: '02', title: 'Starch test on a leaf', prompt: 'Boiling a variegated leaf in ethanol and testing for starch using iodine.' },
    { num: '03', title: 'Lava lamp with oil and water', prompt: 'Making a lava lamp using vegetable oil, water, food dye and effervescent tablets.' },
    { num: '04', title: 'Rainbow in a glass density column', prompt: 'Layering honey, soap, colored water, oil and rubbing alcohol into a rainbow column.' }
  ];

  return (
    <div className="max-w-3xl mx-auto pt-4 sm:pt-8 space-y-8">
      
      {/* COMPOSER CARD */}
      <div className="relative p-[1.5px] rounded-[22px] bg-gradient-to-r from-primary via-primary/50 to-primary shadow-xl shadow-primary/10">
        <div className="bg-card rounded-[20.5px] p-5 sm:p-6 space-y-4">
          <h2 className="font-mono text-2xl sm:text-3xl font-semibold tracking-tighter text-foreground leading-tight">
            What should we explore today?
          </h2>

          <textarea
            rows={4}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="What are you experimenting with? Describe it, attach a photo, or just name it…"
            className="w-full bg-background border border-input rounded-xl p-4 text-base font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary resize-none transition-all"
          />

          {imagePreview && (
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Upload preview" 
                className="w-24 h-24 object-cover rounded-xl border border-border"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                aria-label="Remove photo attachment"
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-90"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-background hover:bg-secondary border border-border px-4 py-2 rounded-full text-xs font-mono font-medium text-foreground transition-all focus-visible:outline-2 outline-offset-2 outline-primary"
              >
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                <span>Add image</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || (!promptText.trim() && !imagePreview)}
              className={`flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-mono text-sm font-semibold transition-all shadow-md ${
                !promptText.trim() && !imagePreview 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'hover:opacity-90 hover:shadow-primary/30 hover:scale-[1.02]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                <>
                  <span>Visualize</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* QUICK START GRID */}
      <div className="space-y-3">
        <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase font-semibold">
          Starter Experiments
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickStarts.map((item) => (
            <button
              key={item.num}
              onClick={() => setPromptText(item.prompt)}
              className="text-left bg-card hover:bg-secondary border border-border hover:border-primary/50 p-4 rounded-xl transition-all flex items-start gap-3 group focus-visible:outline-2 outline-offset-2 outline-primary"
            >
              <span className="font-mono text-sm font-bold text-primary">{item.num}</span>
              <span className="text-sm font-sans text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* RECENT TEMPLATES & AI SURPRISE IDEAS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase font-semibold">
            Templates & Ideas
          </span>
          <button
            onClick={handleSurpriseIdeas}
            disabled={loadingIdeas}
            className="flex items-center gap-1.5 text-xs font-mono text-primary hover:underline focus:outline-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loadingIdeas ? "Thinking of ideas…" : "✨ Surprise me with ideas"}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {templates.slice(0, 6).map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => setPromptText(tmpl.prompt_text || tmpl.name)}
              className="bg-card hover:bg-secondary border border-border hover:border-primary/40 px-3 py-1.5 rounded-full text-xs font-mono text-muted-foreground hover:text-foreground transition-all"
            >
              {tmpl.name}
            </button>
          ))}

          {aiIdeas.map((idea, idx) => (
            <button
              key={idx}
              onClick={() => setPromptText(idea)}
              className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{idea}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

// --- SCREEN 2 & COMPONENT: HISTORY DRAWER ---
function HistoryDrawer({ experiments, setExperiments, onClose, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All'); // All, Pinned, Ready, Processing, Finalized
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredExps = useMemo(() => {
    return experiments.filter(exp => {
      const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'Pinned') return exp.pinned;
      if (filter === 'Ready') return exp.status === 'ready' && !exp.finalized;
      if (filter === 'Processing') return exp.status === 'processing';
      if (filter === 'Finalized') return exp.finalized;
      return true;
    }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [experiments, searchTerm, filter]);

  const togglePin = (id) => {
    setExperiments(prev => prev.map(exp => exp.id === id ? { ...exp, pinned: !exp.pinned } : exp));
  };

  const deleteExp = (id) => {
    setExperiments(prev => prev.filter(exp => exp.id !== id));
  };

  const saveRename = (id) => {
    if (editTitle.trim()) {
      setExperiments(prev => prev.map(exp => exp.id === id ? { ...exp, title: editTitle.trim() } : exp));
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:w-[26rem] bg-secondary border-l border-border h-full p-6 flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-semibold block">
              YOUR NOTEBOOK
            </span>
            <h2 className="font-mono text-2xl font-semibold tracking-tight text-foreground">
              Chat history
            </h2>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close history"
            className="w-8 h-8 rounded-full hover:bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search experiments…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-input rounded-full pl-9 pr-4 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 mt-3 pb-3 border-b border-border">
          {['All', 'Pinned', 'Ready', 'Processing', 'Finalized'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                filter === f 
                  ? 'bg-primary text-primary-foreground font-semibold' 
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {filteredExps.length === 0 ? (
            <p className="text-xs font-mono text-muted-foreground text-center py-8">
              Nothing here yet — start a new experiment.
            </p>
          ) : (
            filteredExps.map(exp => (
              <div
                key={exp.id}
                className="group bg-card hover:bg-background border border-border rounded-xl p-3 flex items-start gap-3 transition-colors"
              >
                {/* Status Dot */}
                <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  exp.status === 'processing' ? 'bg-primary animate-ping' :
                  exp.finalized ? 'bg-chart-2' : 'bg-chart-4'
                }`} />

                <div className="flex-1 min-w-0">
                  {editingId === exp.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-background border border-input rounded px-2 py-1 text-xs font-mono w-full text-foreground"
                        autoFocus
                      />
                      <button 
                        onClick={() => saveRename(exp.id)}
                        aria-label={`Save name for ${exp.title}`}
                        className="text-primary hover:opacity-80 p-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onNavigate(`/experiment/${exp.id}`)}
                      className="text-xs font-mono font-medium text-foreground hover:text-primary transition-colors text-left truncate block w-full"
                    >
                      {exp.pinned && <Pin className="w-3 h-3 inline mr-1 text-primary rotate-45" />}
                      {exp.title}
                    </button>
                  )}

                  <span className="text-[10px] font-mono text-muted-foreground block mt-1">
                    {exp.finalized ? 'Finalized' : exp.status} · {new Date(exp.created_date || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => togglePin(exp.id)} 
                    aria-label={`Pin ${exp.title}`}
                    className="p-1 hover:text-primary text-muted-foreground"
                  >
                    <Pin className={`w-3.5 h-3.5 ${exp.pinned ? 'fill-primary text-primary' : ''}`} />
                  </button>
                  <button 
                    onClick={() => { setEditingId(exp.id); setEditTitle(exp.title); }} 
                    aria-label={`Rename ${exp.title}`}
                    className="p-1 hover:text-primary text-muted-foreground"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => deleteExp(exp.id)} 
                    aria-label={`Delete ${exp.title}`}
                    className="p-1 hover:text-destructive text-muted-foreground"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- SCREEN 3: HISTORY PAGE ---
function HistoryPage({ experiments, setExperiments, navigate }) {
  const [search, setSearch] = useState('');

  const filtered = experiments.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-mono text-3xl font-bold tracking-tight">History</h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {filtered.length} experiments in your laboratory database
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-input rounded-full pl-9 pr-4 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(exp => (
          <div
            key={exp.id}
            className="bg-card hover:bg-secondary border border-border p-4 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
            onClick={() => navigate(`/experiment/${exp.id}`)}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${exp.finalized ? 'bg-chart-2' : 'bg-chart-4'}`} />
              <div>
                <h3 className="font-mono text-sm font-semibold text-foreground hover:text-primary">
                  {exp.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {exp.aim || exp.prompt_text}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span>{exp.finalized ? 'Finalized' : 'Ready'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SCREEN 4: TEMPLATES PAGE ---
function TemplatesPage({ templates, setTemplates, navigate }) {
  const deleteTemplate = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-mono text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-sm font-sans text-muted-foreground mt-1">
          Saved drafts you can reuse for new projects — common procedures and requirements ready to go.
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center">
          <p className="text-sm font-mono text-muted-foreground">
            No templates yet — open a finished experiment and tap 'Save as template'.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tmpl) => (
            <div 
              key={tmpl.id}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-mono text-lg font-semibold text-foreground leading-snug">
                    {tmpl.name}
                  </h3>
                  <button
                    onClick={() => deleteTemplate(tmpl.id)}
                    aria-label={`Delete ${tmpl.name} template`}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-3 text-xs font-mono text-muted-foreground">
                  {tmpl.requirements?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      {tmpl.requirements.length} materials
                    </span>
                  )}
                  {tmpl.procedure?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5 text-chart-2" />
                      {tmpl.procedure.length} steps
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate(`/?t=${tmpl.id}`)}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-full font-mono text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span>Use template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- SCREEN 5: EXPERIMENT REPORT ---
function ExperimentReportPage({ experimentId, experiments, setExperiments, setTemplates, sendSlackNotification, navigate }) {
  const experiment = experiments.find(e => e.id === experimentId);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDateInput, setDueDateInput] = useState(experiment?.due_date || '');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [researchingVideos, setResearchingVideos] = useState(false);

  if (!experiment) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="font-mono text-2xl font-bold">Experiment Not Found</h2>
        <button 
          onClick={() => navigate('/')} 
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-mono text-xs"
        >
          Return to Studio
        </button>
      </div>
    );
  }

  const isProcessing = experiment.status === 'processing';

  const updateExp = (updates) => {
    setExperiments(prev => prev.map(e => e.id === experiment.id ? { ...e, ...updates } : e));
  };

  const handleFinalize = () => {
    updateExp({ finalized: true });
    sendSlackNotification({ ...experiment, finalized: true });
  };

  const handleSaveAsTemplate = () => {
    const newTmpl = {
      id: 'tmpl-' + Date.now(),
      name: experiment.title,
      prompt_text: experiment.prompt_text,
      requirements: experiment.requirements || [],
      procedure: experiment.procedure || []
    };
    setTemplates(prev => [newTmpl, ...prev]);
    setTemplateSaved(true);
  };

  const generatePDF = async () => {
    setIsPdfGenerating(true);
    try {
      const jsPDFClass = await loadJsPDF();
      const doc = new jsPDFClass({ unit: 'pt', format: 'a4' });
      const margin = 56;
      let y = margin;

      // Title
      doc.setFont('times', 'bold');
      doc.setFontSize(22);
      doc.text(experiment.title, margin, y, { maxWidth: 480 });
      y += 40;

      // Meta header
      doc.setFont('times', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`My Experiments · Lab Report · ${new Date().toLocaleDateString()}`, margin, y);
      y += 30;

      const sections = [
        { title: 'AIM', content: experiment.aim },
        { title: 'REQUIREMENTS', list: experiment.requirements },
        { title: 'PROCEDURE', list: experiment.procedure, numbered: true },
        { title: 'OBSERVATION', content: experiment.observation },
        { title: 'CONCLUSION', content: experiment.conclusion },
        { title: 'SCIENTIFIC PRINCIPLE', content: experiment.principle }
      ];

      sections.forEach(sec => {
        if (y > 750) { doc.addPage(); y = margin; }

        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(200, 50, 50); // Vermilion
        doc.text(sec.title, margin, y);
        y += 6;
        doc.setDrawColor(200);
        doc.line(margin, y, 595 - margin, y);
        y += 16;

        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(30);

        if (sec.content) {
          const lines = doc.splitTextToSize(sec.content, 480);
          doc.text(lines, margin, y);
          y += lines.length * 16 + 12;
        } else if (sec.list) {
          sec.list.forEach((item, i) => {
            const prefix = sec.numbered ? `${i + 1}. ` : '• ';
            const lines = doc.splitTextToSize(prefix + item, 460);
            doc.text(lines, margin + 10, y);
            y += lines.length * 15;
          });
          y += 12;
        }
      });

      // Diagram on new page if space is tight
      doc.addPage();
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text('LABORATORY SCHEMATIC DIAGRAM', margin, margin);
      
      doc.save(`${experiment.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_report.pdf`);
    } catch (e) {
      console.error('PDF error', e);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const calendarUrl = useMemo(() => {
    if (!experiment.due_date) return '#';
    const title = encodeURIComponent(`Report due: ${experiment.title}`);
    const dateStr = experiment.due_date.replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}T090000Z/${dateStr}T100000Z`;
  }, [experiment]);

  const handleRefreshVideos = async () => {
    setResearchingVideos(true);
    await new Promise(r => setTimeout(r, 1500));
    setResearchingVideos(false);
  };

  return (
    <div className="space-y-6">
      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>← Notebook</span>
      </button>

      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-2 max-w-3xl">
          <span className="text-xs font-mono tracking-widest uppercase font-bold text-primary block">
            {isProcessing ? 'WORKING ON IT' : experiment.error ? 'SOMETHING WENT WRONG' : 'VISUALIZED'}
          </span>
          
          <h1 className="font-mono text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-none">
            {experiment.title}
          </h1>

          {experiment.prompt_text && experiment.prompt_text !== experiment.title && (
            <p className="text-sm font-sans text-muted-foreground line-clamp-3 leading-relaxed">
              "{experiment.prompt_text}"
            </p>
          )}
        </div>

        {/* THUMBNAIL & ACTION BAR */}
        <div className="flex flex-col items-start md:items-end gap-3">
          {experiment.image_uri && (
            <img 
              src={experiment.image_uri} 
              alt="Experiment photo" 
              className="w-24 h-24 object-cover rounded-2xl border border-border shadow-md"
            />
          )}

          {!isProcessing && (
            <div className="flex flex-wrap gap-2">
              {/* Deadline */}
              {showDatePicker ? (
                <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-full">
                  <input
                    type="date"
                    value={dueDateInput}
                    onChange={e => setDueDateInput(e.target.value)}
                    className="bg-transparent text-xs font-mono px-2 py-1 text-foreground focus:outline-none"
                  />
                  <button 
                    onClick={() => { updateExp({ due_date: dueDateInput }); setShowDatePicker(false); }}
                    className="text-primary hover:opacity-80 p-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="bg-card hover:bg-secondary border border-border px-3.5 py-1.5 rounded-full text-xs font-mono text-foreground flex items-center gap-1.5 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{experiment.due_date ? `Due ${experiment.due_date}` : 'Set deadline'}</span>
                </button>
              )}

              {/* Google Calendar Link */}
              {experiment.due_date && (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-card hover:bg-secondary border border-border px-3 py-1.5 rounded-full text-xs font-mono text-foreground flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-chart-2" />
                  <span>Add to Google Calendar</span>
                </a>
              )}

              {/* Finalize button */}
              <button
                onClick={handleFinalize}
                disabled={experiment.finalized}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  experiment.finalized 
                    ? 'bg-chart-2/20 text-chart-2 border border-chart-2/40' 
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{experiment.finalized ? '✓ Finalized' : 'Mark finalized'}</span>
              </button>

              {/* Download PDF */}
              <button
                onClick={generatePDF}
                disabled={isPdfGenerating}
                className="bg-card hover:bg-secondary border border-border px-3.5 py-1.5 rounded-full text-xs font-mono text-foreground flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>{isPdfGenerating ? 'Preparing…' : 'Download PDF'}</span>
              </button>

              {/* Save Template */}
              <button
                onClick={handleSaveAsTemplate}
                disabled={templateSaved}
                className="bg-card hover:bg-secondary border border-border px-3.5 py-1.5 rounded-full text-xs font-mono text-foreground flex items-center gap-1.5 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-chart-3" />
                <span>{templateSaved ? 'Saved ✓' : 'Save as template'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: DIAGRAM & DEMOS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* DIAGRAM CARD */}
          <div className="bg-card border border-border rounded-[24px] overflow-hidden p-4 shadow-xl">
            {isProcessing ? (
              <div className="aspect-square flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-chart-2 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="font-mono text-xs text-primary animate-pulse">
                  {experiment.error || 'Understanding your experiment…'}
                </p>
              </div>
            ) : (
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-background">
                <img 
                  src={experiment.illustration_url} 
                  alt="AI Diagram"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* SOCIAL MEDIA DEMO SECTION */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-lg font-semibold bg-gradient-to-r from-foreground to-chart-3 bg-clip-text text-transparent">
                Seen across social media
              </h3>
              
              {!isProcessing && (
                <button
                  onClick={handleRefreshVideos}
                  disabled={researchingVideos}
                  className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground bg-card border border-border px-3 py-1 rounded-full transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${researchingVideos ? 'animate-spin' : ''}`} />
                  <span>Find better videos</span>
                </button>
              )}
            </div>

            {isProcessing ? (
              <div className="p-8 border border-border rounded-2xl text-center space-y-2">
                <p className="font-mono text-xs text-muted-foreground animate-pulse">
                  Searching platforms for demos…
                </p>
              </div>
            ) : experiment.videos && experiment.videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {experiment.videos.map((vid, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-2xl p-4 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
                          {vid.platform}
                        </span>
                        <a href={vid.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <h4 className="font-mono text-xs font-semibold text-foreground line-clamp-2">
                        {vid.title}
                      </h4>
                      <p className="text-[11px] font-sans text-muted-foreground line-clamp-2">
                        {vid.summary}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground pt-2 border-t border-border">
                      By {vid.creator}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <p className="text-xs font-mono text-muted-foreground">
                  No public demos were found for this one — the bot created this clip instead.
                </p>
                <div className="aspect-video bg-background rounded-xl flex items-center justify-center border border-border">
                  <Play className="w-8 h-8 text-primary opacity-60" />
                </div>
              </div>
            )}

            {/* PLATFORM SEARCH PILLS */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['YouTube', 'TikTok', 'Instagram', 'Pinterest', 'X'].map(platform => (
                <a
                  key={platform}
                  href={`https://www.google.com/search?q=${encodeURIComponent((experiment.search_query || experiment.title) + ' ' + platform)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-card hover:bg-secondary border border-border px-3 py-1 rounded-full text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 transition-all"
                >
                  <span>{platform}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ANALYSIS REPORT PANEL */}
        <div className="lg:col-span-5 bg-card border border-border rounded-[24px] p-6 space-y-6 shadow-xl sticky top-20">
          {isProcessing ? (
            <div className="h-72 flex items-center justify-center text-center">
              <p className="font-mono text-xs text-muted-foreground animate-pulse">
                Writing up the experiment…
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              
              {/* 01 AIM */}
              <div className="py-4 first:pt-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-primary">01</span>
                  <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-bold">
                    AIM
                  </span>
                </div>
                <p className="text-sm font-sans text-foreground leading-relaxed">
                  {experiment.aim}
                </p>
              </div>

              {/* 02 REQUIREMENTS */}
              <div className="py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-primary">02</span>
                  <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-bold">
                    REQUIREMENTS
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {experiment.requirements?.map((req, i) => (
                    <span 
                      key={i} 
                      className="bg-secondary border border-border px-3 py-1 rounded-full text-xs font-sans text-foreground"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              {/* 03 PROCEDURE */}
              <div className="py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-primary">03</span>
                  <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-bold">
                    PROCEDURE
                  </span>
                </div>
                <ol className="space-y-2.5">
                  {experiment.procedure?.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs font-sans text-foreground leading-relaxed">
                      <span className="font-mono font-bold text-primary text-[11px] mt-0.5">
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 04 OBSERVATION */}
              <div className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-primary">04</span>
                  <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-bold">
                    OBSERVATION
                  </span>
                </div>
                <p className="text-sm font-sans text-foreground leading-relaxed">
                  {experiment.observation}
                </p>
              </div>

              {/* 05 CONCLUSION */}
              <div className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-primary">05</span>
                  <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-bold">
                    CONCLUSION
                  </span>
                </div>
                <p className="font-mono text-lg font-semibold tracking-tight text-foreground leading-snug">
                  {experiment.conclusion}
                </p>
              </div>

              {/* 06 THE SCIENCE */}
              <div className="py-4 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-primary">06</span>
                  <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-bold">
                    THE SCIENCE
                  </span>
                </div>
                <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                  {experiment.principle}
                </p>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- 404 PAGE ---
function NotFoundPage({ navigate }) {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="font-mono text-6xl font-bold text-primary">404</h1>
      <p className="font-mono text-sm text-muted-foreground">Experiment route not located in studio index.</p>
      <button
        onClick={() => navigate('/')}
        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-mono text-xs font-semibold"
      >
        Return to Home
      </button>
    </div>
  );
}
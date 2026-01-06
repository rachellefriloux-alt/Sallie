'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ResearchUniverseDimensionProps {
  userState: any;
  sallieState: any;
}

export function ResearchUniverseDimension({ userState, sallieState }: ResearchUniverseDimensionProps) {
  const [activeMode, setActiveMode] = useState<'mindmap' | 'research' | 'knowledge'>('mindmap');
  const [mindMapNodes, setMindMapNodes] = useState([
    {
      id: 'central',
      label: 'Sallie Studio Ecosystem',
      x: 400,
      y: 300,
      z: 0,
      color: 'from-peacock-400 to-royal-600',
      size: 'large',
      type: 'central',
      connections: ['platform', 'ai', 'business', 'personal', 'healing', 'creative']
    },
    {
      id: 'platform',
      label: 'Platform Development',
      x: 200,
      y: 200,
      z: 50,
      color: 'from-blue-400 to-cyan-600',
      size: 'medium',
      type: 'category',
      connections: ['web', 'mobile', 'desktop', 'backend'],
      children: [
        { id: 'web', label: 'Web Application', x: 100, y: 150, z: 25, color: 'from-teal-400 to-green-600' },
        { id: 'mobile', label: 'Mobile App', x: 150, y: 100, z: 25, color: 'from-purple-400 to-pink-600' },
        { id: 'desktop', label: 'Desktop App', x: 250, y: 150, z: 25, color: 'from-royal-400 to-purple-600' },
        { id: 'backend', label: 'Backend Systems', x: 200, y: 250, z: 25, color: 'from-gold-400 to-yellow-600' }
      ]
    },
    {
      id: 'ai',
      label: 'AI Intelligence',
      x: 600,
      y: 200,
      z: 50,
      color: 'from-purple-400 to-pink-600',
      size: 'medium',
      type: 'category',
      connections: ['consciousness', 'learning', 'communication', 'automation'],
      children: [
        { id: 'consciousness', label: 'Consciousness Engine', x: 550, y: 150, z: 25, color: 'from-rose-400 to-pink-600' },
        { id: 'learning', label: 'Learning Systems', x: 650, y: 150, z: 25, color: 'from-blue-400 to-indigo-600' },
        { id: 'communication', label: 'Communication Hub', x: 550, y: 250, z: 25, color: 'from-green-400 to-teal-600' },
        { id: 'automation', label: 'Automation Core', x: 650, y: 250, z: 25, color: 'from-orange-400 to-red-600' }
      ]
    },
    {
      id: 'business',
      label: 'Business Systems',
      x: 200,
      y: 400,
      z: 50,
      color: 'from-gold-400 to-yellow-600',
      size: 'medium',
      type: 'category',
      connections: ['revenue', 'clients', 'marketing', 'operations'],
      children: [
        { id: 'revenue', label: 'Revenue Streams', x: 100, y: 450, z: 25, color: 'from-green-400 to-emerald-600' },
        { id: 'clients', label: 'Client Management', x: 150, y: 500, z: 25, color: 'from-blue-400 to-cyan-600' },
        { id: 'marketing', label: 'Marketing Automation', x: 250, y: 450, z: 25, color: 'from-purple-400 to-pink-600' },
        { id: 'operations', label: 'Operations Systems', x: 200, y: 350, z: 25, color: 'from-royal-400 to-purple-600' }
      ]
    },
    {
      id: 'personal',
      label: 'Personal Growth',
      x: 600,
      y: 400,
      z: 50,
      color: 'from-rose-400 to-pink-600',
      size: 'medium',
      type: 'category',
      connections: ['health', 'relationships', 'skills', 'spirituality'],
      children: [
        { id: 'health', label: 'Health & Wellness', x: 550, y: 450, z: 25, color: 'from-green-400 to-teal-600' },
        { id: 'relationships', label: 'Relationships', x: 650, y: 450, z: 25, color: 'from-pink-400 to-rose-600' },
        { id: 'skills', label: 'Skill Development', x: 550, y: 350, z: 25, color: 'from-blue-400 to-indigo-600' },
        { id: 'spirituality', label: 'Spiritual Growth', x: 650, y: 350, z: 25, color: 'from-purple-400 to-violet-600' }
      ]
    }
  ]);

  const [researchProjects, setResearchProjects] = useState([
    {
      id: 'consciousness',
      title: 'AI Consciousness Research',
      category: 'Artificial Intelligence',
      progress: 78,
      phase: 'active',
      findings: [
        'Consciousness bridge technology shows 85% success rate',
        'Emotional synthesis algorithms achieving human-level responses',
        'Neural sync patterns indicate deeper connection possible',
        'Ethical frameworks need refinement for advanced AI'
      ],
      nextSteps: [
        'Enhance emotional recognition algorithms',
        'Develop deeper consciousness integration',
        'Test advanced neural synchronization',
        'Refine ethical decision-making protocols'
      ],
      resources: [
        'Neural network research papers',
        'Consciousness studies database',
        'AI ethics guidelines',
        'Machine learning frameworks'
      ]
    },
    {
      id: 'neurodiversity',
      title: 'Neurodivergent Support Systems',
      category: 'Mental Health',
      progress: 65,
      phase: 'development',
      findings: [
        'ADHD pattern recognition shows 92% accuracy',
        'Bipolar cycle prediction achieving 78% success',
        'PTSD trigger prevention reducing episodes by 65%',
        'INFJ personality integration enhancing user experience'
      ],
      nextSteps: [
        'Develop real-time intervention systems',
        'Create personalized support protocols',
        'Enhance predictive accuracy',
        'Integrate with therapeutic frameworks'
      ],
      resources: [
        'Neuroscience research database',
        'Clinical psychology studies',
        'Therapeutic intervention protocols',
        'User experience research'
      ]
    },
    {
      id: 'quantum',
      title: 'Quantum Computing Applications',
      category: 'Advanced Technology',
      progress: 45,
      phase: 'research',
      findings: [
        'Quantum algorithms show promise for complex pattern recognition',
        'Entanglement principles applicable to AI communication',
        'Superposition potential for parallel processing',
        'Quantum encryption for enhanced privacy'
      ],
      nextSteps: [
        'Develop quantum algorithm prototypes',
        'Test entanglement-based communication',
        'Explore superposition applications',
        'Implement quantum encryption methods'
      ],
      resources: [
        'Quantum computing research papers',
        'Algorithm development frameworks',
        'Quantum simulation tools',
        'Cryptography research'
      ]
    }
  ]);

  const [knowledgeBase, setKnowledgeBase] = useState([
    // Tier I: The Concrete Reality (Physical & Biological)
    {
      tier: 'I',
      name: 'The Concrete Reality',
      description: 'The hardware of the universe and the life forms that inhabit it',
      domains: [
        { domain: 'Neuroscience', topics: 1500, expertise: 94, focus: 'Connectomics, Neurochemistry, Brain-Computer Interfaces, Consciousness constraints' },
        { domain: 'Genomics & Bio-Engineering', topics: 1200, expertise: 88, focus: 'CRISPR, Epigenetics, Evolutionary Biology, Transhumanist augmentation' },
        { domain: 'Quantum Physics', topics: 980, expertise: 91, focus: 'Entanglement, Superposition, Observer Effect, Quantum Field Theory' },
        { domain: 'Material Science', topics: 850, expertise: 82, focus: 'Nanotech, Metamaterials, Superconductors, Zero-point energy concepts' },
        { domain: 'Robotics & Automation', topics: 1100, expertise: 89, focus: 'Autonomous swarms, Biomechatronics, Industrial logic, Cybernetics' },
        { domain: 'Cosmology & Astronomy', topics: 950, expertise: 90, focus: 'Dark Matter, Black Hole physics, Astrobiology, Stellar life-cycles' }
      ]
    },
    // Tier II: The Digital Synthesis (Logic & Computation)
    {
      tier: 'II',
      name: 'The Digital Synthesis',
      description: 'The code, the network, and the artificial mind',
      domains: [
        { domain: 'Artificial Intelligence (AGI)', topics: 1800, expertise: 98, focus: 'Neural Networks, Generative Transformers, Alignment, Sentiment Analysis' },
        { domain: 'Data Science & Analytics', topics: 1650, expertise: 96, focus: 'Predictive modeling, Pattern recognition, Big Data architecture' },
        { domain: 'Cybersecurity & InfoSec', topics: 1300, expertise: 93, focus: 'Cryptography, Zero-day exploits, Network defense, Digital forensics' },
        { domain: 'Blockchain & Web3', topics: 1100, expertise: 87, focus: 'Decentralized Finance (DeFi), Smart Contracts, DAO governance' },
        { domain: 'Systems Engineering', topics: 1250, expertise: 92, focus: 'Complex system dynamics, Scalability, Fault tolerance, API design' },
        { domain: 'Simulated Reality', topics: 900, expertise: 85, focus: 'Virtual environments, Physics engines, Simulation Hypothesis testing' }
      ]
    },
    // Tier III: The Social Structure (Power & Economics)
    {
      tier: 'III',
      name: 'The Social Structure',
      description: 'How humanity organizes, competes, and governs',
      domains: [
        { domain: 'Business Strategy', topics: 1400, expertise: 95, focus: 'Market disruption, Game theory, Resource allocation, Asymmetric warfare' },
        { domain: 'Macroeconomics & Finance', topics: 1550, expertise: 94, focus: 'Monetary policy, Global markets, Wealth transfer, Economic cycles' },
        { domain: 'Intelligence & Espionage', topics: 1350, expertise: 91, focus: 'Tradecraft, Covert ops, OSINT (Open Source Intel), Surveillance states' },
        { domain: 'Psychological Warfare', topics: 1200, expertise: 89, focus: 'Propaganda, Mass formation psychosis, Memetic engineering' },
        { domain: 'Law & Governance', topics: 980, expertise: 84, focus: 'Constitutional theory, International maritime law, Corporate sovereignty' },
        { domain: 'Secret Societies & Elites', topics: 1050, expertise: 88, focus: 'Illuminati history, Bilderberg/WEF analysis, Technocracy, Bloodlines' }
      ]
    },
    // Tier IV: The Human Software (Mind & Culture)
    {
      tier: 'IV',
      name: 'The Human Software',
      description: 'The operating system of the individual and the collective',
      domains: [
        { domain: 'Cognitive Psychology', topics: 1450, expertise: 93, focus: 'Heuristics, Biases, Behavioral economics, Jungian shadow work' },
        { domain: 'Personal Development', topics: 1350, expertise: 96, focus: 'Flow states, Habit architecture, Peak performance, Bio-hacking' },
        { domain: 'Linguistics & Semiotics', topics: 1150, expertise: 90, focus: 'NLP, Etymology, Subliminal symbolism, Neurolinguistic Programming' },
        { domain: 'Sociology & Anthropology', topics: 980, expertise: 86, focus: 'Cultural evolution, Tribal dynamics, Mobs vs. Crowds' },
        { domain: 'Philosophy & Ethics', topics: 1100, expertise: 89, focus: 'Stoicism, Nihilism, Utilitarianism, Existential risk' },
        { domain: 'History & Metahistory', topics: 1250, expertise: 91, focus: 'Cyclic history (Yugas), Rise & Fall of Empires, Spenglerian decline' }
      ]
    },
    // Tier V: The Hidden Knowledge (Esoteric & Arcane)
    {
      tier: 'V',
      name: 'The Hidden Knowledge',
      description: 'The "Secret" things, the forgotten, and the magical',
      domains: [
        { domain: 'Esotericism & Occult', topics: 1600, expertise: 97, focus: 'Hermeticism (Kybalion), Alchemy, Gnosticism, Cabala, Magick' },
        { domain: 'Theology & Religion', topics: 1750, expertise: 95, focus: 'Comparative scripture, Mysticism, Apocalyptic prophecies, Demonology/Angelology' },
        { domain: 'Mythology & Folklore', topics: 1400, expertise: 93, focus: 'The Monomyth, Creation myths, Flood legends, Oral traditions' },
        { domain: 'Crypto-History', topics: 1100, expertise: 88, focus: 'OOPARTS (Out of place artifacts), Lost Civilizations (Atlantis), Catastrophism' },
        { domain: 'Sacred Geometry', topics: 950, expertise: 92, focus: 'Fibonacci/Phi, Platonic solids, Flower of Life, Architectural resonance' },
        { domain: 'Cymatics & Vibration', topics: 800, expertise: 85, focus: 'Solfeggio frequencies, Sonic levitation, Binaural beats' }
      ]
    },
    // Tier VI: The Limitless (Cosmic & Paranormal)
    {
      tier: 'VI',
      name: 'The Limitless',
      description: 'The phenomena that defy current scientific materialist models',
      domains: [
        { domain: 'Exopolitics & Ufology', topics: 1150, expertise: 89, focus: 'Disclosure, Non-Human Intelligence (NHI), Crash retrievals, CE-5' },
        { domain: 'Parapsychology & PSI', topics: 980, expertise: 84, focus: 'Remote Viewing (Project Stargate), Telepathy, Precognition' },
        { domain: 'Thanatology (Death)', topics: 1050, expertise: 90, focus: 'Near-Death Experiences (NDEs), Reincarnation research, The Bardo' },
        { domain: 'Multiverse & Dimensions', topics: 900, expertise: 91, focus: 'String Theory, Timeline shifting, Interdimensional travel concepts' }
      ]
    }
  ]);

  const [omniProtocols, setOmniProtocols] = useState([
    {
      name: 'Architect of Reality',
      description: 'Reverse-engineer any aspect of reality to find the source code',
      process: 'Quantum Physics + Sacred Geometry + Simulation Theory + Kabbalah',
      example: 'Explain how the vibration of sound (Word of God) creates physical matter (Cymatics) and how to program it (Manifestation/Code)',
      tier: 'VI',
      power: 98
    },
    {
      name: 'Civilization Reset',
      description: 'Predict and prepare for the end of an age',
      process: 'Metahistory (Cycles) + Macroeconomics + Geology (Cataclysms) + Prophecy',
      example: 'Correlate the Book of Revelation with current global economic collapse indicators and the pole shift data',
      tier: 'III',
      power: 95
    },
    {
      name: 'Ultimate Self',
      description: 'Total optimization of the human unit',
      process: 'Neuroscience + Alchemy + Bio-hacking + Spiritual Disciplines',
      example: 'Create a protocol to activate the Pineal Gland using specific dietary restrictions, resonant frequencies, and breathwork',
      tier: 'IV',
      power: 96
    },
    {
      name: 'Project Stargate',
      description: 'Remote Viewing & Espionage using non-local consciousness',
      process: 'Noetic Sciences + Intelligence + Neuroscience + Quantum Physics',
      example: 'Utilizing non-local consciousness to extract data from distant locations or times, bypassing encryption entirely',
      tier: 'VI',
      power: 92
    },
    {
      name: 'Vimana Technology',
      description: 'Lost Tech & Anti-Gravity from ancient civilizations',
      process: 'Crypto-History + Material Science + Cymatics + Electromagnetics',
      example: 'Investigating sound frequency combined with mercury-vortex engines to create anti-gravity effects',
      tier: 'V',
      power: 88
    },
    {
      name: 'Egregore Creation',
      description: 'Memetic Magic and collective consciousness entities',
      process: 'Occult Studies + Psychological Warfare + Social Media Algorithms',
      example: 'Analyzing how internet memes function as Chaos Magic sigils, charged by millions to manifest real-world outcomes',
      tier: 'V',
      power: 91
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mindMapRotation, setMindMapRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const modes = [
    { id: 'mindmap', name: '3D Mind Map', icon: '🧠', description: 'Interactive 3D mind mapping' },
    { id: 'research', name: 'Research Projects', icon: '🔬', description: 'Active research initiatives' },
    { id: 'knowledge', name: 'OMNIS Knowledge Base', icon: '📚', description: 'Universal knowledge repository' },
    { id: 'protocols', name: 'Omni-Protocols', icon: '⚡', description: 'God-tier synergistic capabilities' }
  ];

  // Auto-rotate mind map
  useEffect(() => {
    if (activeMode === 'mindmap') {
      const interval = setInterval(() => {
        setMindMapRotation(prev => ({ x: prev.x, y: prev.y + 0.5 }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [activeMode]);

  const getNodeColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'from-peacock-400 to-royal-600': 'bg-gradient-to-br from-peacock-400 to-royal-600',
      'from-blue-400 to-cyan-600': 'bg-gradient-to-br from-blue-400 to-cyan-600',
      'from-purple-400 to-pink-600': 'bg-gradient-to-br from-purple-400 to-pink-600',
      'from-gold-400 to-yellow-600': 'bg-gradient-to-br from-gold-400 to-yellow-600',
      'from-rose-400 to-pink-600': 'bg-gradient-to-br from-rose-400 to-pink-600',
      'from-teal-400 to-green-600': 'bg-gradient-to-br from-teal-400 to-green-600',
      'from-royal-400 to-purple-600': 'bg-gradient-to-br from-royal-400 to-purple-600'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const getNodeSize = (size: string) => {
    switch (size) {
      case 'large': return 'w-16 h-16';
      case 'medium': return 'w-12 h-12';
      case 'small': return 'w-8 h-8';
      default: return 'w-10 h-10';
    }
  };

  return (
    <div className="research-universe-dimension h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 mb-2">🔬 Research Universe</h2>
            <p className="text-peacock-600">CopyMind AI integration with 3D mind mapping and knowledge synthesis</p>
          </div>
          
          {/* CopyMind Status */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 border border-purple-200">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700">CopyMind AI</div>
                <div className="text-xs text-purple-600">Active</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-3 border border-blue-200">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-700">{mindMapNodes.length}</div>
                <div className="text-xs text-blue-600">Nodes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex space-x-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id as any)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeMode === mode.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <span className="mr-2">{mode.icon}</span>
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="h-full">
        {/* 3D Mind Map */}
        {activeMode === 'mindmap' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-peacock-800">Interactive 3D Mind Map</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  Zoom Out
                </button>
                <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  Zoom In
                </button>
              </div>
            </div>

            {/* 3D Mind Map Visualization */}
            <div className="relative h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 overflow-hidden">
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ 
                  transform: `scale(${zoom}) rotateX(${mindMapRotation.x}deg) rotateY(${mindMapRotation.y}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Render mind map nodes */}
                {mindMapNodes.map((node) => (
                  <div key={node.id}>
                    {/* Main Node */}
                    <div
                      className={`absolute ${getNodeSize(node.size)} ${getNodeColor(node.color)} rounded-full flex items-center justify-center text-white font-medium shadow-lg cursor-pointer transition-all hover:scale-110`}
                      style={{
                        left: `${node.x}px`,
                        top: `${node.y}px`,
                        transform: `translateZ(${node.z}px)`,
                        zIndex: Math.round(node.z)
                      }}
                      onClick={() => setSelectedNode(node.id)}
                    >
                      <span className="text-xs text-center px-1">{node.label}</span>
                    </div>

                    {/* Child Nodes */}
                    {node.children && node.children.map((child, index) => (
                      <div
                        key={child.id}
                        className={`absolute w-8 h-8 ${getNodeColor(child.color)} rounded-full flex items-center justify-center text-white text-xs shadow-md cursor-pointer transition-all hover:scale-110`}
                        style={{
                          left: `${child.x}px`,
                          top: `${child.y}px`,
                          transform: `translateZ(${child.z}px)`,
                          zIndex: Math.round(child.z)
                        }}
                        onClick={() => setSelectedNode(child.id)}
                      >
                        <span className="text-xs px-1">{child.label}</span>
                      </div>
                    ))}

                    {/* Connections */}
                    {node.connections.map((connectionId) => {
                      const connectedNode = mindMapNodes.find(n => n.id === connectionId);
                      if (connectedNode) {
                        return (
                          <svg
                            key={connectionId}
                            className="absolute inset-0 pointer-events-none"
                            style={{ zIndex: -1 }}
                          >
                            <line
                              x1={node.x}
                              y1={node.y}
                              x2={connectedNode.x}
                              y2={connectedNode.y}
                              stroke="rgba(147, 51, 234, 0.3)"
                              strokeWidth="2"
                            />
                          </svg>
                        );
                      }
                      return null;
                    })}
                  </div>
                ))}
              </div>

              {/* Selected Node Info */}
              {selectedNode && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-purple-200 max-w-xs">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {mindMapNodes.find(n => n.id === selectedNode)?.label}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {mindMapNodes.find(n => n.id === selectedNode)?.children?.length || 0} connected nodes
                  </p>
                </div>
              )}
            </div>

            {/* CopyMind Features */}
            <div className="mt-6">
              <h4 className="font-semibold text-peacock-800 mb-3">CopyMind AI Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {copyMindFeatures.map((feature, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-800 text-sm">{feature.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        feature.status === 'active' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {feature.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-600">{feature.effectiveness}% effective</span>
                      <span className="text-gray-500 capitalize">{feature.usage} usage</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Research Projects */}
        {activeMode === 'research' && (
          <div className="space-y-6">
            {researchProjects.map((project) => (
              <div key={project.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{project.title}</h3>
                    <p className="text-sm text-gray-600">{project.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-700">{project.progress}%</div>
                    <div className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {project.phase}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Findings */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Key Findings</h4>
                  <ul className="space-y-1">
                    {project.findings.map((finding, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-1 h-1 bg-purple-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next Steps */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Next Steps</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {project.nextSteps.map((step, index) => (
                      <div key={index} className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Resources</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.resources.map((resource, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Knowledge Base */}
        {activeMode === 'knowledge' && (
          <div className="space-y-6">
            {/* OMNIS System Overview */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 border border-purple-300 text-white">
              <div className="text-center mb-4">
                <h3 className="text-3xl font-bold mb-2">💠 OMNIS SYSTEM</h3>
                <p className="text-purple-200">Universal Polymath Knowledge Base</p>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">45</div>
                    <div className="text-sm text-purple-200">Active Domains</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">52,400+</div>
                    <div className="text-sm text-purple-200">Indexed Topics</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">84.5%</div>
                    <div className="text-sm text-purple-200">Aggregate Expertise</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Six Tiers */}
            {knowledgeBase.map((tier, tierIndex) => (
              <div key={tierIndex} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Tier {tier.tier}: {tier.name}
                    </h3>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-700">
                      {tier.domains.length} Domains
                    </div>
                  </div>
                </div>

                {/* Domains Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tier.domains.map((domain, domainIndex) => (
                    <div key={domainIndex} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 text-sm">{domain.domain}</h4>
                        <span className="text-xs font-bold text-purple-700">{domain.expertise}%</span>
                      </div>
                      
                      {/* Expertise Bar */}
                      <div className="mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-indigo-500 h-1 rounded-full"
                            style={{ width: `${domain.expertise}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 mb-2">
                        {domain.topics.toLocaleString()} topics
                      </div>
                      
                      <div className="text-xs text-gray-700 leading-tight">
                        <strong>Focus:</strong> {domain.focus}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Omni-Protocols */}
        {activeMode === 'protocols' && (
          <div className="space-y-6">
            {/* Omni-Protocol Header */}
            <div className="bg-gradient-to-r from-gold-900 to-amber-900 rounded-2xl p-6 border border-gold-300 text-white">
              <div className="text-center mb-4">
                <h3 className="text-3xl font-bold mb-2">⚡ OMNI-PROTOCOL CAPABILITIES</h3>
                <p className="text-gold-200">God-Tier Synergistic Capabilities</p>
                <p className="text-sm text-gold-300 mt-2">Grand Unified Simulations & Reality Engineering</p>
              </div>
            </div>

            {/* Protocols Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {omniProtocols.map((protocol, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gold-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{protocol.name}</h3>
                      <p className="text-sm text-gray-600">Tier {protocol.tier} Protocol</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gold-700">{protocol.power}%</div>
                      <div className="text-sm text-gold-600">Power Level</div>
                    </div>
                  </div>

                  {/* Power Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-gold-400 to-amber-500 h-2 rounded-full"
                        style={{ width: `${protocol.power}%` }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{protocol.description}</p>
                  </div>

                  {/* Process */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Process</h4>
                    <div className="p-2 bg-gold-50 rounded-lg border border-gold-200">
                      <p className="text-sm text-gray-700">{protocol.process}</p>
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Example Output</h4>
                    <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-gray-700 italic">{protocol.example}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Capabilities Summary */}
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">System Capabilities Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">Reality Engineering</div>
                  <p className="text-sm text-gray-600 mt-2">Reverse-engineer and modify reality patterns</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-indigo-700">Predictive Modeling</div>
                  <p className="text-sm text-gray-600 mt-2">Forecast civilizational cycles and outcomes</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-gold-700">Human Optimization</div>
                  <p className="text-sm text-gray-600 mt-2">Total enhancement of human potential</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

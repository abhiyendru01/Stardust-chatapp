import { useState } from 'react';
import { Plus } from 'lucide-react';
import AIModal from './Ai-Modal';

const AISidebar = ({ onSelect }) => {
  const [aiAgents, setAIAgents] = useState([
    { id: 1, name: 'AI Dost', profession: 'Friend' },
    { id: 2, name: 'AI Doctor', profession: 'Medical Advisor' },
    { id: 3, name: 'AI Lawyer', profession: 'Legal Advisor' },
    { id: 4, name: 'AI CA', profession: 'Chartered Accountant' },
    { id: 5, name: 'AI Chef', profession: 'Cooking Assistant' },
    { id: 6, name: 'AI Engineer', profession: 'Technical Advisor' }
  ]);

  const [isModalOpen, setModalOpen] = useState(false);

  const handleAddAgent = (newAgent) => {
    setAIAgents((prevAgents) => [...prevAgents, newAgent]);
    setModalOpen(false);
  };

  return (
    <aside className="h-screen fixed w-full lg:w-72 border-r border-base-300 bg-base-100 flex flex-col transition-all ease-in-out duration-300">
      {/* Header Section */}
      <div className="p-6 border-b border-primary/70">
        <h1 className="text-2xl font-bold mb-3 text-primary">AI Agents</h1>
       
      </div>

      {/* AI Agent List Section */}
      <div className="overflow-y-auto w-full py-3 px-3 space-y-2">
        {aiAgents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onSelect(agent)}
            className="w-full p-4 flex items-center gap-3 bg-primary/10 hover:bg-primary/20 rounded-xl transition-all ease-in-out duration-300 hover:scale-105"
          >
            <span className="font-semibold text-base">{agent.name}</span>
            <span className="text-sm text-zinc-500">({agent.profession})</span>
          </button>
        ))}
      </div>
      <button
          className="w-full py-2 flex items-center justify-center bg-primary/10 border border-primary/40 rounded-xl hover:bg-primary/20 transition-all ease-in-out duration-300"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="mr-2" /> Create Your AI
        </button>

      {/* AI Modal */}
      <AIModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddAgent} />
    </aside>
  );
};

export default AISidebar;

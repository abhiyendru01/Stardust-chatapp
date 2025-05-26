import { useState } from 'react';

const AiModal = ({ isOpen, onClose, onCreate }) => {
  const [aiName, setAiName] = useState('');
  const [aiProfession, setAiProfession] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiTone, setAiTone] = useState('');

  const handleSubmit = () => {
    if (aiName && aiProfession && aiKeywords && aiTone) {
      onCreate({ aiName, aiProfession, aiKeywords, aiTone });
      onClose();
    } else {
      alert("Please fill all fields.");
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
      <div className="bg-base-300 backdrop:blur-md p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Create AI Chat</h2>

        <label className="block mb-2">AI Name</label>
        <input
          type="text"
          value={aiName}
          onChange={(e) => setAiName(e.target.value)}
          placeholder="Enter AI Name"
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block mb-2">Profession</label>
        <input
          type="text"
          value={aiProfession}
          onChange={(e) => setAiProfession(e.target.value)}
          placeholder="Enter Profession (e.g., Lawyer)"
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block mb-2">Keywords</label>
        <input
          type="text"
          value={aiKeywords}
          onChange={(e) => setAiKeywords(e.target.value)}
          placeholder="Enter Keywords"
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block mb-2">AI Tone</label>
        <input
          type="text"
          value={aiTone}
          onChange={(e) => setAiTone(e.target.value)}
          placeholder="Enter AI Tone (e.g., Formal, Friendly)"
          className="w-full p-2 mb-4 border rounded"
        />

        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-primary text-secondary-content rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-primary-content rounded">Create AI</button>
        </div>
      </div>
    </div>
  );
};

export default AiModal;

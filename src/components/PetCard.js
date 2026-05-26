import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';

const animalEmojis = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', rabbit: '🐰', other: '🐾' };

const getPetAvatarUrl = (pet) => {
  const seed = `${pet.name || pet.type || 'pet'}-${pet.breed || 'portrait'}`.trim();
  return `https://api.dicebear.com/6.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=F8FAFC,DBEAFE&radius=30`;
};

const PetCard = ({ pet, petIndex, onEdit, onDelete }) => {
  const handleEdit = () => onEdit(pet, petIndex);
  const handleDelete = () => onDelete(petIndex);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-lg flex items-center justify-center">
          <img
            src={getPetAvatarUrl(pet)}
            alt={`Avatar humain de ${pet.name || pet.type}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://api.dicebear.com/6.x/adventurer/svg?seed=pet-default&backgroundType=gradientLinear&backgroundColor=F8FAFC,DBEAFE&radius=30';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{pet.name}</h3>
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-1">
            {animalEmojis[pet.type]} {pet.type.toUpperCase()}
            {pet.breed && <span className="text-gray-500 font-normal">· {pet.breed}</span>}
          </div>
          {pet.birthDate && (
            <p className="text-sm text-gray-500">
              {new Date().getFullYear() - new Date(pet.birthDate).getFullYear()} ans
            </p>
          )}
          {pet.weight && (
            <p className="text-sm text-gray-500">
              {pet.weight} kg
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleEdit} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 hover:text-blue-700 transition-colors">
            <Edit size={18} />
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-red-50 rounded-xl text-red-600 hover:text-red-700 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      {pet.notes && (
        <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-xl">
          "{pet.notes}"
        </p>
      )}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <span>ID: {petIndex}</span>
      </div>
    </motion.div>
  );
};

export default PetCard;

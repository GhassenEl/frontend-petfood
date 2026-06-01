import api from './httpClient';

export async function sendMessage(message, context = null, toUserId = null) {
  const payload = { message };
  if (context) payload.context = context;
  if (toUserId) payload.toUserId = toUserId;
  const { data } = await api.post('/chat/message', payload);
  return data;
}

export async function sendVetHealthAssist({ message, mode, pet }) {
  return sendMessage(message, {
    type: 'vet_health_assist',
    mode,
    pet: pet
      ? { name: pet.name, type: pet.type || pet.animalType, id: pet.id || pet._id }
      : null,
  });
}

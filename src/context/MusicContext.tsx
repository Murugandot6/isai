const canDeleteMemory = (memoryId: string) => {
  const memory = memories.find(m => m.id === memoryId);
  return memory && memory.userId === user?.id;
};

deleteMemory: (memoryId: string) => {
  if (!canDeleteMemory(memoryId)) {
    toast.error('You do not have permission to delete this memory.');
    return;
  }
  // existing delete logic...
};
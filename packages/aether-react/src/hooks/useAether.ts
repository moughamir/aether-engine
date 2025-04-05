import { useContext } from 'react';
import { AetherContext } from '../context/AetherContext';

export const useAether = () => {
  const context = useContext(AetherContext);
  
  if (context === undefined) {
    throw new Error('useAether must be used within an AetherProvider');
  }
  
  return context;
};
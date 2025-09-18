import React, { useEffect, useState } from 'react';
import userDataService from '../services/UserDataService';

// Helper to scan pets and actions (stub for now, replace with backend or fs API)
// Empty Tamagotchi state for fresh build
const getShopPets = () => [];
const getPetActions = pet => [];
const getPetActionGif = (pet, action) => '';

export default function TamagotchiPage() {
  const [shopPets, setShopPets] = useState([]);
  const [purchased, setPurchased] = useState({});
  const [currentMascot, setCurrentMascot] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [mascotXP, setMascotXP] = useState({});
  const [actionInterval, setActionInterval] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  // Load tamagotchi data from backend on mount
  useEffect(() => {
    // Empty state: no pets, no actions, no XP
    setShopPets([]);
    setPurchased({});
    setCurrentMascot(null);
    setCurrentAction(null);
    setMascotXP({});
  }, []);

  useEffect(() => {
  // No-op for empty state
  }, []);

  useEffect(() => {
    if (actionInterval) clearInterval(actionInterval);
    const interval = setInterval(() => {
      cycleAction();
    }, 60000);
    setActionInterval(interval);
    return () => clearInterval(interval);
  }, [currentMascot, currentAction]);

  function cycleAction() {
    const actions = getPetActions(currentMascot);
    let idx = actions.indexOf(currentAction);
    idx = (idx + 1) % actions.length;
    setCurrentAction(actions[idx]);
  }

  function setAction(action) {
    setCurrentAction(action);
    setMascotXP(xp => {
      const newXP = { ...xp, [currentMascot]: (xp[currentMascot] || 0) + 0.2 };
      userDataService.saveTamagotchiData(newXP, purchased);
      return newXP;
    });
  }

  function buyMascot(pet) {
    setPurchased(p => {
      const newPurchased = { ...p, [pet]: { name: pet.replace(/\b\w/g, l => l.toUpperCase()) } };
      setMascotXP(xp => {
        const newXP = { ...xp, [pet]: 0 };
        userDataService.saveTamagotchiData(newXP, newPurchased);
        return newXP;
      });
      setCurrentMascot(pet);
      setCurrentAction(getPetActions(pet)[0]);
      return newPurchased;
    });
  }

  function openEditModal() {
    setRenameValue(purchased[currentMascot]?.name || currentMascot);
    setEditModalOpen(true);
  }
  function handleRename() {
    setPurchased(p => {
      const newPurchased = { ...p, [currentMascot]: { ...p[currentMascot], name: renameValue } };
      userDataService.saveTamagotchiData(mascotXP, newPurchased);
      setEditModalOpen(false);
      return newPurchased;
    });
  }

  // XP/Level logic
  function calcTamaLevel(mascot) {
    let userLevel = 5;
    let userPart = userLevel * 0.5;
    let xpPart = tamaLevelFromXP(mascot);
    return Math.floor(userPart + xpPart);
  }
  function tamaLevelFromXP(mascot) {
    let level = 1;
    let xp = mascotXP[mascot] || 0;
    let req = 100;
    while (xp >= req) {
      xp -= req;
      level++;
      req = Math.floor(100 * (1 + 0.05 * level));
    }
    return level * 0.5;
  }

  return (
    <div className="container" style={{ maxWidth: 600, margin: '40px auto', padding: 32, background: '#222', borderRadius: 16, color: '#fff' }}>
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '1em', marginBottom: '2em' }}>
        <span style={{ fontSize: '2em' }}>👀</span>
        <h1 style={{ margin: 0 }}>Tamagotchi</h1>
      </div>
      <div style={{ margin: '32px auto 0 auto', textAlign: 'center', color: '#ccc', fontSize: '1.1em' }}>
        <p>No Tamagotchi pets yet.<br />Start building your Tamagotchi here!</p>
      </div>
    </div>
  );
}

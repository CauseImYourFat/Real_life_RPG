

import React, { useState, useEffect } from 'react';
import userDataService from '../services/UserDataService';

function TamagotchiPage({ gneePoints, setUserData }) {
  // State variables
  const [petActions] = useState(['wake']);
  const [currentAction, setCurrentAction] = useState('wake');
  const [currentMascot, setCurrentMascot] = useState(null);
  const [petXP, setPetXP] = useState({});
  const [petLevel, setPetLevel] = useState({});
  const [petReqXP, setPetReqXP] = useState({});
  const [purchased, setPurchased] = useState({});
  const [shopPets, setShopPets] = useState([]);
  // gneePoints is now a prop from App.js
  const [xpBoost, setXpBoost] = useState(null);
  const [hiveTab, setHiveTab] = useState('pets');
  const [shopOpen, setShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState('pets');
  const [hiveOpen, setHiveOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // Food files
  const foodFiles = [
    'bun.gif', 'candy.gif', 'drink.gif', 'fastfood.gif', 'kewto.gif', 'matcha.gif', 'noddle.gif', 'salmon eggs.gif', 'sushi salmon.gif', 'sushi.gif', 'sushi2.gif', 'sushii1.gif', 'tempura.gif', 'tofu.gif', 'wraped sushi.gif'
  ];

  // XP boost logic for pet actions
  const getXpWithBoost = (baseXp) => {
    if (xpBoost && xpBoost.expires > Date.now()) {
      return Math.floor(baseXp * 1.1 * 10) / 10; // 10% boost, round to 0.1
    }
    return baseXp;
  };

  const handleAction = (action) => {
    setCurrentAction(action);
    if (!currentMascot) return;
    setPetXP(prev => {
      const currXP = prev[currentMascot] ?? 0;
      const currLevel = petLevel[currentMascot] ?? 1;
      const currReqXP = petReqXP[currentMascot] ?? 100;
      const newXP = getXpWithBoost(0.1) + currXP;
      if (newXP >= currReqXP) {
        // Level up
        const nextLevel = currLevel + 1;
        const nextReqXP = Math.round(currReqXP + 0.05 * nextLevel * currReqXP);
        setPetLevel(lvlPrev => ({ ...lvlPrev, [currentMascot]: nextLevel }));
        setPetReqXP(reqPrev => ({ ...reqPrev, [currentMascot]: nextReqXP }));
        userDataService.saveTamagotchiData?.({ ...prev, [currentMascot]: 0 }, purchased);
        return { ...prev, [currentMascot]: 0 };
      }
      userDataService.saveTamagotchiData?.({ ...prev, [currentMascot]: newXP }, purchased);
      return { ...prev, [currentMascot]: newXP };
    });
  };

  useEffect(() => {
    if (!currentMascot) return;
    const interval = setInterval(() => {
      setPetXP(prev => {
        const currXP = prev[currentMascot] ?? 0;
        const currLevel = petLevel[currentMascot] ?? 1;
        const currReqXP = petReqXP[currentMascot] ?? 100;
        const newXP = currXP + 1;
        if (newXP >= currReqXP) {
          // Level up
          const nextLevel = currLevel + 1;
          const nextReqXP = Math.round(currReqXP + 0.05 * nextLevel * currReqXP);
          setPetLevel(lvlPrev => ({ ...lvlPrev, [currentMascot]: nextLevel }));
          setPetReqXP(reqPrev => ({ ...reqPrev, [currentMascot]: nextReqXP }));
          userDataService.saveTamagotchiData?.({ ...prev, [currentMascot]: 0 }, purchased);
          return { ...prev, [currentMascot]: 0 };
        }
        userDataService.saveTamagotchiData?.({ ...prev, [currentMascot]: newXP }, purchased);
        return { ...prev, [currentMascot]: newXP };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [currentMascot, purchased, petLevel, petReqXP]);

  // Handle mascot edit (rename)
  const openEditModal = () => {
    setRenameValue(purchased[currentMascot]?.name || currentMascot);
    setEditModalOpen(true);
  };
  const handleRename = async () => {
    await userDataService.editPet(currentMascot, { name: renameValue });
    setEditModalOpen(false);
    // Reload purchased
    const tama = await userDataService.getTamagotchi();
    setPurchased(tama.purchased || {});
  };

  // Shop/hive modals (simplified)
  const handleUseFood = (foodName) => {
    const expires = Date.now() + 6 * 60 * 60 * 1000; // 6 hours
    setXpBoost({ food: foodName, expires });
    alert(`Your pet gets 10% XP boost for 6 hours!`);
  };

  const handleBuyPet = async (type) => {
    const alreadyPicked = Object.keys(purchased).length > 0;
    if (!alreadyPicked) {
      await userDataService.buyPet(type);
      setShopOpen(false);
      const tama = await userDataService.getTamagotchi();
      setShopPets(shopPets);
      setPurchased(tama.purchased || {});
      setCurrentMascot(type);
    } else if (gneePoints >= 5 && !purchased[type]) {
      await userDataService.buyPet(type);
      setUserData(prev => ({ ...prev, preferences: { ...prev.preferences, gneePoints: gneePoints - 5 } }));
      userDataService.updateUserData?.({ gneePoints: gneePoints - 5 });
      setShopOpen(false);
      const tama = await userDataService.getTamagotchi();
      setShopPets(shopPets);
      setPurchased(tama.purchased || {});
      setCurrentMascot(type);
    }
  };

  const handleBuyFood = async (foodName) => {
    if (gneePoints >= 1) {
      setUserData(prev => ({ ...prev, preferences: { ...prev.preferences, gneePoints: gneePoints - 1 } }));
      userDataService.updateUserData?.({ gneePoints: gneePoints - 1 });
      alert(`You bought ${foodName} for 1 Gnee! point!`);
      setShopOpen(false);
    }
  };

  const handleSelectHiveMascot = (type) => {
    setCurrentMascot(type);
    userDataService.updateTamagotchi?.({ currentMascot: type });
    setHiveOpen(false);
  };

  // Asset loading: link directly to dist/assets/pets/shop
  const getMascotImg = (mascot, action) => {
    const mascotLower = mascot.toLowerCase().replace(/\s+/g, '-');
    return `/assets/pets/shop/${mascot}/${mascotLower}-${action}.gif`;
  };

  // Initial data load from backend
  useEffect(() => {
    async function fetchTamagotchi() {
      const tama = await userDataService.getTamagotchi();
      if (tama) {
        setPurchased(tama.purchased || {});
        setPetXP(tama.mascotXP || {});
        setPetLevel(tama.petLevel || {});
        setPetReqXP(tama.petReqXP || {});
  // gneePoints is managed by parent
        setCurrentMascot(tama.currentMascot || null);
        setShopPets(tama.shop || []);
      }
    }
    fetchTamagotchi();
  }, []);

  return (
    <div className="container" style={{ maxWidth: 600, margin: '40px auto', padding: 32, background: '#222', borderRadius: 16, color: '#fff' }}>
      {/* ...existing code... */}
      {/* The rest of your UI remains unchanged, as above */}
      {/* ...existing code... */}
    </div>
  );
}

export default TamagotchiPage;

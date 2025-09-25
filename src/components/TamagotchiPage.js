
import React, { useEffect, useState } from 'react';
import userDataService from '../services/UserDataService';

// Skeleton for TamagotchiPage, compatible with webapp architecture
import pixelHeartGif from '../../dist/assets/pixel-heart.gif';

export default function TamagotchiPage({ healthData = {}, skillData = {} }) {
  // Simple XP/level state for each pet, loaded from backend
  const [petXP, setPetXP] = useState({}); // { petName: xp }
  const [petLevel, setPetLevel] = useState({}); // { petName: level }
  // Track required XP for each pet/level
  const [petReqXP, setPetReqXP] = useState({}); // { petName: reqXP }

  // ...existing code...
  // State hooks for pets, shop, hive, etc.
  const [gneePoints, setGneePoints] = useState(0);
  const [shopPets, setShopPets] = useState([]); // List of available pets
  const [petActionsMap, setPetActionsMap] = useState({}); // Map: pet name -> actions
  const [purchased, setPurchased] = useState({}); // User's owned pets
  const [currentMascot, setCurrentMascot] = useState(null); // Displayed pet
  const [currentAction, setCurrentAction] = useState(null); // Current pet action
  const [editModalOpen, setEditModalOpen] = useState(false); // Edit modal state
  const [renameValue, setRenameValue] = useState(''); // Rename input

  // ...existing code...

  // Load pets, mascot, XP, and level from backend on mount
  useEffect(() => {
    async function loadTamaData() {
      userDataService.getUserData?.().then(userData => {
        setGneePoints(userData?.gneePoints || 0);
      });
      // Load Tamagotchi data from backend
      const tamaData = await userDataService.loadTamagotchiData?.();
      setPurchased(tamaData.purchased || {});
      // XP/level state
      if (tamaData.mascotXP) {
        setPetXP(tamaData.mascotXP);
        const levels = {};
        const reqXPs = {};
        Object.keys(tamaData.mascotXP).forEach(pet => {
          // Calculate level and required XP for each pet
          let xp = tamaData.mascotXP[pet] ?? 0;
          let level = 1;
          let reqXP = 100;
          while (xp >= reqXP) {
            xp -= reqXP;
            level++;
            reqXP = Math.round(reqXP + 0.05 * level * reqXP);
          }
          levels[pet] = level;
          reqXPs[pet] = reqXP;
        });
        setPetLevel(levels);
        setPetReqXP(reqXPs);
      }
      // Restore mascot selection if available
      if (tamaData.currentMascot) {
        setCurrentMascot(tamaData.currentMascot);
      } else {
        // If no mascot selected, pick first purchased pet
        const pets = Object.keys(tamaData.purchased || {});
        if (pets.length > 0) setCurrentMascot(pets[0]);
      }
      // List pets from asset folder
  const petFolders = ['white dog', 'Frog', 'Bird', 'plant'];
  setShopPets(petFolders);
      const actionsMap = {};
      for (const pet of petFolders) {
        let gifs = [];
        try {
          gifs = require.context('../../dist/assets/pets/shop/' + pet, false, /\.gif$/).keys();
        } catch (e) {
          gifs = [];
        }
        actionsMap[pet] = gifs.map(f => {
          const match = f.match(/([a-zA-Z0-9_-]+)-([a-zA-Z0-9_]+)\.gif$/);
          return match ? match[2] : null;
        }).filter(Boolean);
      }
      setPetActionsMap(actionsMap);
    }
    loadTamaData();
  }, []);

  // Save XP/level and currentMascot to backend whenever petXP, purchased, or currentMascot changes
  useEffect(() => {
    if (Object.keys(purchased).length === 0) return;
    // Only save Tamagotchi data, never overwrite user data (skills, health, preferences, profile)
    console.log('[DEBUG] Saving Tamagotchi data:', { petXP, purchased });
    userDataService.saveTamagotchiData?.(petXP, purchased);
    console.log('[DEBUG] Updating currentMascot:', currentMascot);
    userDataService.updateTamagotchi?.({ currentMascot });
  }, [petXP, purchased, currentMascot]);

  // Action buttons for mascot (dynamic)
  let petActions = currentMascot && petActionsMap[currentMascot] ? petActionsMap[currentMascot] : [];
  petActions = petActions.filter(Boolean); // Remove undefined/null
  // Always unlock at least one action button for testing
  if (petActions.length === 0) {
    petActions = ['wake'];
  }

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
  // Dynamically list food GIFs from dist/assets/food
  const foodFolder = '/dist/assets/food';
  const foodFiles = [
  'bun.gif', 'candy.gif', 'drink.gif', 'fastfood.gif', 'kewto.gif', 'matcha.gif', 'noddle.gif', 'salmon eggs.gif', 'sushi salmon.gif', 'sushi.gif', 'sushi2.gif', 'sushii1.gif', 'tempura.gif', 'tofu.gif', 'wraped sushi.gif'
  ];
  // XP boost state
  const [xpBoost, setXpBoost] = useState(null); // { food: 'food', expires: Date }
  const [hiveTab, setHiveTab] = useState('pets'); // 'pets' or 'food'
  // Use food on pet for XP boost
  const handleUseFood = (foodName) => {
    const expires = Date.now() + 6 * 60 * 60 * 1000; // 6 hours
    setXpBoost({ food: foodName, expires });
    alert(`Your pet gets 10% XP boost for 6 hours!`);
  };
  const [shopOpen, setShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState('pets'); // 'pets' or 'food'
  const [hiveOpen, setHiveOpen] = useState(false);
  // Secure pet purchase logic: first pet free, others cost 5 Gnee! points
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
      setGneePoints(gneePoints - 5);
      userDataService.updateUserData?.({ gneePoints: gneePoints - 5 });
      setShopOpen(false);
      const tama = await userDataService.getTamagotchi();
      setShopPets(shopPets);
      setPurchased(tama.purchased || {});
      setCurrentMascot(type);
    }
  };
  // Buy food logic: always costs 5 Gnee! points, not locked
  const handleBuyFood = async (foodName) => {
    if (gneePoints >= 1) {
      setGneePoints(gneePoints - 1);
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

  // ...existing code...

  // Asset loading: link directly to dist/assets/pets/shop
  const getMascotImg = (mascot, action) => {
  // Use lowercase mascot name and replace spaces with hyphens for file path
  const mascotLower = mascot.toLowerCase().replace(/\s+/g, '-');
  return `/assets/pets/shop/${mascot}/${mascotLower}-${action}.gif`;
  };

  return (
    <div className="container" style={{ maxWidth: 600, margin: '40px auto', padding: 32, background: '#222', borderRadius: 16, color: '#fff' }}>
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '1em', marginBottom: '2em' }}>
        <span style={{ fontSize: '2em' }}>👀</span>
        <h1 style={{ margin: 0 }}>Tamagotchi</h1>
      </div>
      {/* Shop & Hive buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em' }}>
        <button onClick={() => setHiveOpen(true)} style={{ background: '#00d4aa', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: '18px', fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>🐝 Hive</button>
        <button onClick={() => setShopOpen(true)} style={{ background: '#ffd700', color: '#222', padding: '8px 18px', border: 'none', borderRadius: '18px', fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>🛒 Shop</button>
      </div>
      {/* Mascot display */}
      {currentMascot ? (
        <div style={{ margin: '32px auto 0 auto', textAlign: 'center', color: '#ccc', fontSize: '1.1em', position: 'relative' }}>
          <div style={{ width: 200, height: 200, margin: 'auto', background: 'transparent', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', position: 'relative' }}>
            <img src={getMascotImg(currentMascot, currentAction || 'wake')} alt={currentMascot} style={{ width: 180, height: 180 }} />
            {/* XP boost indicator (right side of pet, outside main display) */}
            {xpBoost && xpBoost.expires > Date.now() && (
              <div style={{ position: 'absolute', right: 20, top: -18, borderRadius: '50%', padding: 8, boxShadow: '0 2px 8px #0002', display: 'flex', alignItems: 'center', gap: 6, background: 'none' }}>
                <img src={`/assets/food/${xpBoost.food}.gif`} alt="food" style={{ width: 32, height: 32, marginRight: 10 }} />
                <span style={{ color: '#ffd700', fontWeight: 700, fontSize: '1em', background: 'none', padding: 0 }}>+10% XP</span>
              </div>
            )}
          </div>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
            {petActions.map(action => (
              <button key={action} onClick={() => handleAction(action)} style={{ background: '#222', color: '#fff', padding: '6px 16px', border: 'none', borderRadius: 12, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>{action.charAt(0).toUpperCase() + action.slice(1)}</button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ margin: '32px auto 0 auto', textAlign: 'center', color: '#ccc', fontSize: '1.1em' }}>
          <p>No Tamagotchi pets yet.<br />Start building your Tamagotchi here!</p>
        </div>
      )}
      {/* Stats */}
      <div className="tama-stats" style={{ marginTop: '2em', color: '#00d4aa' }}>
        <div><b>Name:</b> {currentMascot && purchased[currentMascot]?.name ? purchased[currentMascot].name : '--'}</div>
        <div><b>Mood:</b> Happy 😊</div>
        <div><b>Level:</b> {currentMascot ? petLevel[currentMascot] ?? 1 : '--'}</div>
        <div className="progress-bar" style={{ background: '#444', borderRadius: 8, overflow: 'hidden', height: 18, marginTop: 8 }}>
          <div className="progress" style={{ background: '#00d4aa', height: '100%', width: `${currentMascot ? Math.round((petXP[currentMascot] ?? 0) / (petReqXP[currentMascot] ?? 100) * 100) : 0}%` }}></div>
        </div>
        {currentMascot && (
          <div style={{ fontSize: '1em', color: '#222', marginTop: 4, fontWeight: 600 }}>
            XP: <span style={{ color: '#444' }}>{(petXP[currentMascot] ?? 0).toFixed(1)}</span> / <span style={{ color: '#888' }}>{petReqXP[currentMascot] ?? 100}</span> XP
          </div>
        )}
        <div style={{ fontSize: '0.95em', color: '#aaa', marginTop: 4 }}>Progress to next evolution</div>
      </div>
      {/* Evolution display */}
      <div className="evolution" style={{ marginTop: '2em', color: '#ffd700', display: 'flex', alignItems: 'center', gap: 10 }}>
        <b>Evolution:</b> <span id="evolutionName">{currentMascot && purchased[currentMascot]?.name ? purchased[currentMascot].name : '--'}</span>
        {currentMascot && <button onClick={openEditModal} style={{ background: '#ffd700', color: '#222', padding: '2px 10px', border: 'none', borderRadius: 8, fontSize: '0.95em', fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>Edit</button>}
      </div>
      {/* Info text */}
      <div style={{ marginTop: '2em', textAlign: 'center', color: '#ccc', fontSize: '1em' }}>
        <p>Your tamagotchi evolves as you complete skills and earn points!<br />Keep progressing to unlock new forms and animations.</p>
      </div>

      {/* Shop Modal */}
      {shopOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#222', padding: '32px 24px', borderRadius: 18, maxWidth: 420, maxHeight: '80vh', overflowY: 'auto', margin: 'auto', boxShadow: '0 2px 16px #0006' }} onClick={e => { if (e.target === e.currentTarget) setShopOpen(false); }}>
            <h2 style={{ color: '#ffd700', textAlign: 'center', marginTop: 0 }}>Tamagotchi Shop</h2>
            <div style={{ color: '#ffd700', textAlign: 'center', fontWeight: 600, fontSize: '1.1em', marginBottom: '18px' }}>
              <img src="/assets/point/gnee-point.gif" alt="Gnee!" style={{ width: 32, height: 32, verticalAlign: 'middle', marginRight: 8 }} />
              Gnee! points: <span style={{ color: '#fff', fontWeight: 700 }}>{gneePoints}</span>
            </div>
            {/* Shop tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 18 }}>
              <button onClick={() => setShopTab('pets')} style={{ background: shopTab === 'pets' ? '#ffd700' : '#444', color: shopTab === 'pets' ? '#222' : '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Pets</button>
              <button onClick={() => setShopTab('food')} style={{ background: shopTab === 'food' ? '#ffd700' : '#444', color: shopTab === 'food' ? '#222' : '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Food</button>
            </div>
            {/* Pets tab */}
            {shopTab === 'pets' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, justifyItems: 'center' }}>
                {shopPets.map(type => {
                  const alreadyPicked = Object.keys(purchased).length > 0;
                  const isPicked = purchased[type];
                  const locked = alreadyPicked && !isPicked;
                  const canBuy = !isPicked && (gneePoints >= 5 || !alreadyPicked);
                  return (
                    <div key={type} style={{ textAlign: 'center', opacity: locked && !canBuy ? 0.4 : 1 }}>
                      <div style={{ width: 70, height: 70, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', marginBottom: 8 }}>
                        <img src={getMascotImg(type, 'wake')} alt={type} style={{ width: 48, height: 48 }} />
                      </div>
                      <div style={{ color: '#fff', fontSize: '1em' }}>{type}</div>
                      <div style={{ color: '#ffd700', fontSize: '0.95em' }}>{isPicked ? 'Owned' : (!alreadyPicked ? 'Free' : '5 Gnee! points')}</div>
                      <button onClick={() => canBuy && handleBuyPet(type)} disabled={!canBuy} style={{ marginTop: 6, background: canBuy ? '#ffd700' : '#aaa', color: '#222', padding: '4px 16px', border: 'none', borderRadius: 12, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: canBuy ? 'pointer' : 'not-allowed' }}>{isPicked ? 'Owned' : (!alreadyPicked ? 'Get Free' : 'Buy')}</button>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Food tab */}
            {shopTab === 'food' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, justifyItems: 'center' }}>
                {foodFiles.map(foodName => (
                  <div key={foodName} style={{ textAlign: 'center' }}>
                    <div style={{ width: 70, height: 70, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', marginBottom: 8 }}>
                      <img src={`/assets/food/${foodName}`} alt={foodName} style={{ width: 48, height: 48 }} />
                    </div>
                    <div style={{ color: '#fff', fontSize: '1em' }}>{foodName.replace('.gif','').replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div style={{ color: '#ffd700', fontSize: '0.95em' }}>1 Gnee! point</div>
                    <button onClick={() => handleBuyFood(foodName.replace('.gif',''))} disabled={gneePoints < 1} style={{ marginTop: 6, background: gneePoints >= 1 ? '#ffd700' : '#aaa', color: '#222', padding: '4px 16px', border: 'none', borderRadius: 12, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: gneePoints >= 1 ? 'pointer' : 'not-allowed' }}>Buy</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShopOpen(false)} style={{ marginTop: 24, background: '#ffd700', color: '#222', padding: '8px 24px', border: 'none', borderRadius: 18, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>Close</button>
          </div>
        </div>
      )}

      {/* Hive Modal */}
      {hiveOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#222', padding: '32px 24px', borderRadius: 18, maxWidth: 420, maxHeight: '80vh', overflowY: 'auto', margin: 'auto', boxShadow: '0 2px 16px #0006' }} onClick={e => { if (e.target === e.currentTarget) setHiveOpen(false); }}>
            <h2 style={{ color: '#00d4aa', textAlign: 'center', marginTop: 0 }}>Your Hive</h2>
            {/* Hive tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 18 }}>
              <button onClick={() => setHiveTab('pets')} style={{ background: hiveTab === 'pets' ? '#ffd700' : '#444', color: hiveTab === 'pets' ? '#222' : '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Pets</button>
              <button onClick={() => setHiveTab('food')} style={{ background: hiveTab === 'food' ? '#ffd700' : '#444', color: hiveTab === 'food' ? '#222' : '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Food</button>
            </div>
            {/* Pets tab */}
            {hiveTab === 'pets' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, justifyItems: 'center' }}>
                {Object.keys(purchased).map(type => (
                  <div key={type} style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{ cursor: 'pointer', position: 'relative' }} onClick={() => handleSelectHiveMascot(type)}>
                      <div style={{ width: 70, height: 70, background: '#222', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', marginBottom: 8, position: 'relative' }}>
                        <img src={getMascotImg(type, 'wake')} alt={type} style={{ width: 48, height: 48 }} />
                        {/* No XP boost indicator in Hive tab */}
                      </div>
                      <div style={{ color: '#fff', fontSize: '1em' }}>{purchased[type].name || type}</div>
                    </div>
                    <button onClick={openEditModal} style={{ position: 'absolute', top: 4, right: 4, background: '#ffd700', color: '#222', padding: '2px 10px', border: 'none', borderRadius: 8, fontSize: '0.9em', fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>Edit</button>
                  </div>
                ))}
              </div>
            )}
            {/* Food tab */}
            {hiveTab === 'food' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, justifyItems: 'center' }}>
                {foodFiles.map(foodName => (
                  <div key={foodName} style={{ textAlign: 'center' }}>
                    <div style={{ width: 70, height: 70, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', marginBottom: 8 }}>
                      <img src={`/assets/food/${foodName}`} alt={foodName} style={{ width: 48, height: 48 }} />
                    </div>
                    <div style={{ color: '#fff', fontSize: '1em' }}>{foodName.replace('.gif','').replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div style={{ color: '#ffd700', fontSize: '0.95em' }}>Use on pet (+10% XP for 6h)</div>
                    <button onClick={() => handleUseFood(foodName.replace('.gif',''))} style={{ marginTop: 6, background: '#ffd700', color: '#222', padding: '4px 16px', border: 'none', borderRadius: 12, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>Use</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setHiveOpen(false)} style={{ marginTop: 24, background: '#00d4aa', color: '#fff', padding: '8px 24px', border: 'none', borderRadius: 18, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>Close</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#222', padding: '32px 24px', borderRadius: 18, maxWidth: 340, margin: 'auto', boxShadow: '0 2px 16px #0006' }}>
            <h2 style={{ color: '#ffd700', textAlign: 'center', marginTop: 0 }}>Edit Tamagotchi</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#fff' }}>Rename:</label>
              <input value={renameValue} onChange={e => setRenameValue(e.target.value)} type="text" style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: 'none', marginTop: 6, background: '#333', color: '#fff', fontSize: '1em' }} />
            </div>
            <button onClick={handleRename} style={{ background: '#00d4aa', color: '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, marginBottom: 10, cursor: 'pointer' }}>Rename</button>
            <button onClick={() => setEditModalOpen(false)} style={{ background: '#444', color: '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, marginTop: 10, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

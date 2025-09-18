import React, { useEffect, useState } from 'react';
import userDataService from '../services/UserDataService';

// Helper to scan pets and actions (stub for now, replace with backend or fs API)
// Scan actual asset folders for pets and actions
const petFolders = [
  { name: 'white dog', folder: 'white dog', actions: ['wake', 'run', 'sleep'] },
  { name: 'Frog', folder: 'Frog', actions: ['wake', 'eat', 'wake2', 'jump', 'sleep', 'angry'] },
  { name: 'Bird', folder: 'Bird', actions: ['wake'] },
  { name: 'plant', folder: 'plant', actions: ['wake'] }
];
const getShopPets = () => petFolders.map(p => p.name);
const getPetActions = pet => {
  const found = petFolders.find(p => p.name === pet);
  return found ? found.actions : ['wake'];
};
const getPetActionGif = (pet, action) => {
  const found = petFolders.find(p => p.name === pet);
  if (!found) return '';
  // Special case for frog angry
  if (found.folder === 'Frog' && action === 'angry') return `/assets/pets/shop/Frog/frog angry.gif`;
  // For other actions
  return `/assets/pets/shop/${found.folder}/${found.folder.toLowerCase().replace(/ /g, '-')}-${action.toLowerCase().replace(/ /g, '-')}.gif`;
};

export default function TamagotchiPage() {
  const [shopPets, setShopPets] = useState([]);
  const [purchased, setPurchased] = useState({});
  const [currentMascot, setCurrentMascot] = useState('white dog');
  const [currentAction, setCurrentAction] = useState('wake');
  const [mascotXP, setMascotXP] = useState({});
  const [actionInterval, setActionInterval] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  // Load tamagotchi data from backend on mount
  useEffect(() => {
    async function loadTama() {
      setShopPets(getShopPets());
      try {
        const data = await userDataService.loadTamagotchiData();
        setMascotXP(data.mascotXP && Object.keys(data.mascotXP).length ? data.mascotXP : { 'white dog': 0 });
        setPurchased(data.purchased && Object.keys(data.purchased).length ? data.purchased : { 'white dog': { name: 'White Dog' } });
        setCurrentMascot(Object.keys(data.purchased || { 'white dog': {} })[0] || 'white dog');
        setCurrentAction('wake');
      } catch (e) {
        setMascotXP({ 'white dog': 0 });
        setPurchased({ 'white dog': { name: 'White Dog' } });
        setCurrentMascot('white dog');
        setCurrentAction('wake');
      }
    }
    loadTama();
  }, []);

  useEffect(() => {
    setShopPets(getShopPets());
    setMascotXP({ 'white dog': 0 });
    setPurchased({ 'white dog': { name: 'White Dog' } });
    setCurrentMascot('white dog');
    setCurrentAction('wake');
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
        <span style={{ fontSize: '2em' }}>�</span>
        <h1 style={{ margin: 0 }}>Tamagotchi</h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ background: '#00d4aa', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 18, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>🐝 Hive</button>
        <button style={{ background: '#ffd700', color: '#222', padding: '8px 18px', border: 'none', borderRadius: 18, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>🛒 Shop</button>
      </div>
      <div style={{ margin: '32px auto 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 200, height: 200, background: 'transparent', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002' }}>
          <img src={getPetActionGif(currentMascot, currentAction)} alt={`${currentMascot} ${currentAction}`} style={{ width: 180, height: 180 }} />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
          {getPetActions(currentMascot).map(action => (
            <button key={action} onClick={() => setAction(action)} style={{ background: '#222', color: '#fff', padding: '6px 16px', border: 'none', borderRadius: 12, fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>{action.charAt(0).toUpperCase() + action.slice(1)}</button>
          ))}
        </div>
        <div className="tama-stats" style={{ marginTop: '1em', fontSize: '1.1em', color: '#00d4aa' }}>
          <div><b>Name:</b> {purchased[currentMascot]?.name || currentMascot}</div>
          <div><b>Level:</b> {calcTamaLevel(currentMascot)}</div>
          <div><b>XP:</b> {mascotXP[currentMascot] || 0}</div>
        </div>
        <div className="evolution" style={{ marginTop: '2em', fontSize: '1.05em', color: '#ffd700', display: 'flex', alignItems: 'center', gap: 10 }}>
          <b>Evolution:</b> <span>{purchased[currentMascot]?.name || currentMascot}</span>
          <button onClick={openEditModal} style={{ background: '#ffd700', color: '#222', padding: '2px 10px', border: 'none', borderRadius: 8, fontSize: '0.95em', fontWeight: 600, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>Edit</button>
        </div>
      </div>
      {editModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#222', padding: '32px 24px', borderRadius: 18, maxWidth: 340, margin: 'auto', boxShadow: '0 2px 16px #0006' }}>
            <h2 style={{ color: '#ffd700', textAlign: 'center', marginTop: 0 }}>Edit Displayed Tamagotchi</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#fff' }}>Rename:</label>
              <input value={renameValue} onChange={e => setRenameValue(e.target.value)} type="text" style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: 'none', marginTop: 6, background: '#333', color: '#fff', fontSize: '1em' }} />
            </div>
            <button onClick={handleRename} style={{ background: '#00d4aa', color: '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, marginBottom: 10, cursor: 'pointer' }}>Rename</button>
            <button onClick={() => setEditModalOpen(false)} style={{ background: '#444', color: '#fff', padding: '6px 18px', border: 'none', borderRadius: 12, fontWeight: 600, marginTop: 10, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
      <div style={{ marginTop: '2em', textAlign: 'center', color: '#ccc', fontSize: '1em' }}>
        <p>Your tamagotchi evolves as you complete skills and earn points!<br />Keep progressing to unlock new forms and animations.</p>
      </div>
    </div>
  );
}

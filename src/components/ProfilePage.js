import React, { useState, useEffect } from 'react';
import userDataService from '../services/UserDataService';

const MOTIVATION_QUOTES = [
	'The groundwork for all happiness is good health.\nBased on your Physical progress\n- Leigh Hunt',
	'Every small step counts towards your greater journey! 🚀',
	'Success is the sum of small efforts, repeated day in and day out. - Robert Collier',
	'Health is not valued till sickness comes. - Thomas Fuller',
	'Take care of your body. It’s the only place you have to live. - Jim Rohn'
];

function MotivationQuote() {
	const [quote] = useState(() => {
		return MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
	});
	return <p>{quote}</p>;
}

function ProfilePage({ onClose, currentUser, userData }) {
	const [editMode, setEditMode] = useState(false);
	const [pendingProfileImage, setPendingProfileImage] = useState('');
	const [pendingAnatomyImage, setPendingAnatomyImage] = useState('');
	const [saving, setSaving] = useState(false);
	const [profileData, setProfileData] = useState({
		description: '',
		profileImage: '',
		anatomyImage: '',
		achievements: [],
		level: 1,
		totalExperience: 0
	});

	useEffect(() => {
		if (userData && userData.profile) {
			setProfileData({
				...profileData,
				...userData.profile
			});
		}
	}, [userData]);

	const getBodyPartStatus = (partName) => {
		// Dummy logic for demo; replace with real health/skill mapping
		if (partName === 'head') return 'excellent';
		if (partName === 'body') return 'good';
		if (partName === 'arms') return 'poor';
		if (partName === 'legs') return 'average';
		return 'untrained';
	};

	const handleEdit = () => setEditMode(true);
	const handleCancel = () => {
		setEditMode(false);
		setPendingProfileImage(profileData.profileImage || '');
		setPendingAnatomyImage(profileData.anatomyImage || '');
	};
	const handleAvatarUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (ev) => {
				setPendingProfileImage(ev.target.result);
			};
			reader.readAsDataURL(file);
		}
	};
	const handleAnatomyUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (ev) => {
				setPendingAnatomyImage(ev.target.result);
			};
			reader.readAsDataURL(file);
		}
	};
	const handleSave = async () => {
		setSaving(true);
		try {
			const newProfile = {
				profileImage: pendingProfileImage,
				anatomyImage: pendingAnatomyImage
			};
			await userDataService.saveUserData({
				...userData,
				profile: newProfile
			});
			setProfileData(newProfile);
			setEditMode(false);
		} catch (err) {
			alert('Failed to save profile images.');
		}
		setSaving(false);
	};

	return (
		<div className="profile-page">
			<div className="profile-overlay" onClick={onClose}></div>
			<div className="profile-container">
				<div className="profile-header">
					<h2>👤 Character Profile</h2>
					<button className="close-button" onClick={onClose}>✕</button>
				</div>
				<div className="profile-content">
					<div className="character-info">
						<div className="character-avatar">
							{editMode ? (
								<>
									{pendingProfileImage ? (
										<img src={pendingProfileImage} alt="Profile" />
									) : (
										<div className="default-avatar">👤</div>
									)}
									<input type="file" accept="image/*" onChange={handleAvatarUpload} />
								</>
							) : (
								profileData.profileImage ? (
									<img src={profileData.profileImage} alt="Profile" />
								) : (
									<div className="default-avatar">👤</div>
								)
							)}
						</div>
						<div className="character-details">
							<h3>{currentUser}</h3>
						</div>
					</div>
					<div className="body-visualization">
						<h4>⚡ Anatomy & Condition</h4>
						<div style={{ position: 'relative', width: '300px', height: '420px' }}>
							{editMode ? (
								<>
									{pendingAnatomyImage ? (
										<img src={pendingAnatomyImage} alt="Anatomy" style={{ width: '300px', height: '420px' }} />
									) : (
										<img src="/image/anatomy/full body 5 1303.png" alt="Anatomy" style={{ width: '300px', height: '420px' }} />
									)}
									<input type="file" accept="image/*" onChange={handleAnatomyUpload} />
								</>
							) : (
								<img src={profileData.anatomyImage || "/image/anatomy/full body 5 1303.png"} alt="Anatomy" style={{ width: '300px', height: '420px' }} />
							)}
							{/* Status circles overlay */}
							{[ 
								{ part: 'head', left: 135, top: 35 },
								{ part: 'body', left: 135, top: 160 },
								{ part: 'arms', left: 60, top: 120 },
								{ part: 'arms', left: 210, top: 120 },
								{ part: 'legs', left: 100, top: 340 },
								{ part: 'legs', left: 170, top: 340 }
							].map(({ part, left, top }, idx) => {
								const status = getBodyPartStatus(part);
								const isProblem = status === 'poor';
								return (
									<div key={idx} style={{ position: 'absolute', left, top }}>
										<div
											className={`status-circle ${status}`}
											title={part.charAt(0).toUpperCase() + part.slice(1)}
											style={{
												width: 32,
												height: 32,
												borderRadius: '50%',
												border: '2px solid #fff',
												background: 'rgba(0,0,0,0.3)',
												margin: 0,
												boxShadow: isProblem ? '0 0 16px 4px #e74c3c' : undefined,
												animation: isProblem ? 'blink-red 1s infinite' : undefined
											}}
										></div>
									</div>
								);
							})}
							<style>{`
								@keyframes blink-red {
									0%, 100% { box-shadow: 0 0 16px 4px #e74c3c; }
									50% { box-shadow: 0 0 32px 8px #e74c3c; }
								}
							`}</style>
						</div>
						<div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
							<img src="/assets/pixel-heart.gif" alt="Pixel Heart" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
						</div>
					</div>
					<div style={{ marginTop: '2rem' }}>
						<h4>🌟 Daily Motivation</h4>
						<MotivationQuote />
					</div>
					{editMode && (
						<div style={{ marginTop: '2rem', textAlign: 'center' }}>
							<button onClick={handleSave} disabled={saving} style={{ marginRight: '1rem' }}>Save</button>
							<button onClick={handleCancel}>Cancel</button>
						</div>
					)}
					{!editMode && (
						<div style={{ marginTop: '2rem', textAlign: 'center' }}>
							<button onClick={handleEdit}>Edit</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default ProfilePage;

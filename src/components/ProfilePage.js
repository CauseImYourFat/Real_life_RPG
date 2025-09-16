
import React from 'react';

function ProfilePage({ onClose }) {
	return (
		<div className="profile-page">
			<div className="profile-overlay" onClick={onClose}></div>
			<div className="profile-container">
				<div className="profile-header">
					<h2>👤 Character Profile</h2>
					<button className="close-button" onClick={onClose}>✕</button>
				</div>
				<div className="profile-content">
					<div className="body-visualization">
						<h4>⚡ Anatomy & Condition</h4>
						<div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
							<img src="/assets/pixel-heart.gif" alt="Pixel Heart" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
						</div>
						{/* Anatomy status circles and other content can be added here */}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ProfilePage;

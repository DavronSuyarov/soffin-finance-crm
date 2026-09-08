// src/components/AuthLock.tsx
import React, { useState } from 'react';

interface AuthLockProps {
	onSuccess: () => void;
}

// O'zingiz xohlagan kuchli PIN yoki Parolni belgilang
const APP_PIN = '7788';

export const AuthLock: React.FC<AuthLockProps> = ({ onSuccess }) => {
	const [pin, setPin] = useState('');
	const [error, setError] = useState(false);

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		if (pin.trim() === APP_PIN) {
			sessionStorage.setItem('soffinp_auth', 'true');
			onSuccess();
		} else {
			setError(true);
			setPin('');
		}
	};

	return (
		<div className='fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4'>
			<div className='bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl'>
				<div className='w-14 h-14 bg-sky-600/20 text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold'>
					💼
				</div>
				<h2 className='text-xl font-bold text-white mb-1'>SOFFIN PAY</h2>
				<p className='text-xs text-slate-400 mb-6'>
					Moliya tizimiga kirish uchun PIN-kodni kiriting
				</p>

				<form onSubmit={handleLogin} className='space-y-4'>
					<input
						type='password'
						maxLength={8}
						autoFocus
						placeholder='PIN-kod'
						value={pin}
						onChange={e => {
							setPin(e.target.value);
							setError(false);
						}}
						className='w-full text-center tracking-widest text-2xl py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500 transition-all font-mono'
					/>

					{error && (
						<p className='text-xs text-rose-500 font-medium'>
							PIN-kod noto‘g‘ri!
						</p>
					)}

					<button
						type='submit'
						className='w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-sky-600/30'
					>
						Tizimga kirish
					</button>
				</form>
			</div>
		</div>
	);
};

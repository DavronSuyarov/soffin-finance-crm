// src/components/Modal.tsx
import React, { useEffect } from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
}) => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			window.addEventListener('keydown', handleKeyDown);
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs'>
			<div
				className='bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden transition-colors'
				onClick={e => e.stopPropagation()}
			>
				<div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800'>
					<h3 className='text-base font-bold text-slate-800 dark:text-slate-100'>
						{title}
					</h3>
					<button
						onClick={onClose}
						className='text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
					>
						✕
					</button>
				</div>
				<div className='p-6 max-h-[80vh] overflow-y-auto text-slate-700 dark:text-slate-200'>
					{children}
				</div>
			</div>
		</div>
	);
};

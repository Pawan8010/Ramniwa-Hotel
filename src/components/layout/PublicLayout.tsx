import React from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { Footer } from './Footer';
import { MobileBottomBar } from './MobileBottomBar';
import { Navbar } from './Navbar';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-text-primary paper-grain">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
      <FloatingWhatsApp />
      <MobileBottomBar />
    </div>
  );
}

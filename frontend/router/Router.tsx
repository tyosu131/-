import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TOP from '../components/Pages/top';
import Contact from '../components/Pages/contact';

const AppRouter: React.FC = () => {
  const onOpenContact = () => {
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TOP onOpenContact={onOpenContact} />} />
        <Route path="/contact" element={<Contact isOpen={true} onClose={() => {}} />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;

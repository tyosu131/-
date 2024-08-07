import React from 'react';
import Contact from '../components/pages/contact';
import { useRouter } from 'next/router';

const ContactPage: React.FC = () => {
  const router = useRouter();

  const handleClose = () => {
    router.push("/");
  };

  return <Contact isOpen={true} onClose={handleClose} />;
};

export default ContactPage;

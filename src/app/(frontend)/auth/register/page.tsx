'use client';

import { SignUp } from '@clerk/nextjs';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-screen px-4">
        <SignUp />
          
      </div>
    </div>
  );
};

export default RegisterPage;

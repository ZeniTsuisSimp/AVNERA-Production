'use client';

import { SignIn } from '@clerk/nextjs';

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-screen px-4">
        <SignIn />
          
      </div>
    </div>
  );
};

export default SignInPage;

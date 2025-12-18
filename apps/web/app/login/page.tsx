'use client';
import { Login } from '@/components/Login';
import { useEffect, useState } from 'react';

export default function LoginPage() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Login />
    </main>
  );
}

import { redirect } from 'next/navigation';

// ---------------------------------------------------------------------------
// Home Page — Redirects to the Dashboard tab
// ---------------------------------------------------------------------------
export default function Home() {
  redirect('/dashboard');
}

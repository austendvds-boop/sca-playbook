import type { Metadata } from 'next';
import { PlaysPageClient } from './PlaysPageClient';

export const metadata: Metadata = {
  title: 'Play Library - ChalkTalk',
  description: 'Browse, search, and organize your football plays.'
};

export default function PlaysPage() {
  return <PlaysPageClient />;
}

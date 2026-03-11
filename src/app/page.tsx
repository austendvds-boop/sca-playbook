import type { Metadata } from 'next';
import { HomePageClient } from './HomePageClient';

export const metadata: Metadata = {
  title: 'ChalkTalk - SCA Playbook',
  description: 'Football play designer and install sheet builder for coaches.'
};

export default function HomePage() {
  return <HomePageClient />;
}

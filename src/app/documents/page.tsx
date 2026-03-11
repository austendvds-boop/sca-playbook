import type { Metadata } from 'next';
import { DocumentsPageClient } from './DocumentsPageClient';

export const metadata: Metadata = {
  title: 'Install Sheets - ChalkTalk',
  description: 'Create and manage game-day install sheets.'
};

export default function DocumentsPage() {
  return <DocumentsPageClient />;
}

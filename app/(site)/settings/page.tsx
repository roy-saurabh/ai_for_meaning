import { PageHeader } from '@/components/primitives/PageHeader';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Settings',
  description: 'Local settings for motion, sound, guidance, accessibility, experimental Traces, and exporting or erasing everything stored in your browser.',
  path: '/settings',
  noindex: true,
});

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Settings" title="Quiet controls." lead="Everything here is stored in this browser only. Changes apply immediately." />
      <div className="wrap max-w-[960px] pb-24">
        <SettingsPanel />
      </div>
    </>
  );
}

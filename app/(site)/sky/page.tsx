import { PageHeader } from '@/components/primitives/PageHeader';
import { SkyView } from '@/components/sky/SkyView';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Inner Sky',
  description:
    'A private constellation of kept practice sessions, stored only in your browser. Visual memory, not measurement — no scores, no streaks, no charts of what is missing.',
  path: '/sky',
});

export default function SkyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Inner Sky"
        title="A constellation, not a dashboard."
        lead="Each session you choose to keep becomes a little light: warm traces low in the sky for Storm, teal near the centre for Stillness, violet and gold at the edges for Song. It lives only in this browser."
      />
      <div className="wrap pb-24">
        <SkyView />
      </div>
    </>
  );
}

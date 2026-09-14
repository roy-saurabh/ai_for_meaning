import Link from 'next/link';
import { MirrorExperience } from '@/components/mirror/MirrorExperience';
import { isCloudCompanionEnabled } from '@/lib/env/server';
import { getHelpResource } from '@/lib/safety/help';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'The Witnessing Mirror',
  description:
    'A few quiet minutes: name your inner weather, then move through Storm, Stillness and Song. No account, nothing sensed unless you choose, and Ground is always one tap away.',
  path: '/mirror',
});

export default function MirrorPage() {
  return (
    <>
      <noscript>
        <div className="wrap py-24 text-center">
          <h1 className="display-md">The Mirror needs JavaScript.</h1>
          <p className="lead mx-auto mt-4 max-w-[46ch]">
            The Witnessing Mirror runs entirely in your browser, so it needs JavaScript to work. Everything else on this
            site can be read without it.
          </p>
          <p className="mt-6">
            <Link href="/practice" className="link-quiet">
              Read the practice library
            </Link>{' '}
            ·{' '}
            <Link href="/ground" className="link-quiet">
              Ground
            </Link>
          </p>
        </div>
      </noscript>
      <MirrorExperience helpResource={getHelpResource()} cloudCompanion={isCloudCompanionEnabled()} />
    </>
  );
}

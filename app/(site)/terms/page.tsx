import Link from 'next/link';
import { ProsePage } from '@/components/primitives/ProsePage';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Terms',
  description: 'Plain-language terms for using AI for Meaning: a free, non-clinical self-awareness experience provided as is.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <ProsePage eyebrow="Terms" title="Plain terms." lead="By using this site, you agree to these terms. They are short because the product is simple." updated="14 September 2026">
      <h2>What the service is</h2>
      <p>
        AI for Meaning is a free web experience for self-awareness and reflection. It is provided for general, personal use.
      </p>

      <h2>Not medical, psychological or crisis care</h2>
      <p>
        Nothing on this site is medical, psychological or professional advice, diagnosis or treatment, and using it does not
        create any professional relationship. Do not use it in place of care from a qualified professional, and do not delay
        seeking care because of anything here. It is not a crisis service: if you might be in danger, contact your local
        emergency number. See <Link href="/ground">Ground</Link>.
      </p>

      <h2>Using it with care</h2>
      <ul>
        <li>Practices are optional. Only do what feels comfortable for your body and mind, and stop whenever something feels wrong.</li>
        <li>If you live with a physical or mental-health condition that could be affected by movement, breath or contemplative practice, check with a professional first.</li>
        <li>Do not use the Mirror while driving or doing anything that needs your full attention.</li>
        <li>The site is intended for adults.</li>
      </ul>

      <h2>Your data</h2>
      <p>
        Your session history is stored in your browser, and you are responsible for keeping or deleting it. See the{' '}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Acceptable use</h2>
      <p>Please don’t attempt to disrupt the service, overload its API, or misuse the Gathering.</p>

      <h2>As is</h2>
      <p>
        The service is provided “as is”, without warranties of any kind, and may change or become unavailable. To the extent
        the law allows, we are not liable for any loss arising from using it. Nothing in these terms limits rights you have
        under consumer law that cannot be limited.
      </p>

      <h2>Content</h2>
      <p>
        The site’s text, design and code belong to their authors. Cited research belongs to its respective authors and
        publishers.
      </p>

      <h2>Changes</h2>
      <p>If these terms change, the date above will change too.</p>
    </ProsePage>
  );
}

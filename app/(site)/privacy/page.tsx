import Link from 'next/link';
import { ProsePage } from '@/components/primitives/ProsePage';
import { isCloudCompanionEnabled } from '@/lib/env/server';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Privacy',
  description: 'How AI for Meaning handles data: no account, no trackers, no analytics. Session history stays in your browser. Exactly what is stored, where, and how to erase it.',
  path: '/privacy',
});

export default function PrivacyPage() {
  const cloud = isCloudCompanionEnabled();
  const contact = process.env.CONTACT_EMAIL?.trim();
  return (
    <ProsePage eyebrow="Privacy" title="Your inner life stays yours." lead="This policy describes what the site actually does today. It is written plainly, and it will change only when the product does." updated="14 September 2026">
      <h2>The short version</h2>
      <ul>
        <li>No account, no sign-up, no cookies.</li>
        <li>No analytics, tracking pixels, session recording, fingerprinting or advertising.</li>
        <li>What you do in the Mirror is stored in your own browser, if at all — not on our server.</li>
        <li>Microphone and camera are off by default. Nothing is secretly recorded.</li>
        <li>You can export or permanently erase your local data at any time in <Link href="/settings">Settings</Link>.</li>
      </ul>

      <h2>Stored in your browser</h2>
      <p>These stay on your device. We cannot see them.</p>
      <ul>
        <li><strong>Inner Sky traces</strong> (IndexedDB), only when you choose “Keep locally”: the session date and time, your weather word, which movements you visited, whether guidance was full or quiet, whether a Trace or Ground was used, how many guidance prompts were shown, and an optional closing word.</li>
        <li><strong>Fade preferences</strong> (IndexedDB): a count of completed sessions and your quiet-entry and prompt choices, so guidance can recede.</li>
        <li><strong>Settings</strong> (localStorage): motion, sound, session length, guidance and accessibility preferences, and whether you have seen the introduction.</li>
        <li><strong>An in-progress session</strong> (sessionStorage): the current step of a session, so an accidental reload can resume. It is limited to the browser tab and cleared when a session ends.</li>
        <li><strong>Offline copies of pages</strong> (Cache Storage), so the Mirror works without a connection. These contain site files, not your data.</li>
      </ul>
      <p>Words you type as a Song reflection are not stored anywhere.</p>

      <h2>Sent to our server</h2>
      <ul>
        <li><strong>Ordinary page requests.</strong> Your browser requests pages and files from our server, as with any website. Our application does not log these requests. The reverse proxy in front of it is configured not to keep access logs for this site; its error log may briefly record the IP address of a request that fails.</li>
        <li><strong>The Gathering</strong>, only if you tap “Sit with the Gathering”: the server creates a random, temporary identifier and keeps it in memory with an expiry time, so it can count how many people are present. No IP address, name or history is attached to it, and it disappears within a minute of you leaving.</li>
        <li><strong>Abuse protection.</strong> To rate-limit the small API, the server keeps a salted, one-way hash of your IP address in memory for up to a minute. It is never written to disk or logs.</li>
        {cloud ? (
          <li><strong>Cloud Witness-Companion.</strong> If you write a few words for a reflection, those words and the session stage are sent to our server and to our language-model provider (Anthropic) to generate one short reflection. They are not logged or stored by us.</li>
        ) : (
          <li><strong>No AI provider.</strong> The Witness-Companion currently runs entirely in your browser. Nothing you write is sent anywhere.</li>
        )}
      </ul>

      <h2>Microphone (experimental Breath-trace)</h2>
      <p>
        Only if you enable Breath-trace in Settings and then choose it before a session does the browser ask for microphone
        access. The sound is analysed in your browser, a few milliseconds at a time, to produce a loudness level. It is never
        recorded, stored or transmitted, and the microphone is released when the session ends or you ground.
      </p>

      <h2>Links to other sites</h2>
      <p>
        References link to journals, DOI and PubMed, and the Ground page links to a helpline directory. Those sites have their own
        privacy practices, which apply once you follow a link.
      </p>

      <h2>Hosting and security</h2>
      <p>
        The site is hosted on a server in France (EU), served over HTTPS with a strict Content-Security-Policy. Fonts and all
        scripts are served from our own domain.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        Because the data about your practice is held in your browser rather than by us, you control it directly: export it,
        remove individual traces from your Inner Sky, or delete everything in Settings. Clearing this site’s data in your
        browser has the same effect. If you are in the EU or UK you have rights under data-protection law, including to ask
        what information we hold about you; for this site that is, in practice, none beyond the transient data described above.
      </p>

      <h2>Children</h2>
      <p>AI for Meaning is intended for adults and is not directed at children.</p>

      <h2>Contact</h2>
      <p>{contact ? <>Questions about privacy: <a href={`mailto:${contact}`}>{contact}</a>.</> : 'A contact address for privacy questions is being set up and will be published here.'}</p>
    </ProsePage>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PracticePlayer } from '@/components/practice/PracticePlayer';
import { JsonLd } from '@/components/seo/JsonLd';
import { PRACTICES, PRACTICE_CATEGORIES, getPractice } from '@/content/practices';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';

export function generateStaticParams() {
  return PRACTICES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const practice = getPractice(slug);
  if (!practice) return {};
  return pageMetadata({
    title: `${practice.title} — ${PRACTICE_CATEGORIES[practice.category].name} practice`,
    description: `${practice.summary} ${practice.duration}. Gentle, optional, and interruptible at any step.`,
    path: `/practice/${practice.slug}`,
  });
}

export default async function PracticePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const practice = getPractice(slug);
  if (!practice) notFound();
  const category = PRACTICE_CATEGORIES[practice.category];
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Practice', path: '/practice' },
          { name: practice.title, path: `/practice/${practice.slug}` },
        ])}
      />
      <div className="wrap max-w-[860px] pb-24 pt-12 md:pt-20">
        <nav aria-label="Breadcrumb" className="font-mono text-[0.75rem] text-faint">
          <Link href="/practice" className="hover:text-muted">
            Practice
          </Link>{' '}
          / <span style={{ color: category.color }}>{category.name}</span>
        </nav>
        <h1 className="display-lg fade-in mt-5">{practice.title}</h1>
        <p className="lead fade-in mt-4">
          {practice.summary} <span className="font-mono text-[0.8rem] text-faint">· {practice.duration}</span>
        </p>
        <div className="mt-10">
          <PracticePlayer practice={practice} />
        </div>
        <details className="mt-10">
          <summary className="pill pill-ghost cursor-pointer list-none">All steps as text</summary>
          <ol className="prose-quiet mt-4 list-decimal space-y-2 pl-6">
            {practice.steps.map((s) => (
              <li key={s} className="!pl-1 before:!hidden">
                {s}
              </li>
            ))}
          </ol>
        </details>
      </div>
    </>
  );
}

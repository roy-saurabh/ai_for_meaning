/**
 * Human help information. Deterministic and reviewed; never generated.
 *
 * The default points to Find A Helpline (findahelpline.com), an international directory of free,
 * confidential helplines, plus local emergency services. Operators can configure a different
 * resource with HELP_RESOURCE_URL / HELP_RESOURCE_LABEL (server-side).
 */

export interface HelpResource {
  label: string;
  url: string;
  description: string;
}

export const DEFAULT_HELP_RESOURCE: HelpResource = {
  label: 'Find A Helpline',
  url: 'https://findahelpline.com',
  description: 'An international directory of free, confidential helplines, searchable by country.',
};

export function getHelpResource(env: Record<string, string | undefined> = process.env): HelpResource {
  const url = env.HELP_RESOURCE_URL?.trim();
  const label = env.HELP_RESOURCE_LABEL?.trim();
  if (url && /^https:\/\/[^\s]+$/.test(url)) {
    return {
      label: label || 'Help resource',
      url,
      description: 'A support resource configured for this site.',
    };
  }
  return DEFAULT_HELP_RESOURCE;
}

export const EMERGENCY_LINE =
  'If you might be in danger or unable to keep yourself safe, contact your local emergency number now.';

export const NOT_A_CRISIS_SERVICE =
  'AI for Meaning is not a crisis service and cannot respond to emergencies.';

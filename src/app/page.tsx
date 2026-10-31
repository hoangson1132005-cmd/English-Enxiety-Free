import { prisma } from '@/lib/prisma';
import { DEFAULT_SITE_CONTENT } from '@/lib/siteContentDefaults';
import { LandingPageClient } from '@/components/features/landing/LandingPageClient';

// Reads live SiteContent from the DB on every request (admin-editable),
// so this route can't be statically prerendered.
export const instant = false;

export default async function LandingPage() {
  const content = await prisma.siteContent.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main', ...DEFAULT_SITE_CONTENT },
  });

  return (
    <LandingPageClient
      content={{
        heroBadgeText: content.heroBadgeText,
        heroTitleHighlight: content.heroTitleHighlight,
        heroSubtitle: content.heroSubtitle,
        whyChooseTitle: content.whyChooseTitle,
        whyChooseBullet1: content.whyChooseBullet1,
        whyChooseBullet2: content.whyChooseBullet2,
        whyChooseBullet3: content.whyChooseBullet3,
        footerTagline: content.footerTagline,
        logoImageBase64: content.logoImageBase64,
        logoMimeType: content.logoMimeType,
      }}
    />
  );
}

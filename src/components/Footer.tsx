import { GithubIcon, TwitterIcon, InstagramIcon, LinkedinIcon, MailIcon } from '@/components/SocialIcons';

interface FooterProps {
  siteName?: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    email?: string;
  };
}

export default function Footer({ siteName = 'Journal', socialLinks }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 mt-20 py-10 text-stone-500 dark:text-stone-400 text-sm">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p>© {currentYear} {siteName}. All thoughts & stories reserved.</p>
        </div>

        {socialLinks && (
          <div className="flex items-center gap-4 text-stone-400 dark:text-stone-500">
            {socialLinks.github && (
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinks.email && (
              <a
                href={`mailto:${socialLinks.email}`}
                className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                aria-label="Email"
              >
                <MailIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}

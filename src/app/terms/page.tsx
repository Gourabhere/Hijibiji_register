import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background font-body">
      <header className="bg-card shadow-sm sticky top-0 z-10 border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground font-headline">Terms of Service</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card p-8 sm:p-10 rounded-2xl shadow-lg border">
          <div className="space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-foreground">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to Hijibiji Society Hub! These terms and conditions outline the rules and regulations for the use of our application, located at this website. By accessing this application, we assume you accept these terms and conditions. Do not continue to use Hijibiji Society Hub if you do not agree to all of the terms and conditions stated on this page.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-foreground">2. Accounts</h2>
              <p className="leading-relaxed">
                When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-foreground">3. User Data</h2>
              <p className="leading-relaxed">
                By registering, you consent to the collection and processing of your personal data as described in our Privacy Policy. This data includes your name, contact information, and details about your residence. This information is used solely for the purpose of society management and will not be shared with third parties without your explicit consent, except as required by law.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-foreground">4. Termination</h2>
              <p className="leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-foreground">5. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws of the land, without regard to its conflict of law provisions.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-foreground">6. Changes</h2>
              <p className="leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-foreground">7. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms, please contact the society administration office.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

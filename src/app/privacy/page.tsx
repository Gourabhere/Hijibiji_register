import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-body">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 font-headline">Privacy Policy</h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </Button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg">
          <div className="space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-gray-800">1. Information We Collect</h2>
              <p className="leading-relaxed">
                We collect personal identification information from you when you register on our application. The information we collect includes:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 pl-4">
                <li>Full Name</li>
                <li>Contact Number</li>
                <li>Email Address</li>
                <li>Family Member Details</li>
                <li>Flat and Block Number</li>
              </ul>
              <p className="leading-relaxed mt-2">
                This information is necessary for the administration of the society and to provide you with our services.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-gray-800">2. How We Use Your Information</h2>
              <p className="leading-relaxed">
                The information we collect is used for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2 pl-4">
                <li>To manage and maintain the society's resident database.</li>
                <li>To communicate with you regarding society notices, maintenance, and other official matters.</li>
                <li>To address any issues or complaints you may have.</li>
                <li>To manage maintenance payments and records.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-gray-800">3. Data Storage and Security</h2>
              <p className="leading-relaxed">
                Your data is stored in a secure Google Sheet, accessible only by authorized society administration personnel. We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-gray-800">4. Data Sharing</h2>
              <p className="leading-relaxed">
                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our application or conducting our business, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.
              </p>
            </div>
            
            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-gray-800">5. Your Consent</h2>
              <p className="leading-relaxed">
                By using our application and agreeing to the terms, you consent to our privacy policy.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-gray-800">6. Changes to Our Privacy Policy</h2>
              <p className="leading-relaxed">
                If we decide to change our privacy policy, we will post those changes on this page. We encourage you to review this privacy policy periodically.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-2xl mt-6 mb-3 font-headline text-gray-800">7. Contacting Us</h2>
              <p className="leading-relaxed">
                If there are any questions regarding this privacy policy, you may contact the society administration office.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

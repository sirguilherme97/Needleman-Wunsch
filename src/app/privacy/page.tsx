import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Needleman-Wunsch Algorithm',
  description: 'Privacy policy for the Needleman-Wunsch Algorithm bioinformatics tool. Learn how we protect your data and privacy.'
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-l from-cyan-950 to-black text-white">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us when using our Needleman-Wunsch Algorithm tool:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Sequence data entered for alignment analysis</li>
              <li>Algorithm parameters (match score, gap penalty, mismatch penalty)</li>
              <li>Usage analytics to improve our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">2. How We Use Information</h2>
            <p className="mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide and maintain our sequence alignment service</li>
              <li>Process your sequence alignment requests</li>
              <li>Improve our algorithm and user experience</li>
              <li>Communicate with you about our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">3. Data Storage and Security</h2>
            <p className="mb-4">
              Your sequence data is processed locally in your browser and may be temporarily stored in your browser&apos;s local storage for convenience. We do not permanently store your sequence data on our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">4. Third-Party Services</h2>
            <p className="mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Google AdSense:</strong> For displaying relevant advertisements</li>
              <li><strong>Vercel Analytics:</strong> For website performance monitoring</li>
            </ul>
            <p className="mb-4">
              These services may collect information as described in their respective privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">5. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our service</li>
              <li>Display personalized advertisements through Google AdSense</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">6. Your Rights</h2>
            <p className="mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Clear your browser&apos;s local storage at any time</li>
              <li>Disable cookies in your browser settings</li>
              <li>Opt out of personalized advertisements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">7. Children&apos;s Privacy</h2>
            <p className="mb-4">
              Our service is designed for educational and research purposes. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">8. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">9. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about this privacy policy, please contact us through our GitHub repository.
            </p>
          </section>
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/" 
            className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Needleman-Wunsch Tool
          </Link>
        </div>
      </div>
    </main>
  )
} 
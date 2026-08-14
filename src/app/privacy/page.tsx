import LegalLayout from "@/components/LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <section>
        <h2 className="font-display text-lg mb-2 text-white">1. What we collect</h2>
        <p>
          When you create an account, we collect your email address, date of birth, and password.
          When you build your profile, you may add a display name, bio, location, photos, and
          relationship preferences. To verify your identity, we share limited information with a
          third-party identity verification provider, who confirms your age and identity on our
          behalf.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">2. How we use it</h2>
        <p>
          We use your information to operate the matching and messaging features of the platform,
          confirm you meet our age requirement, keep the community safe (including automated
          scanning of messages for financial-scam patterns), and respond to reports and support
          requests.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">3. Who we share it with</h2>
        <p>
          We share identity documents with our verification vendor solely to confirm your age and
          identity. We do not sell your personal information to advertisers or data brokers. Other
          members only see what you choose to include on your public profile.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">4. Your choices</h2>
        <p>
          You can edit or delete your profile information at any time from your account settings.
          You can request full account deletion, which removes your profile, messages, and photos
          from active use, subject to any records we're legally required to retain.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">5. Data security</h2>
        <p>
          Passwords are stored using industry-standard hashing, not in plain text. Access to
          identity verification data is restricted to what's necessary to confirm eligibility.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">6. Contact</h2>
        <p>
          Questions about this policy can be directed to Jatelo Technologies Limited through the
          contact details provided on our main website.
        </p>
      </section>
    </LegalLayout>
  );
}

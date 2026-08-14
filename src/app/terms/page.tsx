import LegalLayout from "@/components/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Use">
      <section>
        <h2 className="font-display text-lg mb-2 text-white">1. Eligibility</h2>
        <p>
          You must be at least 18 years old to create an account. We verify age and identity
          through a third-party verification provider before your profile becomes visible to
          others. Misrepresenting your age is grounds for immediate account termination.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">2. What this platform is for</h2>
        <p>
          Arrangement connects consenting adults for companionship, mentorship, and relationships
          of mutual interest. It is a platform for social introductions only.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">3. Prohibited conduct</h2>
        <p>You agree not to use the platform to:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Solicit or offer commercial sex work</li>
          <li>Request or send money, gift cards, or financial details from another member before meeting in person</li>
          <li>Harass, threaten, or impersonate another person</li>
          <li>Post content involving minors in any form</li>
          <li>Create multiple accounts to evade a suspension</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">4. Account suspension</h2>
        <p>
          We may suspend or terminate accounts that violate these terms, including automatically
          suspending accounts reported for suspected underage use pending review. We aim to review
          such reports promptly.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">5. No guarantee of outcomes</h2>
        <p>
          We do not guarantee that you will find a match, that other members' profiles are
          accurate, or that any relationship formed through the platform will meet your
          expectations. Meeting anyone from the internet carries inherent risk — meet in public
          places and take standard safety precautions.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">6. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the platform after changes
          take effect constitutes acceptance of the updated terms.
        </p>
      </section>
    </LegalLayout>
  );
}

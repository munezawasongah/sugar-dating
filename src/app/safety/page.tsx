import LegalLayout from "@/components/LegalLayout";

export default function SafetyPage() {
  return (
    <LegalLayout title="Safety Policy">
      <section>
        <h2 className="font-display text-lg mb-2 text-white">Identity verification</h2>
        <p>
          Every member must pass identity verification before their profile is visible to others.
          This confirms both age and identity, and is one layer of protection — it does not
          replace your own judgment when meeting someone new.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">Never send money before meeting</h2>
        <p>
          A common scam pattern on platforms like this involves someone asking for money, gift
          cards, wire transfers, or financial details before you've met in person. We automatically
          flag messages that match these patterns for review. If someone asks you for money before
          you've met face to face, treat it as a serious warning sign and consider reporting the
          account.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">Meeting in person</h2>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Meet in a public place for your first few meetings</li>
          <li>Tell a friend or family member where you're going and who you're meeting</li>
          <li>Arrange your own transportation to and from the meeting</li>
          <li>Video chat before meeting in person, if possible, to confirm the person matches their profile</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">Reporting and blocking</h2>
        <p>
          You can report or block any member directly from their profile or a conversation.
          Reports involving suspected underage users are treated as priority and can result in
          immediate suspension pending review. All reports are reviewed by our trust & safety team.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2 text-white">Private photos</h2>
        <p>
          Members can keep certain photos private and only grant access to specific people they
          choose. Never feel pressured to share private photos with someone you haven't met, and
          you can revoke access at any time.
        </p>
      </section>
    </LegalLayout>
  );
}

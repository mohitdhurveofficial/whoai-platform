import type { Metadata } from "next";
import LegalLayout from "@/app/components/marketing/LegalLayout";
import { Reveal } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of the WHOAI platform and website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" effectiveDate="June 9, 2026">
      <Reveal>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the WHOAI website and
          platform (the &quot;Services&quot;) provided by WHOAI Inc. (&quot;WHOAI&quot;, &quot;we&quot;,
          &quot;us&quot;). By creating an account or using the Services, you agree to these Terms. If you are
          using the Services on behalf of an organization, you represent that you are authorized to bind that
          organization.
        </p>
      </Reveal>

      <h2>1. The Services</h2>
      <p>
        WHOAI provides a gateway and dashboard for tracking, controlling, and reducing spend on
        third-party AI providers. We may update, improve, or modify the Services over time. We are not the
        provider of the underlying AI models and are not responsible for their outputs.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>You must provide accurate information and keep your credentials secure.</li>
        <li>You are responsible for all activity that occurs under your account and API keys.</li>
        <li>Notify us promptly at <a href="mailto:security@whoai.ai">security@whoai.ai</a> of any unauthorized use.</li>
      </ul>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Services to violate any law or third-party rights.</li>
        <li>Interfere with, disrupt, or attempt to gain unauthorized access to the Services or related systems.</li>
        <li>Reverse engineer or resell the Services except as permitted by law or written agreement.</li>
        <li>Use the Services to transmit malware or to abuse, overload, or circumvent usage limits.</li>
      </ul>

      <h2>4. Fees and billing</h2>
      <p>
        Paid plans are billed in advance on a recurring basis through our payment processor. Fees are
        non-refundable except where required by law or expressly stated. You authorize us to charge your
        payment method for all applicable fees. We may change pricing with reasonable notice for upcoming
        billing periods.
      </p>

      <h2>5. Third-party providers</h2>
      <p>
        The Services route requests to AI providers you select. Your use of those providers is subject to
        their terms, and you are responsible for the charges they bill and the content you send to them.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        We retain all rights in the Services, including software, designs, and trademarks. You retain
        ownership of your data. You grant us a limited license to process your data solely to provide and
        improve the Services as described in our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>7. Confidentiality</h2>
      <p>
        Each party will protect the other&apos;s non-public information disclosed in connection with the
        Services and use it only as needed to perform under these Terms.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        The Services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any
        kind, whether express or implied, including merchantability, fitness for a particular purpose, and
        non-infringement. We do not warrant that the Services will be uninterrupted, error-free, or that
        cost estimates will be exact.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, WHOAI will not be liable for any indirect, incidental,
        special, consequential, or punitive damages, or for lost profits or revenues. Our total liability
        for any claim arising out of or relating to the Services will not exceed the amounts you paid to us
        in the twelve months preceding the claim.
      </p>

      <h2>10. Termination</h2>
      <p>
        You may stop using the Services at any time. We may suspend or terminate access if you breach these
        Terms or to protect the Services. Upon termination, your right to use the Services ends; certain
        provisions that by their nature should survive will survive.
      </p>

      <h2>11. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be posted with an updated
        effective date. Continued use of the Services after changes take effect constitutes acceptance.
      </p>

      <h2>12. Governing law and dispute resolution</h2>
      <p>
        These Terms are governed by and construed in accordance with the laws of the State of California,
        without regard to its conflict of laws principles. Any dispute arising out of or in connection with
        these Terms or the Services will be subject to the exclusive jurisdiction of the state and federal
        courts located in San Francisco, California, and you consent to the personal jurisdiction of those
        courts.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms? Email <a href="mailto:legal@whoai.ai">legal@whoai.ai</a> or visit our{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </LegalLayout>
  );
}

import type { Metadata } from "next";
import LegalLayout from "@/app/components/marketing/LegalLayout";
import { Reveal } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How WHOAI collects, uses, and protects your personal and account data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate="June 9, 2026">
      <Reveal>
        <p>
          WHOAI Inc. (&quot;WHOAI&quot;, &quot;we&quot;, &quot;us&quot;) provides a cost observability and
          FinOps control plane for AI systems. This Privacy Policy explains what information we collect, how
          we use it, and the choices you have. It applies to our website and the WHOAI platform (together,
          the &quot;Services&quot;).
        </p>
      </Reveal>

      <h2>1. Information we collect</h2>
      <h3>Information you provide</h3>
      <ul>
        <li>Account details such as your name, work email, company, and password.</li>
        <li>Sales and support communications, including demo and contact form submissions.</li>
        <li>Billing information processed by our payment provider (we do not store full card numbers).</li>
      </ul>
      <h3>Information from your use of the Services</h3>
      <ul>
        <li>
          Operational metadata about AI requests routed through the gateway — agent identifiers, model
          names, token counts, timestamps, and computed cost. On standard plans, prompt and completion
          content may be processed to calculate cost; on zero-retention configurations, payload content is
          not persisted.
        </li>
        <li>Usage, device, and log data such as IP address, browser type, and pages viewed.</li>
        <li>Cookies and similar technologies used to keep you signed in and to understand usage.</li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>To provide, operate, secure, and improve the Services.</li>
        <li>To calculate spend, enforce budgets, and trigger alerts and policy controls.</li>
        <li>To respond to inquiries, provide support, and send service-related communications.</li>
        <li>To detect, prevent, and address fraud, abuse, and security incidents.</li>
        <li>To comply with legal obligations and enforce our agreements.</li>
      </ul>

      <h2>3. How we share information</h2>
      <p>We do not sell your personal information. We share information only with:</p>
      <ul>
        <li>
          Service providers (sub-processors) who host infrastructure, process payments, or deliver email
          on our behalf, bound by confidentiality and data-protection obligations.
        </li>
        <li>The AI providers you direct traffic to, solely to fulfill your requests.</li>
        <li>Authorities when required by law, or to protect the rights, safety, and security of others.</li>
        <li>A successor entity in connection with a merger, acquisition, or sale of assets.</li>
      </ul>

      <h2>4. Data retention</h2>
      <p>
        We retain account and operational data for as long as your account is active and as needed to
        provide the Services, then for the period required to meet legal, accounting, or reporting
        obligations. You can request deletion as described below.
      </p>

      <h2>5. Security</h2>
      <p>
        We protect data in transit with TLS and encrypt sensitive credentials at rest. Access is scoped
        per organization and granted on a least-privilege basis. No method of transmission or storage is
        100% secure, but we work continuously to protect your information. See our{" "}
        <a href="/security">Security page</a> for more detail.
      </p>

      <h2>6. Your rights and choices</h2>
      <p>
        Depending on your location, you may have rights to access, correct, export, or delete your
        personal information, and to object to or restrict certain processing. To exercise these rights,
        contact us at <a href="mailto:privacy@whoai.ai">privacy@whoai.ai</a>. You can also manage cookie
        preferences in your browser.
      </p>

      <h2>7. International transfers</h2>
      <p>
        We may process and store information in countries other than your own. Where required, we use
        appropriate safeguards for cross-border transfers.
      </p>

      <h2>8. Children&apos;s privacy</h2>
      <p>The Services are not directed to children under 16, and we do not knowingly collect their data.</p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We will post the revised version with an updated
        effective date and, where appropriate, notify you.
      </p>

      <h2>10. Contact us</h2>
      <p>
        Questions about this policy? Email <a href="mailto:privacy@whoai.ai">privacy@whoai.ai</a> or visit
        our <a href="/contact">Contact page</a>.
      </p>
    </LegalLayout>
  );
}

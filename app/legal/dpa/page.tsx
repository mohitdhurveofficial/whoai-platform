import type { Metadata } from "next";
import LegalLayout from "@/app/components/marketing/LegalLayout";
import { Reveal } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Data Processing Agreement (DPA)",
  description:
    "WHOAI's Data Processing Agreement outlines how we handle customer data in compliance with GDPR and other privacy regulations.",
  alternates: { canonical: "/legal/dpa" },
};

export default function DPAPage() {
  return (
    <LegalLayout title="Data Processing Agreement (DPA)" effectiveDate="June 9, 2026">
      <Reveal>
        <p>
          WHOAI Inc. (&quot;WHOAI&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides a cost
          observability and FinOps control plane for AI systems. This Data Processing Agreement
          (&quot;DPA&quot;) explains how we process personal data on behalf of our customers
          (&quot;Customer&quot;) and is incorporated into our Terms of Service.
        </p>
      </Reveal>

      <h2>1. Definitions</h2>
      <ul>
        <li>
          &quot;Personal Data&quot; means any information relating to an identified or identifiable natural
          person.
        </li>
        <li>
          &quot;Processing&quot; means any operation performed on Personal Data, such as collection, recording,
          organization, structuring, storage, adaptation, alteration, retrieval, consultation, use, disclosure
          by transmission, dissemination, or otherwise making available, alignment or combination, restriction,
          erasure, or destruction.
        </li>
        <li>
          &quot;Sub-processor&quot; means a third party engaged by WHOAI to process Personal Data on behalf of
          Customer.
        </li>
      </ul>

      <h2>2. WHOAI&apos;s Commitments</h2>
      <ul>
        <li>
          WHOAI will process Personal Data only on documented instructions from Customer, including with
          respect to transfers of Personal Data to a third country or an international organization, unless
          required to do so by applicable law.
        </li>
        <li>
          WHOAI will ensure that persons authorized to process Personal Data have committed themselves to
          confidentiality or are under an appropriate statutory obligation of confidentiality.
        </li>
        <li>
          WHOAI will take and maintain appropriate technical and organizational measures to protect Personal
          Data against accidental or unlawful destruction, loss, alteration, unauthorized disclosure or
          access, and against all other unlawful forms of processing.
        </li>
        <li>
          WHOAI will, taking into account the nature of the processing, assist Customer by appropriate
          technical and organizational measures, insofar as this is possible, for the fulfillment of
          Customer&apos;s obligation to respond to requests for exercising the data subject&apos;s rights under
          applicable data protection law.
        </li>
        <li>
          WHOAI will make available to Customer all information necessary to demonstrate compliance with
          the obligations laid out in this DPA and allow for and contribute to audits, including inspections,
          conducted by Customer or another auditor mandated by Customer.
        </li>
        <li>
          WHOAI will engage only sub-processors who provide sufficient guarantees to implement appropriate
          technical and organizational measures in such a way that the processing will meet the requirements
          of this DPA.
        </li>
        <li>
          Upon termination of the services, WHOAI will, at the choice of Customer, delete or return all
          Personal Data to Customer and delete existing copies unless applicable law requires storage of the
          Personal Data.
        </li>
      </ul>

      <h2>3. Sub-processors</h2>
      <p>
        WHOAI currently engages the following sub-processors for infrastructure and payment processing:
      </p>
      <p>
        <em>Last updated: June 9, 2026</em>
      </p>
      <ul>
        <li>Vercel – Hosting and CDN</li>
        <li>Supabase – Database and authentication</li>
        <li>Stripe – Payment processing</li>
      </ul>
      <p>
        WHOAI will notify Customer of any intended changes concerning the addition or replacement of
        sub-processors and thereby give Customer the opportunity to object to such changes.
      </p>

      <h2>4. International Transfers</h2>
      <p>
        In the event that Personal Data is transferred to a country outside the European Economic Area
        (&quot;EEA&quot;) that does not ensure an adequate level of protection, WHOAI will ensure appropriate
        safeguards are in place, such as standard contractual clauses approved by the European Commission.
      </p>

      <h2>5. Data Subjects&apos; Rights</h2>
      <p>
        WHOAI will assist Customer in responding to requests from data subjects exercising their rights under
        applicable data protection law, including the right of access, rectification, erasure, restriction of
        processing, data portability, and objection.
      </p>

      <h2>6. Security and Breach Notification</h2>
      <p>
        WHOAI implements appropriate technical and organizational measures to ensure a level of security
        appropriate to the risk, including encryption of Personal Data at rest and in transit. In the event
        of a personal data breach, WHOAI will notify Customer without undue delay after becoming aware of
        the breach.
      </p>

      <h2>7. Governing Law and Jurisdiction</h2>
      <p>
        This DPA shall be governed by and construed in accordance with the laws of the State of California,
        without regard to its conflict of laws principles. Any dispute arising out of or in connection with
        this DPA shall be subject to the exclusive jurisdiction of the courts located in San Francisco,
        California.
      </p>

      <h2>8. Contact Information</h2>
      <p>
        Questions regarding this DPA or requests to exercise data subject rights should be directed to:
        <a href="mailto:legal@whoai.ai">legal@whoai.ai</a>.
      </p>

      <p>
        This DPA is effective as of the date stated above and remains in effect until superseded by a
        written agreement between the parties.
      </p>
    </LegalLayout>
  );
}
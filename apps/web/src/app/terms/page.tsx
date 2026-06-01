import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Use & Disclaimer | KeyNest",
  description:
    "KeyNest Platform Disclaimer, Terms of Use & Limitation of Liability — read before using the platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/register" className="flex items-center gap-3 group">
            <div className="p-2 bg-primary/20 rounded-lg ring-1 ring-primary/30">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-white">
              KeyNest.
            </span>
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign Up
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 pb-24">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium tracking-wide uppercase mb-6">
            Legal Document
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Platform Disclaimer,{" "}
            <span className="text-primary">Terms of Use</span> &amp; Limitation
            of Liability
          </h1>
          <p className="text-white/50 text-lg">
            <strong className="text-white/70">Effective Date:</strong> 1st June
            2025
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          <Section number="1" title="Introduction">
            <p>
              KeyNest is a software platform developed and operated by{" "}
              <strong>AfriBrain Bespoke Software</strong> for the purpose of
              assisting property owners, property managers, and authorized
              representatives in managing rental properties, tenant information,
              rent records, maintenance requests, communications, and related
              operational activities.
            </p>
            <p className="mt-3">
              By accessing or using KeyNest, users acknowledge that they have
              read, understood, and agreed to these terms.
            </p>
          </Section>

          <Section number="2" title="Nature of the Platform">
            <p>KeyNest is solely a technology platform.</p>
            <p className="mt-3">
              KeyNest does not own, lease, manage, operate, control, market, or
              represent any property listed on the platform unless expressly
              stated otherwise in writing.
            </p>
            <p className="mt-3">
              The platform is provided as a digital tool to facilitate
              administrative and operational functions between property owners,
              property managers, caretakers, tenants, and other authorized
              users.
            </p>
          </Section>

          <Section number="3" title="Property Ownership and Management">
            <p>
              All properties listed on the platform remain the sole
              responsibility of their respective owners, landlords, management
              companies, or authorized representatives.
            </p>
            <p className="mt-3 text-white/60 font-medium">KeyNest does not:</p>
            <BulletList
              items={[
                "Act as a landlord.",
                "Act as a property manager.",
                "Act as an estate agent.",
                "Act as a caretaker.",
                "Make decisions on behalf of property owners.",
                "Enforce tenancy agreements.",
                "Resolve landlord-tenant disputes.",
              ]}
            />
            <p className="mt-3">
              Any rights, obligations, responsibilities, agreements, disputes,
              claims, or liabilities relating to a property remain exclusively
              between the property owner, manager, and tenant.
            </p>
          </Section>

          <Section
            number="4"
            title="Relationship Between Property Owners and Tenants"
          >
            <p>KeyNest is not a party to any:</p>
            <BulletList
              items={[
                "Lease agreement",
                "Rental agreement",
                "Occupancy agreement",
                "Property management agreement",
                "Service agreement",
              ]}
            />
            <p className="mt-3">
              entered into between property owners, managers, and tenants.
            </p>
            <p className="mt-3">
              KeyNest does not create, modify, enforce, interpret, or terminate
              such agreements.
            </p>
            <p className="mt-3">
              Any disputes arising between landlords, managers, caretakers,
              tenants, contractors, or third parties shall be resolved directly
              between the involved parties.
            </p>
          </Section>

          <Section number="5" title="Payments">
            <p>
              Unless expressly stated otherwise in writing, KeyNest does not
              collect rent on behalf of property owners or managers.
            </p>
            <p className="mt-3">
              All rental payments, deposits, utility payments, service charges,
              maintenance fees, and other financial obligations remain
              transactions between the tenant and the relevant property owner or
              property manager.
            </p>
            <p className="mt-3">
              Where the platform displays payment information, receipts,
              balances, transaction references, or payment confirmations, such
              information is provided for record-keeping and administrative
              convenience only.
            </p>
            <p className="mt-3 text-white/60 font-medium">
              KeyNest shall not be liable for:
            </p>
            <BulletList
              items={[
                "Incorrect payment instructions provided by clients.",
                "Failed payments.",
                "Delayed payments.",
                "Fraudulent payments.",
                "Chargebacks.",
                "Financial disputes between tenants and landlords.",
                "Missing funds.",
                "Banking or mobile money system failures.",
              ]}
            />
          </Section>

          <Section number="6" title="Accuracy of Information">
            <p>
              Property owners and managers are solely responsible for the
              accuracy, legality, completeness, and validity of all information
              uploaded to the platform.
            </p>
            <p className="mt-3 text-white/60 font-medium">
              This includes but is not limited to:
            </p>
            <BulletList
              items={[
                "Tenant information",
                "Property information",
                "Lease details",
                "Rent balances",
                "Payment records",
                "Maintenance records",
                "Notices and communications",
              ]}
            />
            <p className="mt-3">
              KeyNest does not independently verify the accuracy of information
              submitted by users.
            </p>
          </Section>

          <Section number="7" title="Data Processing">
            <p>
              To provide its services, KeyNest may process, store, transmit,
              back up, and secure information submitted by authorized users.
            </p>
            <p className="mt-3 text-white/60 font-medium">
              Such information may include:
            </p>
            <BulletList
              items={[
                "Names",
                "Contact information",
                "Identification details",
                "Property information",
                "Lease information",
                "Payment records",
                "Maintenance records",
              ]}
            />
            <p className="mt-3">
              KeyNest processes such information solely for the purpose of
              operating and improving the platform.
            </p>
            <p className="mt-3">
              KeyNest does not sell user information to third parties.
            </p>
          </Section>

          <Section
            number="8"
            title="Client Responsibility for Legal Compliance"
          >
            <p>
              Property owners and managers are solely responsible for ensuring
              that their collection, storage, and use of tenant information
              complies with applicable laws and regulations.
            </p>
            <p className="mt-3">
              Clients warrant that they have obtained all necessary permissions,
              authorizations, notices, and consents required to upload and
              process tenant information through the platform.
            </p>
          </Section>

          <Section number="9" title="Service Availability">
            <p>
              KeyNest shall make reasonable efforts to maintain platform
              availability. However, uninterrupted service is not guaranteed.
            </p>
            <p className="mt-3 text-white/60 font-medium">
              Service interruptions may occur due to:
            </p>
            <BulletList
              items={[
                "Scheduled maintenance",
                "Technical failures",
                "Internet outages",
                "Third-party service interruptions",
                "Mobile money provider disruptions",
                "Cybersecurity incidents",
                "Force majeure events",
              ]}
            />
            <p className="mt-3">
              KeyNest shall not be liable for losses resulting from temporary
              unavailability of the platform.
            </p>
          </Section>

          <Section number="10" title="Maintenance Requests">
            <p>
              The platform may allow tenants to submit maintenance requests.
            </p>
            <p className="mt-3 text-white/60 font-medium">KeyNest does not:</p>
            <BulletList
              items={[
                "Perform maintenance work.",
                "Inspect maintenance issues.",
                "Guarantee maintenance quality.",
                "Supervise contractors.",
              ]}
            />
            <p className="mt-3">
              Responsibility for maintenance activities rests solely with the
              property owner, manager, contractor, or service provider.
            </p>
          </Section>

          <Section number="11" title="Communications">
            <p>
              The platform may facilitate communication through SMS, email,
              notifications, or other channels.
            </p>
            <p className="mt-3 text-white/60 font-medium">
              KeyNest does not guarantee:
            </p>
            <BulletList
              items={[
                "Message delivery.",
                "Message accuracy.",
                "Recipient availability.",
                "Response times.",
              ]}
            />
            <p className="mt-3">
              Delays or failures caused by telecommunications providers, internet
              services, email providers, or third-party communication services
              shall not create liability for KeyNest.
            </p>
          </Section>

          <Section number="12" title="Limitation of Liability">
            <p>
              To the maximum extent permitted by law, KeyNest, its owners,
              employees, contractors, affiliates, and partners shall not be
              liable for:
            </p>
            <BulletList
              items={[
                "Loss of revenue",
                "Loss of rent",
                "Business interruption",
                "Tenant disputes",
                "Property disputes",
                "Data inaccuracies provided by users",
                "Financial losses",
                "Indirect damages",
                "Consequential damages",
                "Incidental damages",
                "Special damages",
              ]}
            />
            <p className="mt-3">
              arising from or related to the use of the platform.
            </p>
          </Section>

          <Section number="13" title="Indemnification">
            <p>
              Clients agree to indemnify and hold harmless KeyNest, its owners,
              employees, contractors, and affiliates from any claims, losses,
              liabilities, damages, legal costs, or expenses arising from:
            </p>
            <BulletList
              items={[
                "Information uploaded by the client.",
                "Tenant disputes.",
                "Property disputes.",
                "Breach of applicable laws.",
                "Unauthorized use of the platform.",
                "Violation of these terms.",
              ]}
            />
          </Section>

          <Section number="14" title="Intellectual Property">
            <p>
              The KeyNest platform, software, branding, content, interfaces,
              workflows, and related materials remain the exclusive property of
              KeyNest and its licensors.
            </p>
            <p className="mt-3">
              No ownership rights are transferred to users by virtue of platform
              access or subscription.
            </p>
          </Section>

          <Section number="15" title="Termination">
            <p>
              KeyNest reserves the right to suspend or terminate access where:
            </p>
            <BulletList
              items={[
                "Subscription fees remain unpaid.",
                "Platform misuse occurs.",
                "Fraudulent activity is detected.",
                "Legal compliance concerns arise.",
              ]}
            />
            <p className="mt-3">
              Termination of access shall not affect obligations accrued prior
              to termination.
            </p>
          </Section>

          <Section number="16" title="Governing Law">
            <p>
              These terms shall be governed by and interpreted in accordance
              with the laws of the{" "}
              <strong className="text-white">Republic of Kenya</strong>.
            </p>
            <p className="mt-3">
              Any disputes arising from these terms shall be subject to the
              exclusive jurisdiction of Kenyan courts.
            </p>
          </Section>

          <Section number="17" title="Acceptance">
            <p>
              By registering for, accessing, or using the KeyNest platform,
              users acknowledge and agree to these terms and conditions.
            </p>
          </Section>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center">
          <p className="text-white/70 mb-4">
            Ready to get started? Return to sign up and create your account.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign Up
          </Link>
        </div>

        <p className="text-center text-white/30 text-sm mt-10">
          &copy; {new Date().getFullYear()} KeyNest Platform by AfriBrain
          Bespoke Software. All rights reserved.
        </p>
      </main>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-24">
      <div className="flex items-start gap-4 mb-4">
        <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
          {number}
        </span>
        <h2 className="font-heading text-xl font-semibold text-white pt-1">
          {title}
        </h2>
      </div>
      <div className="pl-12 text-white/60 leading-relaxed">{children}</div>
      <div className="mt-8 border-b border-white/5" />
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

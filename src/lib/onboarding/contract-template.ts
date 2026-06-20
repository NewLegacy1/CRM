export const ONBOARDING_AGREEMENT_VERSION = "1" as const;

export type OnboardingLineItem = {
  description: string;
  quantity: number;
  unit_amount: number;
};

export type OnboardingAgreementParams = {
  businessName: string;
  contactEmail: string;
  contactName?: string | null;
  lineItems: OnboardingLineItem[];
  currency: string;
  governingLawRegion?: string;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getOnboardingTotal(lineItems: OnboardingLineItem[]): number {
  return lineItems.reduce(
    (sum, row) => sum + row.quantity * row.unit_amount,
    0
  );
}

export function buildOnboardingAgreementSections(
  params: OnboardingAgreementParams
): { title: string; paragraphs: string[] }[] {
  const total = getOnboardingTotal(params.lineItems);
  const currency = params.currency.toLowerCase();
  const clientLabel = params.contactName?.trim()
    ? `${params.contactName.trim()} (${params.businessName})`
    : params.businessName;
  const region = params.governingLawRegion ?? "Ontario";

  const scopeLines = params.lineItems.map((item) => {
    const lineTotal = item.quantity * item.unit_amount;
    return `${item.description} — ${formatMoney(lineTotal, currency)}`;
  });

  return [
    {
      title: "Parties",
      paragraphs: [
        `This Website & Google Business Profile Services Agreement ("Agreement") is between New Legacy AI ("Provider") and ${clientLabel} ("Client"), contact email ${params.contactEmail}.`,
      ],
    },
    {
      title: "1. Scope of services",
      paragraphs: [
        "Provider will deliver the following for Client:",
        ...scopeLines.map((line) => `• ${line}`),
        "Custom landing page website includes layout, responsive design, and integration of Client-supplied or Provider-drafted copy as agreed during the project.",
        "Google Business Profile setup includes, where applicable: profile creation or claim assistance, verification support, business categories, hours, business description, upload of Client-supplied photos, and initial profile posts as agreed during setup.",
        "Unless agreed in writing, this does not include paid advertising, ongoing SEO retainers, multi-page expansion beyond one landing page, e-commerce, custom software, content photography, or third-party subscription fees (domain, hosting, etc.).",
      ],
    },
    {
      title: "2. Client responsibilities",
      paragraphs: [
        "Client will complete the onboarding form, provide accurate business information, upload requested assets, and respond within a reasonable time.",
        "Client will grant access needed for domain, hosting, and Google Business verification when requested.",
        "Delays caused by missing assets or Client non-response may extend the timeline.",
      ],
    },
    {
      title: "3. Timeline",
      paragraphs: [
        "Provider will use commercially reasonable efforts to complete the services within 2–4 weeks from (a) Client's acceptance of this Agreement and (b) receipt of full payment under Section 4.",
      ],
    },
    {
      title: "4. Fees & payment",
      paragraphs: [
        `Total project fee: ${formatMoney(total, currency)} (${scopeLines.join("; ")}).`,
        "Payment is due in full upfront. After Client submits this onboarding form and accepts this Agreement, Provider will issue a Stripe invoice by email. Work is scheduled to begin upon full payment.",
        "Late or unpaid invoices may delay or pause work.",
      ],
    },
    {
      title: "5. Revisions",
      paragraphs: [
        "Provider includes revision rounds as reasonably needed until Client is satisfied with the delivered landing page and Google Business Profile setup, provided revisions remain within the agreed scope. Material scope changes may require a separate quote.",
      ],
    },
    {
      title: "6. Intellectual property & license",
      paragraphs: [
        "Upon full payment, Client receives a non-exclusive license to use the delivered website and related assets for their business.",
        "Provider retains ownership of underlying code, frameworks, templates, tools, and pre-existing materials. Provider may reuse general techniques and non-client-specific components.",
        "Client represents that materials Client provides do not infringe third-party rights.",
      ],
    },
    {
      title: "7. Confidentiality",
      paragraphs: [
        "Each party will keep non-public business information shared for this project confidential, except as required to perform the services or by law.",
      ],
    },
    {
      title: "8. Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by applicable law, Provider's total liability arising from this Agreement is limited to the fees paid by Client for this project. Provider is not liable for indirect, incidental, or consequential damages, or for third-party platform outages (including Google or hosting providers).",
      ],
    },
    {
      title: "9. Termination",
      paragraphs: [
        "Either party may terminate if the other materially breaches and fails to cure within 14 days of written notice. If Client terminates after work has begun, fees for work completed to date are non-refundable. If Provider terminates without Client breach, Provider will refund any portion of fees for undelivered services.",
      ],
    },
    {
      title: "10. Governing law",
      paragraphs: [
        `This Agreement is governed by the laws of ${region}, Canada, without regard to conflict-of-law rules.`,
      ],
    },
    {
      title: "11. Electronic acceptance",
      paragraphs: [
        "By typing your full legal name and checking the acceptance box in the onboarding form, you agree to this Agreement as of the date of submission.",
      ],
    },
  ];
}

import type { Metadata } from "next";
import { ClientOnboardingWizard } from "@/components/marketing/onboarding/ClientOnboardingWizard";

export const metadata: Metadata = {
  title: "Project onboarding",
  description:
    "Review your agreement, share project details, upload assets, and complete onboarding with New Legacy AI.",
};

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function ClientOnboardingPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { preview: previewParam } = await searchParams;
  // Local dev: always allow click-through preview (even if link was already submitted)
  const preview =
    process.env.NODE_ENV === "development" || previewParam === "1";

  return <ClientOnboardingWizard token={token} preview={preview} />;
}

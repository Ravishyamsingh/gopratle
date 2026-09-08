import { Suspense } from 'react';
import { PostRequirementWizard } from '@/components/wizard/PostRequirementWizard';

export default function PostRequirementPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#070b14]" />}>
      <PostRequirementWizard />
    </Suspense>
  );
}

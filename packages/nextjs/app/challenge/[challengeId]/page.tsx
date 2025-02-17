import { SubmitChallengeClient } from "./_components/SubmitChallengeClient";

export default function ChallengePage({ params }: { params: { challengeId: string } }) {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <h1 className="text-center">The challenge ID is: {params.challengeId}</h1>
      <SubmitChallengeClient challengeId={params.challengeId} />
    </div>
  );
}

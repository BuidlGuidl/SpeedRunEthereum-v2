import Link from "next/link";

export function BuildIdeas() {
  return (
    <div>
      <p className="m-0 font-medium">
        Showcase your Ethereum builds and share them with the community! Get +5 XP for the first build you submit.
      </p>
      <p className="mt-2 mb-0">
        If you&apos;re just getting started or looking for your next idea, check out our{" "}
        <Link href="/build-prompts" className="link">
          AI-ready build prompts
        </Link>
        .
      </p>
    </div>
  );
}

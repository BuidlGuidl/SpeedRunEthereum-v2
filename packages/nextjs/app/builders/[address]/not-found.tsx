import { NotFound } from "~~/components/NotFound";

export default function NotFoundPage() {
  return (
    <NotFound
      heading="User Not Found"
      extraElement={
        <>
          <p className="mb-0">Double check the Ethereum address or ENS is correct in the URL</p>
        </>
      }
    />
  );
}

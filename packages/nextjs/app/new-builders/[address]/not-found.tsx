import { NotFound } from "~~/components/NotFound";

export default function NotFoundPage() {
  return (
    <NotFound
      heading="User Not Found"
      extraElement={
        <>
          <p className="mb-0">Double check the Ethereum address is correct in the URL</p>
          <p className="m-0">Make sure not to use an ENS address in the URL</p>
        </>
      }
    />
  );
}

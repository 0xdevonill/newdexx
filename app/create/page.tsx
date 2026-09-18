import { CreateForm } from "@/components/create-form";

export default function CreatePage() {
  return (
    <div className="app-page create-page">
      <div className="page-lead">
        <h1>Create a token</h1>
        <p>
          Name it, stamp a logo, pick a ticker. The factory deploys an ERC-20 and a constant-product
          bonding curve on Robinhood Chain. You can seed the first buy in the same transaction.
        </p>
      </div>
      <CreateForm />
    </div>
  );
}

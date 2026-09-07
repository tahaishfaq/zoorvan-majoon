import RecoveryForm from "@/components/forms/recovery-form";
export const metadata = { title: "Account recovery" };
export default function Page() {
  return (
    <div className="container section narrow">
      <h1>Forgot your password?</h1>
      <RecoveryForm />
    </div>
  );
}

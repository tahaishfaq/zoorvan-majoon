import RecoveryForm from "@/components/forms/recovery-form";
export const metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};
export default async function Page({ searchParams }) {
  const { token = "" } = await searchParams;
  return (
    <div className="container section narrow">
      <h1>A fresh start.</h1>
      <RecoveryForm token={typeof token === "string" ? token : ""} />
    </div>
  );
}

import AuthForm from "@/components/forms/auth-form";
export const metadata = { title: "Create an account" };
export default function Page() {
  return (
    <div className="container section">
      <AuthForm register />
    </div>
  );
}

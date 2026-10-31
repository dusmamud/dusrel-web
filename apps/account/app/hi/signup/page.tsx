import { Suspense } from "react";
import { SignupForm } from "../../_components/AuthForms";
export default function Page() { return <Suspense><SignupForm locale="hi" currentPath="/hi/signup" /></Suspense>; }

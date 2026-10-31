import { Suspense } from "react";
import { LoginForm } from "../../_components/AuthForms";
export default function Page() { return <Suspense><LoginForm locale="hi" currentPath="/hi/login" /></Suspense>; }

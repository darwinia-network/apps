import { useEffect, ReactNode } from "react";
import { useRouteError, Link } from "react-router-dom";

interface Props {
  title?: ReactNode;
  message?: ReactNode;
}

export function ErrorBoundary({ title = "Oops!", message = "Sorry, an unexpected error has occurred." }: Props) {
  const error = useRouteError();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col gap-5">
        <h3 className="text-bold text-base">{title}</h3>
        <span className="text-normal text-sm">{message}</span>
        <Link to="/">Home</Link>
      </div>
    </div>
  );
}

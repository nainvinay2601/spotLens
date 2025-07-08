"use client";
import { useClerk } from "@clerk/nextjs";
import { Button } from "../button";

export const SignUpButton = () => {
  const { openSignUp } = useClerk();

  return (
    <Button variant={"outline"} onClick={() => openSignUp()}>
      Sign Up{" "}
    </Button>
  );
};

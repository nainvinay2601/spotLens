"use client";
import { useAuth, UserButton } from "@clerk/nextjs";
import { SignInButton } from "./sign-in-button";

export const UserProfileButton = () => {
  const { isSignedIn } = useAuth();

  return isSignedIn ? <UserButton /> : <SignInButton />;
};

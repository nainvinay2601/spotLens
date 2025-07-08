import { SignedIn, SignedOut } from "@clerk/nextjs";
import { SignInButton } from "./ui/auth/sign-in-button";
import { SignUpButton } from "./ui/auth/sign-up-button";
import { UserProfileButton } from "./ui/auth/user-profile-button";

const Navbar = () => {
  return (
    <div>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <UserProfileButton />
      </SignedIn>
    </div>
  );
};

export default Navbar;

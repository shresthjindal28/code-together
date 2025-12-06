import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative font-medium text-sm uppercase tracking-wider overflow-hidden px-3 py-2 transition-all duration-300 group"
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <span
          className="absolute w-full h-full transform scale-0 group-hover:scale-100 transition-transform duration-500 ease-out"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255, 255, 0, 0.4) 0%, rgba(0, 255, 0, 0.4) 20%, rgba(255, 0, 0, 0.4) 40%, transparent 70%)",
            filter: "blur(15px)",
          }}
        ></span>
      </span>
    </Link>
  );
}

export function navbar() {
  return (
    <nav className="bg-black text-white p-4 h-16 flex justify-between items-center shadow-lg">
      <Link
        href="/"
        className="text-xl font-bold tracking-wider hover:text-[#6c47ff] transition duration-300"
      >
        AppLogo
      </Link>

      <div className="flex items-center gap-4">
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/pricing">Pricing</NavLink>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="relative overflow-hidden group transition duration-300 rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer bg-neutral-900 border border-neutral-700 text-white hover:text-white/80">
              <span className="relative z-10">Sign In</span>
              <span className="absolute inset-0 z-0 bg-transparent transition-all duration-700 group-hover:bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 opacity-0 group-hover:opacity-100 blur-lg rounded-full"></span>
            </button>
          </SignInButton>

          <SignUpButton>
            <button className="relative overflow-hidden group transition duration-300 rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer bg-[#6c47ff] text-ceramic-white hover:bg-[#5b38d4]">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}

export default navbar;
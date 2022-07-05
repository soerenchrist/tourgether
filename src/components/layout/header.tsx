import { Session } from "next-auth";
import Link from "next/link";

const Menu = () => {
  return (
    <div className="flex justify-start gap-4">
      <Link href="/tours">Tours</Link>
      <Link href="/stats">Stats</Link>
    </div>
  );
};


const Header = ({ session }: { session: Session | null }) => {
  return (
    <header className="bg-gray-700 text-white text-lg items-center pr-6 h-16 flex justify-between px-4">
      {session?.user ? <Menu /> : <div></div>}

      {session?.user?.email || (
        <Link href="/api/auth/signin">
          <div className="bg-blue-500 p-1 px-4 rounded-2xl">Sign in</div>
        </Link>
      )}
    </header>
  );
};

export default Header;
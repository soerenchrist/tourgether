import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

const UserDropdown: React.FC<{ session: Session }> = ({ session }) => {
  const router = useRouter();
  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  return (
    <Dropdown
      arrowIcon={false}
      inline={true}
      label={
        <Avatar
          alt="User settings"
          img={session.user!.image ?? undefined}
          rounded={true}
        />
      }
    >
      <Dropdown.Header>
        <span className="block text-sm">{session.user!.name}</span>
        <span className="block truncate text-sm font-medium">
          {session.user!.email}
        </span>
      </Dropdown.Header>
      <Dropdown.Item>Dashboard</Dropdown.Item>
      <Dropdown.Item>Settings</Dropdown.Item>
      <Dropdown.Item>Earnings</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
    </Dropdown>
  );
};

const Header = ({ session }: { session: Session | null }) => {
  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="/">
        <span className="text-xl font-bold cursor-pointer">
          Tour<span className="text-blue-500">gether</span>
        </span>
      </Navbar.Brand>
      <Navbar.Toggle />
      {!session?.user && (
        <div className="flex md:order-2">
            <Button onClick={() => signIn()}>Sign in</Button>
          <Navbar.Toggle />
        </div>
      )}

      {session?.user && (
        <div className="flex md:order-2">
          <UserDropdown session={session} />
        </div>
      )}
      <Navbar.Collapse>
        {session?.user && (
          <>
            <Link href="/dashboard">
              <span className="cursor-pointer">Dashboard</span>
            </Link>
            <Link href="/tours">
              <span className="cursor-pointer">My Tours</span>
            </Link>
            <Link href="/peaks">
              <span className="cursor-pointer">Peaks</span>
            </Link>
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;

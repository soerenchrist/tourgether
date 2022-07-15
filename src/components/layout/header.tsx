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

  const goTo = (route: string) => {
    router.push(route);
  }

  return (
    <Dropdown
      arrowIcon={false}
      inline={true}
      style={{zIndex: 900}}
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
        <span className="block truncate text-sm font-light">
          {session.user!.email}
        </span>
      </Dropdown.Header>
      <Dropdown.Item onClick={() => goTo("/dashboard")}>Dashboard</Dropdown.Item>
      <Dropdown.Item onClick={() => goTo("/tours")}>My Tours</Dropdown.Item>
      <Dropdown.Item onClick={() => goTo("/peaks")}>Peaks</Dropdown.Item>
      <Dropdown.Item onClick={() => goTo("/wishlist")}>Wishlist</Dropdown.Item>
      <Dropdown.Item onClick={() => goTo("/friends")}>Friends</Dropdown.Item>
      <Dropdown.Item onClick={() => goTo("/my-friend-requests")}>My Friend Requests</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
    </Dropdown>
  );
};

const Header = ({ session, isLoading }: { session: Session | null, isLoading: boolean }) => {
  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="/">
        <span className="text-xl font-bold cursor-pointer">
          Tour<span className="text-blue-500">gether</span>
        </span>
      </Navbar.Brand>
      {!session?.user && !isLoading && (
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
      <Navbar.Toggle />
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
            <Link href="/wishlist">
              <span className="cursor-pointer">Wishlist</span>
            </Link>
            <Link href="/friends">
              <span className="cursor-pointer">Friends</span>
            </Link>
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;

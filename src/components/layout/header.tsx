import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

const UserDropdown: React.FC<{ session: Session }> = ({ session }) => {
  const router = useRouter();
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const goTo = (route: string) => {
    router.push(route);
  };

  return (
    <Dropdown
      arrowIcon={false}
      inline={true}
      style={{ zIndex: 900 }}
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
      <Dropdown.Item onClick={() => goTo("/profile")}>Profile</Dropdown.Item>
      <Dropdown.Item onClick={() => goTo("/wishlist")}>My wish list</Dropdown.Item>
      <Dropdown.Item onClick={() => goTo("/friends")}>Friends</Dropdown.Item>
      <Dropdown.Item onClick={() => goTo("/my-friend-requests")}>
        Friend Requests
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
    </Dropdown>
  );
};

const Header = ({
  session,
  isLoading,
}: {
  session: Session | null;
  isLoading: boolean;
}) => {
  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="/">
        <span className="text-xl font-bold cursor-pointer">
          Tour<span className="text-blue-500">gether</span>
        </span>
      </Navbar.Brand>
      {!session?.user && !isLoading && (
        <div className="flex md:order-2">
          <Button
            onClick={() => signIn("auth0", { callbackUrl: "/onboarding" })}
          >
            Sign in
          </Button>
        </div>
      )}
      {session?.user && (
        <div className="flex md:order-2">
          <UserDropdown session={session} />
        </div>
      )}
      {session?.user && (
        <>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <div className="flex items-center gap-4">
              <Link href="/search">
                <Icon path={mdiMagnify} className="w-4 h-4 cursor-pointer" />
              </Link>
              <Link href="/feed">
                <span className="cursor-pointer">Feed</span>
              </Link>
              <Link href="/tours">
                <span className="cursor-pointer">Tours</span>
              </Link>
              <Link href="/peaks">
                <span className="cursor-pointer">Peaks</span>
              </Link>
              <Link href="/stats">
                <span className="cursor-pointer">Stats</span>
              </Link>
            </div>
          </Navbar.Collapse>
        </>
      )}
    </Navbar>
  );
};

export default Header;

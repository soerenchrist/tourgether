import { trpc } from "@/utils/trpc";
import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import { Avatar, Badge, Button, Dropdown, Navbar } from "flowbite-react";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

const FriendRequestsMenuItem = () => {
  const { data: count } = trpc.useQuery(["friends.count-friend-requests"]);

  return (
    <div className="flex gap-2">
      <span>Friend Requests</span>
      {count && count > 0 && <Badge color="failure">{count}</Badge>}
    </div>
  );
};

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
      <Dropdown.Item onClick={() => goTo("/wishlist")}>
        My wish list
      </Dropdown.Item>
      <Dropdown.Item onClick={() => goTo("/friends")}>Friends</Dropdown.Item>
      <Dropdown.Item onClick={() => goTo("/my-friend-requests")}>
        <FriendRequestsMenuItem />
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
    </Dropdown>
  );
};

const Header = ({ session }: { session: Session | null }) => {
  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="/">
        <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="logo" className="w-9 h-9" />
        <span className="text-xl font-bold cursor-pointer">
          Tour<span className="text-brand">gether</span>
        </span>
        </div>
      </Navbar.Brand>
      {!session?.user && (
        <div className="flex md:order-2">
          <span className="text-brand font-medium cursor-pointer hover:underline mr-4"
            onClick={() => signIn("auth0", { callbackUrl: "/onboarding" })}
          >
            Sign in
          </span>
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

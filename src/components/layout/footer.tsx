import { Footer } from "flowbite-react";

const FooterComponent = () => {
  return (
    <Footer container>
      <Footer.Copyright href="#" by="Tourgether" year={2022} />
      <Footer.LinkGroup>
        <Footer.Link href="https://planetscale.com">
          PlanetScale
        </Footer.Link>
        <Footer.Link href="https://hashnode.com">
          Hashnode
        </Footer.Link>
      </Footer.LinkGroup>
    </Footer>
  )
}

export default FooterComponent;
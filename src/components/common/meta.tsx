import Head from "next/head";

const Meta: React.FC<{ title?: string }> = ({ title }) => {
  return (
    <Head>
      <title>{title || "Tourgether"}</title>
      <meta
        name="description"
        content="Plan and manage your hiking tours together"
      />
      <link rel="icon" href="/logo.svg" />
    </Head>
  );
};

export default Meta;
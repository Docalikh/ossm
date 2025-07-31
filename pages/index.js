
import Head from 'next/head';
import OSCECase from '../components/OSCECase';

export default function Home() {
  return (
    <>
      <Head>
        <title>AMC OSCE Simulator</title>
      </Head>
      <OSCECase />
    </>
  );
}

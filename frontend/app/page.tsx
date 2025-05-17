import Image from "next/image";
import Header from "../components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center min-h-screen min-w-screen mt-20">
        <Image
          className=""
          src={"/images/jabnet-logo.webp"}
          priority
          alt="Jabnet logo"
          width={180}
          height={38}
          loading="eager"
        />
        <h3>Page Dashboard</h3>
      </main>
    </>
  );
}

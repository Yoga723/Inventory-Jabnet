import Image from "next/image";
import Header from "../components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center min-h-screen min-w-screen mt-20">
        <h3>Page Dashboard</h3>
      </main>
    </>
  );
}

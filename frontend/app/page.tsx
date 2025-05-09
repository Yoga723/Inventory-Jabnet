import Image from "next/image";
import Header from "../components/Header";

export default function Home() {
  return (
    <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center min-h-screen min-w-screen mt-20">
      <Header />
      <Image
        className=""
        src={"/images/jabnet-logo.webp"}
        priority
        alt="Jabnet logo"
        width={180}
        height={38}
        loading="eager"
      />
      <Image
        className=""
        src={
          "https://images.pexels.com/photos/31317409/pexels-photo-31317409/free-photo-of-serene-white-sands-in-new-mexico-s-desert.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        }
        alt="Jabnet logo"
        width={180}
        height={38}
        loading="eager"
      />
      <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
        <li className="mb-2 tracking-[-.01em]">
          Get started by editing{" "}
          <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
            app/page.tsx
          </code>
          .
        </li>
        <li className="tracking-[-.01em]">Save and see your changes instantly.</li>
      </ol>
    </main>
  );
}

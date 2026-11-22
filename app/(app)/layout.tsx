import { MobileNav } from "@/components/mobile-nav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="pb-28 md:pb-0">{children}</div>
      <MobileNav />
    </>
  );
}

import BottomNav from "@/components/bottom-nav";
import { ReactNode } from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

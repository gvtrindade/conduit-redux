import { ReactNode } from "react";

export default function BarLabel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <p className={className}>&#47;&#47; {children} &#47;&#47;</p>;
}

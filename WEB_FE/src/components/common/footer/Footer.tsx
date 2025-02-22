import React from "react";

export interface FooterProps {
  extraClassName?: string;
}
const Footer: React.FC<FooterProps> = ({
  extraClassName = "",
}: FooterProps) => {
  return (
    <div
      className={`max-width-full mt-4 flex h-10 w-full flex-col items-center bg-[var(--web-sash)] ${extraClassName}`}
    >
      <footer
        aria-label="Anika Pro."
        role="contentinfo"
        className="flex h-full items-center"
      >
        <span className="text-center text-sm text-primaryText">
          © {new Date().getFullYear()}. dattq0304.
        </span>
      </footer>
    </div>
  );
};

export default Footer;

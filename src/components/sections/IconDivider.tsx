import Image from 'next/image';

export default function IconDivider() {
  return (
    <div className="flex items-center justify-center py-4 bg-white">
      <div className="flex items-center gap-4">
        <div className="h-px w-24 bg-border" />
        <Image
          src="/logo-icon.svg"
          alt=""
          width={96}
          height={96}
          aria-hidden="true"
        />
        <div className="h-px w-24 bg-border" />
      </div>
    </div>
  );
}

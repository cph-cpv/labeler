type HeaderProps = {
  subtitle?: string;
  title: string;
};

function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="font-bold text-2xl" data-slot="header">
        {title}
      </h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}

export { Header };

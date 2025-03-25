export default function Header() {
  return (
    <div className="flex flex-col gap-8 items-center py-16">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Vibe Coding is the Future
      </h1>
      <p className="text-xl md:text-2xl text-center text-muted-foreground max-w-2xl">
        Your hub for the best vibe coder friendly resources
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-4" />
    </div>
  );
}

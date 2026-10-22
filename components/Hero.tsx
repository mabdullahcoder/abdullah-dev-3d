import HexCluster from "./HexCluster";

export default function Hero() {
  return (
    <section
      id="top"
      data-theme="light"
      className="relative h-svh min-h-[600px] md:flex md:items-center"
    >
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-ink/10 md:block" />

      <div className="flex h-full w-full flex-col justify-between px-gutter pb-[17svh] pt-[12svh] md:grid md:h-auto md:grid-cols-2 md:p-0">
        <div className="order-2 md:order-1 md:pl-gutter">
          <p className="body max-w-[300px]">
            We design immersive, motion-driven websites that command attention and guide
            users to act. Clean builds. Sharp strategy. Zero fluff.
          </p>
          <a href="#contact" className="btn btn-lime mt-10">
            Let&apos;s talk
          </a>
        </div>

        <h1 className="heading order-1 md:order-2 md:pl-[43px]">
          Your brand
          <br />
          <span className="text-lime-ink">Deserves</span> more
          <br />
          than a pretty
          <br />
          website.
        </h1>
      </div>

      <HexCluster
        seed={3}
        className="absolute bottom-[8%] left-[calc(13.9%-55px)] hidden w-[110px] md:block"
      />
    </section>
  );
}

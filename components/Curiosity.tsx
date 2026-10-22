import BarReveal from "./BarReveal";
import BlockReveal from "./BlockReveal";

export default function Curiosity() {
  return (
    <section
      data-theme="lime"
      className="relative z-10 bg-lime pb-[calc(var(--section-y)+var(--stair))] pt-section"
    >
      <div className="grid grid-cols-1 gap-8 px-gutter md:grid-cols-[64%_1fr] md:gap-0">
        <BlockReveal
          seed={23}
          block="black"
          className="heading relative z-[1]"
          lineClassName="md:whitespace-nowrap"
          lines={[
            ["Every", "work", "you"],
            ["See", "here", "started"],
            ["With", "curiosity"],
          ]}
        />

        <div className="md:pt-[calc(24.2vw+37px)]">
          <BarReveal color="#0b0b0b">
            <p className="body max-w-[420px]">
              Have an idea brewing? Let&apos;s turn that curiosity into something real.
            </p>
          </BarReveal>
          <div className="mt-8 md:mt-24">
            <a href="#contact" className="btn btn-dark">
              Make it real
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

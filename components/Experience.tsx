"use client";

import { MotionConfig } from "framer-motion";
import Curiosity from "./Curiosity";
import FeaturedWork from "./FeaturedWork";
import HeroServices from "./HeroServices";
import Loader from "./Loader";
import Manifesto from "./Manifesto";
import Nav from "./Nav";
import Process from "./Process";
import ScrollIndicator from "./ScrollIndicator";

export default function Experience() {
  return (
    <MotionConfig reducedMotion="user">
      <Loader />
      <Nav />
      <ScrollIndicator />
      {/* clip (not hidden) keeps sticky sections working while stopping sideways scroll */}
      <main className="overflow-x-clip">
        <HeroServices />
        <Process />
        <FeaturedWork />
        <Curiosity />
        <Manifesto />
      </main>
    </MotionConfig>
  );
}

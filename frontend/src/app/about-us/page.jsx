import Image from "next/image";
import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata = { title: "About Us — Crate" };

export default function AboutUsPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="About Crate"
      intro="Crate is a marketplace built on one idea: buying something online should feel as trustworthy as buying it in person."
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-line">
        <Image
          src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=1000&q=80"
          alt="A small warehouse team packing orders"
          fill
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-cover"
        />
      </div>
      <InfoSection title="What we do">
        <p>
          We connect independent sellers — from small home studios to growing regional brands — with
          customers looking for quality goods and dependable service. Every seller on Crate is
          verified before they can list a single product.
        </p>
      </InfoSection>
      <InfoSection title="What we stand for">
        <p>
          Trust, security, comfort and reliability aren't just words on a page for us — they shape how
          we build every feature, from secure checkout to transparent order tracking to accessible
          customer support.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

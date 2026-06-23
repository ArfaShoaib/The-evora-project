import type { Metadata } from "next";
import Image from "next/image";
import { getSiteSectionContent } from "@/lib/queries";

export const metadata: Metadata = {
  title: "About Us | EVORA",
  description: "Discover the story behind EVORA — timeless elegance for modern living.",
};

interface TeamMember {
  name: string;
  role: string;
  avatar_url: string;
}

interface ValueItem {
  title: string;
  description: string;
}

export default async function AboutPage() {
  const data = await getSiteSectionContent("about");

  const title = (data?.title as string) || "The Story of EVORA";
  const description = (data?.description as string) || "Born from a passion for timeless design and uncompromising quality, EVORA creates luxury fashion for the modern woman who values both elegance and authenticity.";
  const missionTitle = (data?.mission_title as string) || "Our Mission";
  const mission = (data?.mission as string) || "We believe luxury should be accessible, sustainable, and timeless.";
  const missionImage = (data?.mission_image as string) || "";
  const values = (data?.values as ValueItem[]) || [
    { title: "Timeless Design", description: "We create pieces that transcend trends, designed to be worn and loved for years." },
    { title: "Quality Craftsmanship", description: "Every stitch, every detail is executed with precision and care by skilled artisans." },
    { title: "Sustainable Luxury", description: "We are committed to ethical practices and sustainable materials wherever possible." },
  ];
  const teamTitle = (data?.team_title as string) || "The Team";
  const teamDescription = (data?.team_description as string) || "A small, dedicated team of designers, curators, and dreamers united by a shared love for beautiful fashion.";
  const team = (data?.team as TeamMember[]) || [
    { name: "Sarah Chen", role: "Founder & Creative Director", avatar_url: "" },
    { name: "Marcus Webb", role: "Head of Design", avatar_url: "" },
    { name: "Aisha Patel", role: "Brand Director", avatar_url: "" },
    { name: "James Liu", role: "Operations Lead", avatar_url: "" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-24">
        <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 sm:mb-24">
        <div className="aspect-[4/5] rounded-lg overflow-hidden">
          {missionImage ? (
            <Image
              src={missionImage}
              alt={missionTitle}
              fill
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src="/mockpic.webp"
              alt={missionTitle}
              fill
              unoptimized
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">{missionTitle}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {mission}
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-16 sm:mb-24">
        {values.map((value) => (
          <div key={value.title} className="text-center">
            <div className="w-12 h-0.5 bg-gold mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
              {value.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {value.description}
            </p>
          </div>
        ))}
      </div>

      {/* Team */}
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
          {teamTitle}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-12">
          {teamDescription}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name} className="flex flex-col items-center gap-3">
              {member.avatar_url ? (
                <Image
                  src={member.avatar_url}
                  alt={member.name}
                  width={80}
                  height={80}
                  unoptimized
                  className="size-20 rounded-full object-cover"
                />
              ) : (
                <div className="size-20 rounded-full bg-gradient-to-br from-muted to-border" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  title: string;
  questions: FaqItem[];
}

interface FaqPageData {
  title: string;
  subtitle: string;
  categories: FaqCategory[];
}

function FaqAccordion({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span className="text-sm font-medium text-foreground pr-4">{question}</span>
        <ChevronDown
          className={cn(
            "size-4 flex-shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

export function FaqPageClient({ data }: { data: FaqPageData }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="text-center mb-12">
        <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
          {data.title}
        </h1>
        <p className="text-muted-foreground">{data.subtitle}</p>
      </div>

      <div className="flex flex-col gap-10">
        {data.categories.map((section) => (
          <div key={section.title}>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
              {section.title}
            </h2>
            <div>
              {section.questions.map((item) => (
                <FaqAccordion key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
